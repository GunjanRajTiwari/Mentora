const frames = document.getElementById("frames");

var state = {
    video: false,
};
const username = prompt("Enter your name: ");

const socket = io("/");
// const myPeer = new Peer(undefined, {
//     key: "peerjs",
//     host: "/",
//     port: "8001",
// });
const myPeer = new Peer();

const myVideo = document.createElement("video");
myVideo.muted = true;

const peers = {};

myPeer.on("open", (id) => {
    navigator.mediaDevices
        .getUserMedia({
            video: {
                cursor: "always",
            },
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
            },
        })
        .then((stream) => {
            addVideoStream(myVideo, stream);

            myPeer.on("call", (call) => {
                console.log("call aayo");
                call.answer(stream);

                const video = document.createElement("video");
                call.on("stream", (userVideoStream) => {
                    console.log("stream vayo");
                    addVideoStream(video, userVideoStream);
                });
            });

            socket.on("user-connected", (userId) => {
                state.video = true;
                connectToNewUser(userId, stream);
            });

            socket.emit("join-room", ROOM_ID, id);

            socket.on("user-disconnected", (userId) => {
                console.log("disconnect: " + userId);
                if (peers[userId]) {
                    peers[userId].close();
                } else {
                    console.log("call xaina");
                }
            });
        })
        .catch((e) => {
            console.log(e);
            addVideoStream(null, "You", null);
        });
});

function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream);

    const video = document.createElement("video");
    call.on("stream", (userVideoStream) => {
        console.log("call gayo");
        addVideoStream(video, userVideoStream);
    });

    call.on("close", () => {
        video.remove();
    });

    peers[userId] = call;
}

function addVideoStream(video, stream) {
    video.classList.add("frame");
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", (e) => {
        video.play();
    });
    frames.appendChild(video);
}

// function addWithoutVideo(userId, username) {
//     const frame = document.createElement("div");
//     frame.classList.add("frame");
//     frame.innerHTML = `
//         <div class = "circle tag">${username}</div>
//     `;
//     frames.appendChild(frame);
// }
