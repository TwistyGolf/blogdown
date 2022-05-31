import * as CodeMirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "./scss/index.scss";
import "./scss/colours.scss";
import "codemirror/mode/markdown/markdown";
import "codemirror/theme/darcula.css";
import "codemirror/mode/xml/xml";
import "codemirror/mode/javascript/javascript";
import "markdown-it-json";

import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import electron, { ipcRenderer } from "electron";
import { Directory } from "./projectManager";

const ipc = electron.ipcRenderer;

let currentMouseX = 0;
let draggingPreview = false;
let draggingSidebar = false;

let currentSidebarWidth = 170;
let currentPreviewWidth = 300;

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
    if (
        currentMouseX > sidebarMinWidth / 2 &&
        currentMouseX <= sidebarMinWidth
    ) {
        currentSidebarWidth = sidebarMinWidth;
    } else if (currentMouseX > sidebarMinWidth) {
        currentSidebarWidth = currentMouseX - 2.5;
    } else {
        currentSidebarWidth = sidebarHiddenWidth;
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

window.addEventListener("DOMContentLoaded", () => {
    const previewDragger = document.getElementById("preview-drag");
    const sidebarDragger = document.getElementById("sidebar-drag");

    sidebar = document.getElementById("sidebar");
    previewWindow = document.getElementById("preview");
    editor = document.getElementById("editor");

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

    document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.key === "s") {
            // Prevent the Save dialog to open
            e.preventDefault();
            // Place your code here
            saveFile();
        }
    });

    codeEditor.on("change", (x) => {
        document.getElementById("editor-header-title").textContent =
            (codeEditor.getValue() != currentFileInitialContents ? "⬤ " : "") +
            formatFileName(currentFile);
        if (currentFileExtension == "md" || currentFileExtension == "txt") {
            document.getElementById("preview-content").innerHTML = md.render(
                x.getValue()
            );
        } else {
            document.getElementById("preview-content").innerHTML = "";
        }
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
    ipcRenderer.on("render-sidebar", (event, args: Directory) => {
        currentDirectory = args;
        renderSidebar();
    });

    ipcRenderer.on("file-contents", (event, args) => {
        codeEditor.setOption("mode", "json");
        codeEditor.setValue(args);
        currentFileInitialContents = args;
        document.getElementById("editor-header-title").textContent =
            formatFileName(currentFile);
    });
    sidebarFiles = document.getElementById("sidebar-files");
});

let currentDirectory: Directory;
let currentFile: string;
let currentFileElement: HTMLElement;
let currentFileInitialContents: string;
let currentFileExtension: string;

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
            renderFile(file, indent);
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
    dirEl.addEventListener("click", () => {
        dir.expanded = !dir.expanded;
        ipcRenderer.send("open-directory", dir.path);
        renderSidebar();
    });
    sidebarFiles.appendChild(dirEl);
}

function formatFileName(file: string) {
    return file.substring(
        //TODO: Path sep
        file.lastIndexOf("\\") + 1
    );
}

function getExtension(file: string) {
    return file.substring(file.lastIndexOf(".") + 1);
}

const allowedExtensions = ["txt", "md", "json"];

function renderFile(file: string, indent = 0) {
    const dirEl = document.createElement("div");
    dirEl.classList.add("directory-entry");
    dirEl.textContent = " ".repeat(indent) + formatFileName(file);
    if (file == currentFile) {
        currentFileElement = dirEl;
        currentFileElement.classList.add("opened");
    }
    dirEl.addEventListener("click", () => {
        if (allowedExtensions.includes(getExtension(file))) {
            if (currentFileElement != null) {
                currentFileElement.classList.remove("opened");
            }
            currentFile = file;
            currentFileExtension = getExtension(file);
            currentFileElement = dirEl;
            currentFileElement.classList.add("opened");
            openFile(file);
        }
    });
    sidebarFiles.appendChild(dirEl);
}
function saveFile() {
    ipcRenderer.send("save-file", currentFile, codeEditor.getValue());
    document.getElementById("editor-flasher").classList.add("flash");
    setTimeout(() => {
        document.getElementById("editor-flasher").classList.remove("flash");
    }, 500);
}

function openFile(file: string) {
    ipcRenderer.send("load-file-contents", file);
}
