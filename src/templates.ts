export function editorTabTemplate() {
    const tab = document.createElement("div");
    tab.classList.add("editor-tab");
    const icon = document.createElement("div");
    icon.classList.add("tab-icon");
    const iconImg = document.createElement("img");
    icon.appendChild(iconImg);
    tab.appendChild(icon);
    const tabText = document.createElement("div");
    tabText.classList.add("tab-text");
    tab.appendChild(tabText);
    const tabEdited = document.createElement("div");
    tabEdited.classList.add("tab-edited");
    tabEdited.textContent = "⬤";
    tab.appendChild(tabEdited);
    const close = document.createElement("div");
    close.classList.add("tab-close");
    const closeImg = document.createElement("img");
    closeImg.src = `img/icons/close.png`;
    close.appendChild(closeImg);
    tab.appendChild(close);
    return tab;
}
