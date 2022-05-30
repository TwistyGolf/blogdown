import * as CodeMirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "./index.scss";
import "codemirror/mode/markdown/markdown.js";
import "codemirror/theme/darcula.css";
import "codemirror/mode/xml/xml";

import MarkdownIt from "markdown-it";
import hljs from "highlight.js";

let currentMouseX = 0;
let draggingPreview = false;
let draggingSidebar = false;

window.addEventListener("DOMContentLoaded", () => {
    const previewDragger = document.getElementById("preview-drag");
    const sidebarDragger = document.getElementById("sidebar-drag");
    const sidebar = document.getElementById("sidebar");
    const previewWindow = document.getElementById("preview");
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
    document.addEventListener("mousemove", (e) => {
        currentMouseX = e.pageX;
        if (draggingPreview) {
            previewWindow.style.width =
                (window.innerWidth - currentMouseX - 10).toString() + "px";
        }
        if (draggingSidebar) {
            sidebar.style.width = currentMouseX + "px";
        }
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
});
