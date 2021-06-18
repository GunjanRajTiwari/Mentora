const frames = document.getElementById("frames");

var state = {
    video: false,
    audio: true,
    screen: false,
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

            initEventHandlers(stream);

            callHandle(stream, id);
        })
        .catch((e) => {
            console.log(e);
            addVideoStream(null, null);
        });
});

function callHandle(stream, id) {
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
}

function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream);
    console.log(call);

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
    if (!stream || !video) return;
    video.classList.add("frame");
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", (e) => {
        video.play();
    });
    frames.appendChild(video);
}

function withoutVideo(username) {
    const frame = document.createElement("div");
    frame.classList.add("frame");
    frame.innerHTML = `
        <div class = "circle tag">${username}</div>
    `;
    return frame;
}

// --------------------------------------//
// ------ Button event handlers ---------//
// --------------------------------------//
const mute = document.getElementById("mute");
const videoOff = document.getElementById("video-off");
const screenShare = document.getElementById("screen-share");
const hangUp = document.getElementById("hang-up");

function initEventHandlers(videoStream) {
    mute.addEventListener("click", () => {
        mute.classList.toggle("red-bg");
        const enabled = videoStream.getAudioTracks()[0].enabled;
        console.log(enabled);
        if (enabled) {
            videoStream.getAudioTracks()[0].enabled = false;
        } else {
            videoStream.getAudioTracks()[0].enabled = true;
        }
    });

    const nameFrame = withoutVideo("You");
    videoOff.addEventListener("click", () => {
        videoOff.classList.toggle("red-bg");
        let enabled = videoStream.getVideoTracks()[0].enabled;
        if (enabled) {
            videoStream.getVideoTracks()[0].enabled = false;
            frames.replaceChild(nameFrame, myVideo);
        } else {
            myVideo.srcObject = videoStream;
            frames.replaceChild(myVideo, nameFrame);
            videoStream.getVideoTracks()[0].enabled = true;
        }
    });

    screenShare.addEventListener("click", () => {
        screenShare.classList.toggle("red-bg");
        if (!state.screen) {
            navigator.mediaDevices
                .getDisplayMedia({
                    cursor: true,
                })
                .then((stream) => {
                    state.screen = true;
                    stream.getVideoTracks()[0].onended = () => {
                        myVideo.srcObject = videoStream;
                        state.screen = false;
                    };
                    myVideo.srcObject = videoStream;
                    for (const uid in peers) {
                        peers[uid].answer(stream);
                    }
                });
        }
    });

    hangUp.addEventListener("click", () => {
        location.href = "/";
    });
}
