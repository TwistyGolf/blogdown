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

export const examplePostTemplate = `
## This is a post in Blogdown
### 😎 Emoji's are supported 😎
You have access to all the common markdown syntax
Such as:
- *italtics*

- **bold**

- ***bold italtics***

- ~~strikethrough~~

- Double backticks for \`inline code blocks\`

- \`\`\`js
  let x = "Styled code blocks"
  // These are multiline
  \`\`\`
  
## Horizontal rules
---
`;

export const cssTemplate = `
/*Font import*/

@import url('https://fonts.googleapis.com/css2?family=Fira+Code&display=swap');

/*This is the main container*/
#content
{
	
 	font-family: "Fira Code";
}

#post
{
 	color: #bbb;
 	padding-left: 1em;
 	padding-right: 1em;
}

code {
    font-family: "Fira Code";
    background-color: #222;
    border: black solid 1px;
    border-radius: 4px;
    padding: 2px;
}

pre > code {
    display: block;
    padding: 6px;
}

/*CODE HIGHLIGHTING STYLE*/

/*!
Theme: GitHub Dark
Description: Dark theme as seen on github.com
Author: github.com
Maintainer: @Hirse
Updated: 2021-05-15

Outdated base version: https://github.com/primer/github-syntax-dark
Current colors taken from GitHub's CSS
*/

.hljs {
    color: #c9d1d9;
    background: #0d1117;
}

.hljs-doctag,
.hljs-keyword,
.hljs-meta .hljs-keyword,
.hljs-template-tag,
.hljs-template-variable,
.hljs-type,
.hljs-variable.language_ {
    /* prettylights-syntax-keyword */
    color: #ff7b72;
}

.hljs-title,
.hljs-title.class_,
.hljs-title.class_.inherited__,
.hljs-title.function_ {
    /* prettylights-syntax-entity */
    color: #d2a8ff;
}

.hljs-attr,
.hljs-attribute,
.hljs-literal,
.hljs-meta,
.hljs-number,
.hljs-operator,
.hljs-variable,
.hljs-selector-attr,
.hljs-selector-class,
.hljs-selector-id {
    /* prettylights-syntax-constant */
    color: #79c0ff;
}

.hljs-regexp,
.hljs-string,
.hljs-meta .hljs-string {
    /* prettylights-syntax-string */
    color: #a5d6ff;
}

.hljs-built_in,
.hljs-symbol {
    /* prettylights-syntax-variable */
    color: #ffa657;
}

.hljs-comment,
.hljs-code,
.hljs-formula {
    /* prettylights-syntax-comment */
    color: #8b949e;
}

.hljs-name,
.hljs-quote,
.hljs-selector-tag,
.hljs-selector-pseudo {
    /* prettylights-syntax-entity-tag */
    color: #7ee787;
}

.hljs-subst {
    /* prettylights-syntax-storage-modifier-import */
    color: #c9d1d9;
}

.hljs-section {
    /* prettylights-syntax-markup-heading */
    color: #1f6feb;
    font-weight: bold;
}

.hljs-bullet {
    /* prettylights-syntax-markup-list */
    color: #f2cc60;
}

.hljs-emphasis {
    /* prettylights-syntax-markup-italic */
    color: #c9d1d9;
    font-style: italic;
}

.hljs-strong {
    /* prettylights-syntax-markup-bold */
    color: #c9d1d9;
    font-weight: bold;
}

.hljs-addition {
    /* prettylights-syntax-markup-inserted */
    color: #aff5b4;
    background-color: #033a16;
}

.hljs-deletion {
    /* prettylights-syntax-markup-deleted */
    color: #ffdcd7;
    background-color: #67060c;
}

`;
