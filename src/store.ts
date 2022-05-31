import { Schema } from "electron-store";
import { StoreFormat } from "./interfaces";

export const schema: Schema<StoreFormat> = {
    lastOpenedProject: {
        type: "string",
    },
};
