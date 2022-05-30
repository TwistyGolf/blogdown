# Blogdown 
Blogdown is a developer-first blogging tool that is currently in development.

## How does it work?

Blogdown has two major systems, the Editor, and the Builder.

## The Editor
The Editor is a simple to use text editor built using Electron, that shows a live preview of your changes so you know exactly what to expect.
We support all of the common markdown syntax, with some extras thrown in to help with the various aspects blogging.

You build up your blog as a collection of markdown files, that you can manage using a project manager accessed in the sidebar.

## The Builder
As you make changes to your blog, you'll want to have an actual website to host somewhere, that's where the builder comes in.
The builder will look through your project structure, and construct a fully functional website that you are free to host anywhere.
The builder is also accessible through the command line, so you can hook it up to CI tools such as Github Actions, to automate the build/deploy steps.

