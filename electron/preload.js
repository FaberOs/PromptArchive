const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  onThemeChange: (callback) => {
    const listener = (_event, theme) => callback(theme);
    ipcRenderer.on("theme-changed", listener);
    return () => ipcRenderer.removeListener("theme-changed", listener);
  },
  setTheme: (theme) => ipcRenderer.invoke("theme:set", theme),
});
