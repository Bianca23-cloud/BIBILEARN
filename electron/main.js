// Fenêtre de bureau BIBILEARN (Windows 11 et Linux)
const { app, BrowserWindow, shell, Menu } = require("electron");
const path = require("path");
function createWindow() {
  const win = new BrowserWindow({
    width: 1100, height: 800, minWidth: 360, minHeight: 560, title: "BIBILEARN",
    backgroundColor: "#fdf8ff", icon: path.join(__dirname, "..", "build", "icon.png"),
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  Menu.setApplicationMenu(null);
  win.loadFile(path.join(__dirname, "..", "www", "index.html"));
  // Les liens externes s'ouvrent dans le navigateur, jamais dans l'appli
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: "deny" }; });
  win.webContents.on("will-navigate", (e, url) => { if (!url.startsWith("file://")) { e.preventDefault(); shell.openExternal(url); } });
}
app.whenReady().then(() => {
  // Micro autorisé uniquement pour l'exercice « Parler »
  require("electron").session.defaultSession.setPermissionRequestHandler((wc, perm, cb) => cb(perm === "media"));
  createWindow();
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
