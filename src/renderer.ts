import * as CodeMirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "./scss/index.scss";
import "./scss/colours.scss";
import "codemirror/mode/markdown/markdown";
import "codemirror/theme/darcula.css";
import "codemirror/mode/xml/xml";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/css/css";
import "markdown-it-json";

import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import electron, { ipcRenderer } from "electron";
import { Directory } from "./projectManager";
import { IDictonary } from "./interfaces";
import { compile } from "sass";
import { editorTabTemplate, examplePostTemplate } from "./templates";
const ipc = electron.ipcRenderer;

let currentMouseX = 0;
let draggingPreview = false;
let draggingSidebar = false;

let currentSidebarWidth = 170;
let currentPreviewWidth = 500;

const sidebarHiddenWidth = 10;
const sidebarMinWidth = 150;

const previewHiddenWidth = 10;
const previewMinWidth = 150;

let previewWindow: HTMLElement;
let sidebar: HTMLElement;
let editor: HTMLElement;
let sidebarFiles: HTMLElement;

let codeEditor: CodeMirror.EditorFromTextArea;

function updateWindowSizes() {
    previewWindow.style.width = currentPreviewWidth + "px";
    sidebar.style.width = currentSidebarWidth + "px";
    editor.style.width =
        window.innerWidth - (currentPreviewWidth + currentSidebarWidth) + "px";
}

function resizeSidebar() {
    const shiftedMouse = currentMouseX - 2.5;
    if (shiftedMouse > sidebarMinWidth / 2 && shiftedMouse <= sidebarMinWidth) {
        currentSidebarWidth = sidebarMinWidth;
        document.getElementById("sidebar-files").style.display = "inherit";
        document.getElementById("sidebar-header-text").style.display =
            "inherit";
    } else if (shiftedMouse > sidebarMinWidth) {
        currentSidebarWidth = shiftedMouse;
        document.getElementById("sidebar-files").style.display = "inherit";
        document.getElementById("sidebar-header-text").style.display =
            "inherit";
    } else {
        currentSidebarWidth = sidebarHiddenWidth;
        document.getElementById("sidebar-files").style.display = "none";
        document.getElementById("sidebar-header-text").style.display = "none";
    }
}

function resizePreview() {
    currentPreviewWidth = window.innerWidth - currentMouseX - 2.5;
    const distFromRight = window.innerWidth - currentMouseX;

    if (
        distFromRight > previewMinWidth / 2 &&
        distFromRight <= previewMinWidth
    ) {
        currentPreviewWidth = previewMinWidth;
    } else if (distFromRight > previewMinWidth) {
        currentPreviewWidth = distFromRight - 2.5;
    } else {
        currentPreviewWidth = previewHiddenWidth;
    }
}
const md = new MarkdownIt({
    highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(str, {
                    language: lang,
                    ignoreIllegals: true,
                }).value;
            } catch (__) {
                return "";
            }
        }

        return "";
    },
});

let preview: ShadowRoot;

function createPreview() {
    const new_div = document.createElement("div"),
        shadow = new_div.attachShadow({ mode: "open" });

    new_div.style.all = "initial";
    new_div.style.display = "flex";

    preview = shadow;
    document.getElementById("preview-content").appendChild(new_div);
}

function getPreviewContent(markdown: string) {
    return `<style>${currentCss}</style><body><div id="content"><div id="post">${md.render(
        markdown
    )}</div></div></body>`;
}

let currentCss: string;

window.addEventListener("DOMContentLoaded", () => {
    const previewDragger = document.getElementById("preview-drag");
    const sidebarDragger = document.getElementById("sidebar-drag");

    sidebar = document.getElementById("sidebar");
    previewWindow = document.getElementById("preview");
    editor = document.getElementById("editor");
    createPreview();

    previewDragger.addEventListener(
        "mouseup",
        (e) => {
            e.stopPropagation();
            e.stopImmediatePropagation();
        },
        false
    );
    sidebarDragger.addEventListener(
        "mouseup",
        (e) => {
            e.stopPropagation();
            e.stopImmediatePropagation();
        },
        false
    );

    updateWindowSizes();

    document.addEventListener("mousemove", (e) => {
        currentMouseX = e.pageX;

        if (draggingPreview) {
            resizePreview();
        }

        if (draggingSidebar) {
            resizeSidebar();
        }
        updateWindowSizes();
    });

    document.addEventListener("mouseup", () => {
        draggingPreview = false;
        draggingSidebar = false;
        previewDragger.style.pointerEvents = "";
        sidebarDragger.style.pointerEvents = "";
    });

    previewDragger.addEventListener("mousedown", (e) => {
        draggingPreview = true;
        previewDragger.style.pointerEvents = "none";
        e.preventDefault();
    });

    sidebarDragger.addEventListener("mousedown", (e) => {
        draggingSidebar = true;
        sidebarDragger.style.pointerEvents = "none";
        e.preventDefault();
    });

    codeEditor = CodeMirror.fromTextArea(
        document.getElementById("editor-textarea") as HTMLTextAreaElement,
        {
            lineNumbers: true,
            lineWrapping: true,
            theme: "darcula",
            mode: "markdown",
        }
    );

    document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.key === "s") {
            // Prevent the Save dialog to open
            e.preventDefault();
            // Place your code here
            fileManager.saveCurrentFile();
        }
    });

    codeEditor.on("change", (x) => {
        onCodeChanged(x);
    });

    document.getElementById("close").addEventListener("click", () => {
        window.close();
    });

    document.getElementById("minimise").addEventListener("click", () => {
        ipc.send("minimise");
    });

    document.getElementById("restore").addEventListener("click", () => {
        ipc.send("restore");
    });

    document.getElementById("file").addEventListener("click", () => {
        ipc.send("selectProject");
    });

    ipcRenderer.on("open-modal", (event, args) => {
        alert(args);
    });

    ipcRenderer.on("project-loaded", (event, dir: Directory) => {
        currentDirectory = dir;
        ipcRenderer.send("request-css");
    });

    ipcRenderer.on("render-sidebar", (event, dir: Directory) => {
        currentDirectory = dir;
        renderSidebar();
    });

    ipcRenderer.on("css-content", (event, css: string) => {
        currentCss = css;
        onCodeChanged(codeEditor);
    });

    fileManager.addFileCb = onFileOpened;

    fileManager.fileSwitchedCb = onFileSwitched;

    fileManager.fileClosedCb = onFileClosed;

    fileManager.allFilesClosedCb = onAllFilesClosed;

    fileManager.fileEditedStateCb = onFileEditedChanged;
    ipcRenderer.on("file-contents", (event, file, content) => {
        fileManager.openFile(file, content);
    });
    ipcRenderer.send("load-last-project");
    sidebarFiles = document.getElementById("sidebar-files");
});

function onCodeChanged(x: CodeMirror.Editor) {
    if (fileManager.currentlyOpenFile != null) {
        fileManager.updateFileContents(
            fileManager.currentlyOpenFile,
            x.getValue()
        );
        if (previewFormats.includes(fileManager.currentFileExtension())) {
            if (fileManager.currentFileExtension() === "css") {
                currentCss = x.getValue();
                preview.innerHTML = getPreviewContent(examplePostTemplate);
            } else {
                preview.innerHTML = getPreviewContent(x.getValue());
            }
        } else {
            preview.innerHTML = "";
        }
    } else {
        preview.innerHTML = getPreviewContent(x.getValue());
    }
}

const previewFormats = ["", "md", "txt", "css"];

const formatMapper = <IDictonary<string>>{
    md: "markdown",
    txt: "markdown",
    json: "json",
    css: "css",
};

class OpenedFile {
    path: string;
    loaded: boolean;
    initalContent: string;
    edited: boolean;
    element: HTMLElement;
    currentContent: string;
    extension: string;
    undoHistory: string;

    constructor(path: string) {
        this.path = path;
        this.loaded = false;
        this.edited = false;
        this.initalContent = "";
        this.extension = getExtension(this.path);
    }
}

class FileManager {
    openedFiles: Map<string, OpenedFile> = new Map<string, OpenedFile>();
    addFileCb: (openedFile: OpenedFile) => void;
    fileSwitchedCb: (file: OpenedFile, oldFile: OpenedFile) => void;
    fileClosedCb: (file: OpenedFile) => void;
    fileEditedStateCb: (file: OpenedFile) => void;
    allFilesClosedCb: () => void;
    currentlyOpenFile: OpenedFile;

    currentFileExtension() {
        return getExtension(this.currentlyOpenFile.path);
    }

    isFileOpen(file: string) {
        return this.openedFiles.has(file);
    }

    openFile(file: string, content: string) {
        console.log("Opening ", file);
        const openedFile = new OpenedFile(file);
        openedFile.initalContent = content;
        openedFile.currentContent = content;
        this.openedFiles.set(file, openedFile);
        this.currentlyOpenFile = openedFile;
        this.addFileCb(openedFile);
    }

    switchFile(file: string) {
        if (this.isFileOpen(file)) {
            const openedFile = this.openedFiles.get(file);
            const oldFile = this.currentlyOpenFile;
            this.currentlyOpenFile = openedFile;
            this.fileSwitchedCb(openedFile, oldFile);
        }
    }

    closeFile(file: OpenedFile) {
        this.openedFiles.delete(file.path);
        if (this.currentlyOpenFile == file) {
            console.log("switching to old file");
            const newFile = this.openedFiles.keys().next().value;
            if (newFile == undefined) {
                this.allFilesClosedCb();
                this.currentlyOpenFile = null;
            } else {
                this.switchFile(newFile);
            }
        }
        this.fileClosedCb(file);
    }

    updateFileContents(file: OpenedFile, content: string) {
        file.currentContent = content;
        file.edited = file.currentContent != file.initalContent;
        this.fileEditedStateCb(file);
    }

    saveCurrentFile() {
        const file = this.currentlyOpenFile;
        if (file == null) {
            const currentText = codeEditor.getValue();
            let fileName = currentText.split("\n")[0];
            if (fileName == "") fileName = "untitledPost";
            console.log(fileName);
            ipcRenderer.send("create-post", fileName, currentText);
            return;
        }

        if (!file.edited) {
            return;
        }

        ipcRenderer.send("save-file", file.path, file.currentContent);
        ipcRenderer.once("file-saved", (event, filePath, contents) => {
            file.initalContent = contents;
            file.edited = false;
            file.currentContent = contents;
            this.fileEditedStateCb(file);
            document.getElementById("editor-flasher").classList.add("flash");
            setTimeout(() => {
                document
                    .getElementById("editor-flasher")
                    .classList.remove("flash");
            }, 500);
        });
    }
}

const fileManager: FileManager = new FileManager();

function openFile(file: string) {
    if (fileManager.isFileOpen(file)) {
        fileManager.switchFile(file);
        return;
    }
    ipcRenderer.send("load-file-contents", file);
}

function onFileOpened(file: OpenedFile) {
    file.element = createEditorTabElement(file);
    onFileSwitched(file, fileManager.currentlyOpenFile);
}

function onFileClosed(file: OpenedFile) {
    const el = file.element;
    renderSidebar();
    el.remove();
}

function onAllFilesClosed() {
    codeEditor.setValue("");
}

function onFileEditedChanged(file: OpenedFile) {
    if (file.edited) {
        file.element.classList.add("edited");
    } else {
        file.element.classList.remove("edited");
    }
}

function createEditorTabElement(file: OpenedFile) {
    const tabContainer = document.getElementById("editor-tabs");
    const tab = editorTabTemplate();
    const tabIcon = tab.querySelector(".tab-icon>img") as HTMLImageElement;
    tabIcon.src = `img/icons/${getExtension(file.path)}.png`;

    tab.querySelector(".tab-text").textContent = formatFileName(file.path);

    tab.addEventListener("click", () => {
        fileManager.switchFile(file.path);
    });

    tab.querySelector(".tab-close").addEventListener("click", () => {
        fileManager.closeFile(file);
        fileManager.switchFile(file.path);
    });

    tabContainer.appendChild(tab);
    return tab;
}

function onFileSwitched(file: OpenedFile, oldFile: OpenedFile) {
    if (oldFile != null) {
        oldFile.undoHistory = codeEditor.getHistory();
    }
    codeEditor.setOption("mode", formatMapper[file.extension]);
    codeEditor.setValue(file.currentContent);
    if (file.undoHistory == null || file.undoHistory == "") {
        codeEditor.clearHistory();
    } else {
        codeEditor.setHistory(file.undoHistory);
    }
    fileManager.openedFiles.forEach((file) => {
        file.element.classList.remove("selected");
    });
    file.element.classList.add("selected");
    if (file.extension != "css") {
        ipcRenderer.send("request-css");
    }
    renderSidebar();
}

let currentDirectory: Directory;

function renderSidebar() {
    sidebarFiles.replaceChildren();
    renderDirectory(currentDirectory);
}

function renderDirectory(dir: Directory, indent = 0) {
    createDirectoryElement(dir, indent);
    if (dir.expanded) {
        for (const directory of dir.directories) {
            renderDirectory(directory, indent + 1);
        }
        for (const file of dir.files) {
            renderFileDirectoryEntry(file, indent);
        }
    }
}

function createDirectoryElement(dir: Directory, indent = 0) {
    const dirEl = document.createElement("div");
    dirEl.classList.add("directory-entry");
    if (indent == 0) {
        dirEl.style.fontWeight = "bold";
    }
    dirEl.textContent =
        " ".repeat(indent) +
        (dir.expanded ? "˅ " : "> ") +
        formatFileName(dir.path);
    dirEl.addEventListener("contextmenu", () => {
        ipcRenderer.send("dir-context", dir);
    });
    dirEl.addEventListener("click", () => {
        dir.expanded = !dir.expanded;
        ipcRenderer.send("open-directory", dir.path);
        renderSidebar();
    });
    sidebarFiles.appendChild(dirEl);
}

function formatFileName(file: string) {
    if (file == "" || file == null) return file;
    return file.substring(
        //TODO: Path sep
        file.lastIndexOf("\\") + 1
    );
}

function getExtension(file: string) {
    return file.substring(file.lastIndexOf(".") + 1);
}

const allowedExtensions = ["txt", "md", "json", "css", "js"];

function renderFileDirectoryEntry(file: string, indent = 0) {
    const fileEl = document.createElement("div");
    fileEl.classList.add("directory-entry");
    fileEl.textContent = " ".repeat(indent) + "- " + formatFileName(file);
    if (fileManager.currentlyOpenFile != null) {
        if (file == fileManager.currentlyOpenFile.path) {
            fileEl.classList.add("opened");
        }
    }
    fileEl.addEventListener("contextmenu", () => {
        ipcRenderer.send("file-context", file);
    });
    fileEl.addEventListener("click", () => {
        if (allowedExtensions.includes(getExtension(file))) {
            openFile(file);
        }
    });
    sidebarFiles.appendChild(fileEl);
}
