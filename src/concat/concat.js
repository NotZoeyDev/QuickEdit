/*
    concat.js
    -> Used to concat files
*/

// Imports
const spawn = require('child_process').spawn, remote = require('electron').remote, {dialog} = remote, fs = require('fs'), path = require('path');

document.addEventListener('keydown', (event) => {
    let key = event.keyCode;

    // Add videos
    if(key == 65) {
        dialog.showOpenDialog(remote.getCurrentWindow(), {
            title: "Files to add",
            properties: ["openFile", "multiSelections"],
            filters: [
                { name: "Videos", extensions: ["mkv", "mp4"]}
            ]
        }, (files, bookmarks) => {
            if(files && files.length > 0) {
                for(let file of files) {
                    let videoContainer = document.createElement("div");
                    videoContainer.className = "video-container";
                    videoContainer.dataset.video = file;

                    let video = document.createElement("video");
                    video.src = file;
                    video.muted = true;

                    video.addEventListener("mouseenter", () => {
                        video.play();
                    });

                    video.addEventListener("click", () => {
                        document.querySelector(".videos").removeChild(videoContainer);
                    });

                    video.addEventListener("mouseleave", () => {
                        video.pause();
                    });

                    videoContainer.appendChild(video);
                    document.querySelector(".videos").appendChild(videoContainer);
                } 
            }
        });
    }

    // Remove everything
    if(key == 87) {
        let videos = document.querySelector(".videos");
        let cloneNode = videos.cloneNode(false);
        videos.parentNode.replaceChild(cloneNode, videos);
    }

    // Concat
    if(key == 68) {
        let videos = document.querySelectorAll(".video-container");
        let files = "";
        let outputFolder = path.dirname(videos[0].dataset.video);
        let outputNames = [];

        // Generate a list for ffmpeg to use
        for(let video of videos) {
            files += `file '${video.dataset.video}'\n`;
        }

        fs.writeFileSync(`${outputFolder}/files.txt`, files, {encoding: "utf-8"});       
        
        // Generate a final name
        for(let video of videos) {
            outputNames.push(path.basename(video.dataset.video).replace(path.extname(video.dataset.video), ""));
        }

        let outputFile = path.join(outputFolder, outputNames.join("-"));
        
        let params = ["-safe", "0", "-f", "concat", "-i", `${path.normalize(outputFolder + "/files.txt")}`, "-c", "copy", `${outputFile}${path.extname(videos[0].dataset.video)}`];

        let ffmpeg = spawn("ffmpeg", params);

        ffmpeg.on('close', (code) => {
            fs.unlinkSync(`${outputFolder}/files.txt`);
        });
    }

    // Move keys
    if(key == 37 || key == 39) {
        let hover = document.querySelectorAll(":hover");
        let videoContainer;

        // Get the current video that the mouse is hovering to
        for(let item of hover) {
            if(item.className == "video-container") {
                videoContainer = item;
                break;
            }
        }

        let videosContainer = document.querySelector(".videos");
        let position;

        // Find the video position in the container
        for(let c in videosContainer.childNodes) {
            let child = videosContainer.childNodes[c];

            if(child && child.dataset && child.dataset.video == videoContainer.dataset.video) {
                position = c;
                break;
            }
        }

        // Item to the left
        if(key == 37) {
            if(parseInt(position) - 1 > 0) {
                videosContainer.insertBefore(videoContainer, videosContainer.childNodes[parseInt(position) - 1]);
            }
        }

        // Item to the right
        if(key == 39) {
            if(parseInt(position) + 1 <= videosContainer.childElementCount) {
                videosContainer.insertBefore(videoContainer, videosContainer.childNodes[parseInt(position) + 2]);
            }
        }
    }
});