/*
    app.js
    -> Electron entrypoint
*/

// Imports
let {BrowserWindow, app} = require('electron');

let EditorWindow;

// Load the "editor"
app.on('ready', () => {
    EditorWindow = new BrowserWindow({
        show: false,
        title: "QuickSplit",
        webPreferences: {
            devTools: true,
            nodeIntegration: true
        }
    });

    // Remove default menu
    EditorWindow.setMenu(null);

    // Load the html file
    EditorWindow.loadFile(__dirname + "/editor.html");

    EditorWindow.on('ready-to-show', () => {
        EditorWindow.show();
    });
});

// Close the app
app.on('window-all-closed', () => {
    EditorWindow = null;
    app.quit();
})