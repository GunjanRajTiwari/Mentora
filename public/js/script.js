const frames = document.getElementById("frames");
const myFrame = document.getElementById("myFrame");
const myVideo = document.getElementById("myVideo");

const username = prompt("Enter your name: ");

const socket = io("/");
socket.emit("join-room", ROOM_ID, username);

navigator.mediaDevices
    .getUserMedia({
        audio: true,
        video: true,
    })
    .then((stream) => {
        myVideo.srcObject = stream;
        myVideo.addEventListener("loadedmetadata", (e) => {
            myVideo.play();
        });
    })
    .catch((e) => {
        myFrame.innerHTML = `<div class = "circle tag">You</div>`;
    });

const videos = ["GT", "PL", "GT", "SD", "RT", "PL"];

videos.forEach((video) => {
    var frame = document.createElement("div");
    frame.classList.add("frame");
    frame.innerHTML = `
        <div class = "circle tag">${video}</div>
    `;
    frames.appendChild(frame);
});
