import { mainWindow, openModal } from "./index";
import * as fs from "fs";
const fsPromises = fs.promises;
import Store from "electron-store";
import { StoreFormat } from "./interfaces";
import { schema } from "./store";
import * as pathF from "path";
import chokidar from "chokidar";
import { Mutex } from "async-mutex";

import { ipcMain } from "electron";

const store = new Store<StoreFormat>({ schema: schema });

const configFileName = "blogdown.config.json";

interface ProjectConfig {
    projectName: string;
    title: string;
    icon: string;
    postsDirectory: string;
    imagesDirectory: string;
}

export interface Directory {
    path: string;
    files: string[];
    directories: Directory[];
    expanded: boolean;
}

class Project {
    path: string;
    config: ProjectConfig;
    directory: Directory;
    openDirectories: string[] = [];

    private fsWatcher: chokidar.FSWatcher;
    directoryMutex = new Mutex();
    constructor(path: string) {
        this.path = path;
    }

    async loadConfig() {
        const data = await fsPromises.readFile(
            pathF.join(this.path, configFileName)
        );
        this.config = <ProjectConfig>JSON.parse(data.toString());
    }

    async readDirectory() {
        this.directory = initDirectory(this.path);
        this.directory.expanded = true;
        await trawlDirectory(this.directory);
        printDirectory(this.directory);
        mainWindow.webContents.send("render-sidebar", this.directory);
        this.fsWatcher = chokidar.watch(this.path).on("all", async () => {
            await this.directoryMutex.runExclusive(async () => {
                this.directory = initDirectory(this.path);
                await trawlDirectory(this.directory);
                this.updateOpenDirectories(this.directory);
                mainWindow.webContents.send("render-sidebar", this.directory);
            });
        });
    }

    updateOpenDirectories(dir = this.directory) {
        if (this.openDirectories.includes(dir.path)) dir.expanded = true;
        for (const directory of dir.directories) {
            this.updateOpenDirectories(directory);
        }
    }

    closeProject() {
        this.fsWatcher.close();
    }
}

let currentProject: Project;

function initDirectory(path: string) {
    return <Directory>{
        path: path,
        files: [],
        directories: [],
        expanded: false,
    };
}

function printDirectory(dir: Directory, indent = 0): void {
    for (const directory of dir.directories) {
        if (directory.expanded) {
            console.log("expanded");
        }
        console.log(
            " ".repeat(indent),
            directory.path.substring(directory.path.lastIndexOf(pathF.sep))
        );
        printDirectory(directory, indent + 1);
    }
    for (const file of dir.files) {
        console.log(" ".repeat(indent), file);
    }
}

async function trawlDirectory(dir: Directory) {
    const files = await fsPromises.readdir(dir.path);
    for (const file of files) {
        const stats = await fsPromises.lstat(pathF.join(dir.path, file));
        if (stats.isDirectory()) {
            dir.directories.push(initDirectory(pathF.join(dir.path, file)));
        } else {
            dir.files.push(pathF.join(dir.path, file));
        }
    }
    for (const directory of dir.directories) {
        await trawlDirectory(directory);
    }
}

export function lastOpenProject(): string {
    console.log(store.get("lastOpenedProject", ""));
    return store.get("lastOpenedProject", "");
}

export async function openProject(dir: string, autoLoad = false) {
    if (await directoryIsProject(dir)) {
        openProjectProperly(dir);
    } else if (!autoLoad) {
        const response = openModal(
            "There isn't a project in this directory, would you like to make one?",
            ["Yes", "No"]
        );
        if (response == 0) {
            await intialiseProject(dir);
            await openProjectProperly(dir);
        } else {
            console.log("Don't make proj");
        }
    }
}

async function openProjectProperly(dir: string) {
    currentProject?.closeProject();
    const p = new Project(dir);
    await p.loadConfig();
    await p.readDirectory();
    store.set("lastOpenedProject", dir);
    currentProject = p;
}

async function directoryIsProject(dir: string) {
    try {
        const files = await fsPromises.readdir(dir);
        if (files.includes(configFileName)) {
            // Verify config file first
            return true;
        }
    } catch {
        return false;
    }
}

const exampleConfig = `{
	"projectName": "example",
	"title": "Blog Name",
	"postsDirectory": "posts",
	"imagesDirectory": "img",
	"icon": "favicon.ico"
}`;

const examplePost = `
## This is a post in Blogdown
### 😎 Emoji's are supported 😎
You have access to all the common markdown syntax
Such as:
- *italtics*

- **bold**

- ***bold italtics***

- ~~strikethrough~~

- \`inline code blocks\`

- \`\`\`js
  let x = "Styled code blocks"
  // These are multiline
  \`\`\`
You can also resize the preview window by dragging |

<---------------------------------------------------

## Horizontal rules
---
`;

async function intialiseProject(dir: string) {
    await fsPromises.writeFile(pathF.join(dir, configFileName), exampleConfig);
    await fsPromises.mkdir(pathF.join(dir, "posts"));
    await fsPromises.writeFile(
        pathF.join(dir, "posts", "example.md"),
        examplePost
    );
}

ipcMain.on("load-file-contents", async (event, file: string) => {
    const fileContent = await fsPromises.readFile(file);
    event.sender.send("file-contents", fileContent.toString());
});

ipcMain.on("save-file", async (event, file: string, contents: string) => {
    await fsPromises.writeFile(file, contents);
});

ipcMain.on("open-directory", (event, path) => {
    if (currentProject.openDirectories.includes(path)) {
        const index = currentProject.openDirectories.indexOf(path);
        currentProject.openDirectories.splice(index, 1);
    } else {
        currentProject.openDirectories.push(path);
    }
});
