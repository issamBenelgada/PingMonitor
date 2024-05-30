const { app, BrowserWindow } = require("electron/main");
const { dialog } = require("electron");

const index = require("./index.js");

const path = require("node:path");

const createWindow = (x) => {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  x.on((t) => {
    win.webContents.send("ping-update", t);
  });

  win.loadFile("index.html");
};

app.whenReady().then(() => {
  try {
    const x = index.createMonitor(console.log);
    createWindow(x);
  } catch (e) {
    console.log(e);
    dialog.showErrorBox("Error", e.toString());
    app.quit();
  }
});
