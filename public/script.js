const frames = document.getElementById("frames");
const myFrame = document.getElementById("myVideo");

navigator.mediaDevices
    .getUserMedia({
        audio: true,
        video: true,
    })
    .then((stream) => {
        myFrame.srcObject = stream;
        myFrame.play();
    });

const videos = ["GT", "SD", "RT", "PL"];

videos.forEach((video) => {
    var frame = document.createElement("div");
    frame.classList.add("frame");
    frame.innerHTML = `
        <div class = "circle tag">${video}</div>
    `;
    frames.appendChild(frame);
});
