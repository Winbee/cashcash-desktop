'use strict';
const oldTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
process.env.OLD_TZ = oldTimeZone === 'CET' ? 'Europe/Paris' : oldTimeZone;
process.env.TZ = 'UTC';
declare const __static: any;

import { app, protocol, ipcMain, BrowserWindow, nativeTheme } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer';
import path from 'path';
import { download } from 'electron-dl';
import fs from 'fs';
import setDefaultApplicationMenu from './background/menu';

nativeTheme.themeSource = 'light';
app.name = 'Cashcash';
app.allowRendererProcessReuse = false;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win: BrowserWindow | null;
let helpWin: BrowserWindow | null;
const winURL =
    process.env.NODE_ENV !== 'production'
        ? (process.env.WEBPACK_DEV_SERVER_URL as string)
        : 'app://./index.html';

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
    { scheme: 'app', privileges: { secure: true, standard: true } },
]);

function createHelpWindow() {
    if (helpWin) {
        helpWin.focus();
    } else {
        // Create the browser window.
        helpWin = new BrowserWindow({
            width: 600,
            height: 800,
            webPreferences: {
                sandbox: false,
                nodeIntegration: !!process.env.ELECTRON_NODE_INTEGRATION,
                devTools: true,
                enableRemoteModule: true,
            },
            parent: win ? win : undefined,
            icon: path.join(__static, 'icon.png'),
            title: 'Cashcash documentation',
        });

        if (process.env.WEBPACK_DEV_SERVER_URL) {
            // Load the url of the dev server if in development mode
            helpWin.loadURL(winURL + '?documentation=true');
            if (!process.env.IS_TEST && process.env.NODE_ENV !== 'production') {
                helpWin.webContents.openDevTools();
            }
        } else {
            createProtocol('app');
            // Load the index.html when not in development
            helpWin.loadURL(winURL + '?documentation=true');
        }

        helpWin.on('closed', () => {
            helpWin = null;
        });
    }
}

// Standard scheme must be registered before the app is ready
// protocol.registerStandardSchemes(['app'], { secure: false });
function createWindow() {
    // Create default menu.
    setDefaultApplicationMenu(createHelpWindow);

    // Create the browser window.
    win = new BrowserWindow({
        width: 1300,
        height: 700,
        webPreferences: {
            sandbox: false,
            nodeIntegration: !!process.env.ELECTRON_NODE_INTEGRATION,
            devTools: true,
            preload: path.join(__static, 'preload.js'),
            enableRemoteModule: true,
        },
        icon: path.join(__static, 'icon.png'),
        title: 'Cashcash',
    });

    if (process.env.NODE_ENV !== 'production') {
        // Load the url of the dev server if in development mode
        win.loadURL(winURL);
    } else {
        createProtocol('app');
        // Load the index.html when not in development
        win.loadURL(winURL);
    }

    win.on('closed', () => {
        win = null;
        if (helpWin) {
            helpWin.close();
        }
    });
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    app.quit();
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow();
    }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
    try {
        await installExtension(VUEJS_DEVTOOLS);
    } catch (e) {
        // tslint:disable-next-line:no-console
        console.error('Vue Devtools failed to install:', e.toString());
    }
    createWindow();
});

ipcMain.on('downloadDatabase', async (event, info) => {
    if (win) {
        await download(win, info.url, {
            saveAs: true,
            openFolderWhenDone: true,
        });
    }
});

ipcMain.on('deleteDatabase', async (event, info) => {
    if (win) {
        fs.unlinkSync(info.databasePath);
        win.reload();
    }
});

ipcMain.on('importDatabase', (event, info) => {
    if (win) {
        const newFilePath: string = info.newFilePath;
        const databasePath: string = info.databasePath;
        fs.copyFileSync(newFilePath, databasePath);
        win.reload();
    }
});

// Exit cleanly on request from parent process in development mode.
if (process.env.NODE_ENV !== 'production') {
    if (process.platform === 'win32') {
        process.on('message', (data) => {
            if (data === 'graceful-exit') {
                app.quit();
            }
        });
    } else {
        process.on('SIGTERM', () => {
            app.quit();
        });
    }
}
