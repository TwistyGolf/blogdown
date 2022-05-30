import * as CodeMirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "./index.scss";
import "./colours.scss";
import "codemirror/mode/markdown/markdown.js";
import "codemirror/theme/darcula.css";
import "codemirror/mode/xml/xml";

import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import electron, { ipcRenderer } from "electron";
const ipc = electron.ipcRenderer;

let currentMouseX = 0;
let draggingPreview = false;
let draggingSidebar = false;

window.addEventListener("DOMContentLoaded", () => {
    const previewDragger = document.getElementById("preview-drag");
    const sidebarDragger = document.getElementById("sidebar-drag");
    const sidebar = document.getElementById("sidebar");
    const previewWindow = document.getElementById("preview");
    const editor = document.getElementById("editor");
    console.log(previewWindow);
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
    let currentSidebarWidth = 150;
    let currentPreviewWidth = 300;

    const sidebarHiddenWidth = 10;
    const sidebarMinWidth = 150;

    const previewHiddenWidth = 10;
    const previewMinWidth = 150;

    previewWindow.style.width = currentPreviewWidth + "px";
    sidebar.style.width = currentSidebarWidth + "px";

    document.addEventListener("mousemove", (e) => {
        currentMouseX = e.pageX;

        if (draggingPreview) {
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

        if (draggingSidebar) {
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

        previewWindow.style.width = currentPreviewWidth + "px";
        sidebar.style.width = currentSidebarWidth + "px";
        editor.style.width =
            window.innerWidth -
            (currentPreviewWidth + currentSidebarWidth) +
            "px";
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

    const cm = CodeMirror.fromTextArea(
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
    cm.on("change", (x) => {
        document.getElementById("preview-content").innerHTML = md.render(
            x.getValue()
        );
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
});
