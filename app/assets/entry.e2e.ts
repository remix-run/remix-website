import { startApp } from "./start.ts";

let app = startApp();

await app.ready();

document.documentElement.dataset.remixReady = "true";
