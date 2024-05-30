const { contextBridge, ipcRenderer } = require("electron/renderer");

contextBridge.exposeInMainWorld("electronAPI", {
  onPingUpdate: (callback) => {
    ipcRenderer.on("ping-update", (_event, value) => callback(value));
  },
});
