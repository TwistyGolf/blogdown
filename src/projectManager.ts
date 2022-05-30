import { openModal } from "./index";

export function openProject(dir: string) {
    const response = openModal(
        "There isn't a project in this directory, would you like to make one?",
        ["Yes", "No"]
    );
    if (response == 0) {
        console.log("Make proj");
    } else {
        console.log("Don't make proj");
    }
}
