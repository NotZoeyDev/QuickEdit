/*
    Editor.js
    -> UI code and stuff
*/

// Imports
const remote = require('electron').remote, {BrowserWindow, dialog} = remote, path = require('path'), { spawn } = require('child_process');

// Access to the video html object
let videoPlayer = document.querySelector("video");

// Start and end timing used for spliting
let startTime;
let endTime;

// Access to some item
let startText = document.querySelector(".start");
let endText = document.querySelector(".end");

remote.getCurrentWindow().webContents.openDevTools();

// Handles keypresses
document.addEventListener("keydown", (event) => {
    let key = event.keyCode;

    if(key == 67) {
        let concatWindow = new BrowserWindow({
            parent: remote.getCurrentWindow(),
            modal: true,
            show: false
        });

        concatWindow.setMenu(null);

        concatWindow.loadFile(`${__dirname}/concat/concat.html`);

        concatWindow.on('ready-to-show', () => {
            concatWindow.show();
            concatWindow.webContents.openDevTools();
        });
    }

    // Save/render key
    if(key == 83) { 
        let fileName = decodeURIComponent(path.basename(videoPlayer.src));
        let fileExt = path.extname(fileName);
        let outputFolder = decodeURIComponent(path.normalize(path.dirname(videoPlayer.src).replace("file:///", "")));

        let outputName = `${fileName.replace(fileExt, "")}-${startTime}-${endTime}${fileExt}`;

        let params = ["-i", `${outputFolder}/${fileName}`, "-ss", `${startTime}`, "-to", `${endTime}`, "-c", "copy", `${outputFolder}/${outputName}`];

        let ffmpeg = spawn('ffmpeg', params);

        ffmpeg.on('close', (code) => {});
    }

    // Reload the UI
    if(key == 87) {
        startTime = 0;
        endTime = 0;
        startText.innerText = startTime;
        endText.innerText = endTime;
        openDialog();
    }

    // Set the start time
    if(key == 81) {
        startTime = videoPlayer.currentTime;
        startText.innerText = startTime;
        startText.onclick = () => {videoPlayer.currentTime = startTime};
    }

    // Set the end time
    if(key == 69) {
        endTime = videoPlayer.currentTime;
        endText.innerText = endTime;
        endText.onclick = () => {videoPlayer.currentTime = endTime};
    }

    // Go forward one sec
    if(key == 38) {
        videoPlayer.currentTime += 1;
    }

    // Go backward one sec
    if(key == 40) {
        videoPlayer.currentTime -= 1;
    }

    // Next frame
    if(key == 39) { 
        videoPlayer.currentTime += 1/60;
    }

    // Previous frame
    if(key == 37) {
        videoPlayer.currentTime -= 1/60;
    }
});

// Open dialog
let openDialog = () => {
    dialog.showOpenDialog(remote.getCurrentWindow(), {
        properties: ["openFile"],
        filters: [
            { name: "Videos", extensions: ["mkv", "mp4"]}
        ]
    }, (files, bookmarks) => {
        if(files) {
            videoPlayer.src = files[0];
        }
    });
}

// Initial file finder
openDialog();