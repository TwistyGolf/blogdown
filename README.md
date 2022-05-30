# Blogdown 
<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Electron_Software_Framework_Logo.svg/2048px-Electron_Software_Framework_Logo.svg.png" width=100>&nbsp;&nbsp;&nbsp;&nbsp;<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Typescript_logo_2020.svg/1200px-Typescript_logo_2020.svg.png" width=100>&nbsp;&nbsp;&nbsp;&nbsp;<img src="https://sass-lang.com/assets/img/styleguide/seal-color-aef0354c.png" width=100>

Blogdown is a developer-first blogging tool that is currently in development.

## How does it work?

Blogdown has two major systems, the Editor, and the Builder.

## The Editor
The Editor is a simple to use text editor built using Electron, that shows a live preview of your changes so you know exactly what to expect.
We support all of the common markdown syntax, with some extras thrown in to help with the various aspects blogging.

You build up your blog as a collection of markdown files, that you can manage using a project manager accessed in the sidebar.

## The Builder
As you make changes to your blog, you'll want to have an actual website to host somewhere, that's where the builder comes in.
The builder will look through your project structure, and construct a set of static CSS, HTMl, and JavaScript files containing your blog that you are free to host anywhere.

The builder is accessible through the command line, so you can hook it up to CI tools such as Github Actions, to automate the build/deploy steps.

## Styling
All of the styling provided out of the box is free to change. All of this can be done inside the editor. A live preview of your blog is shown to give some context while you make changes.
