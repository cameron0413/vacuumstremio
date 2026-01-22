const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    fullscreen: true,
    kiosk: true,
    autoHideMenuBar: true,
    backgroundColor: "#000000",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadURL("https://web.stremio.com/");

  win.webContents.setWindowOpenHandler(() => ({ action: "deny" }));

  win.webContents.on("did-finish-load", () => {
    win.webContents.insertCSS(`
      * { cursor: none !important; }
      :focus { outline: 3px solid white !important; outline-offset: 2px !important; }
    `);
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => app.quit());

