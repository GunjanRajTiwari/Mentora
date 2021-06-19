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
const myPeer = new Peer({
    config: {
        iceServers: [
            {
                url: "turn:numb.viagenie.ca",
                credential: "I1server",
                username: "roarout20@gmail.com",
            },
            { url: "stun:stun.l.google.com:19302" },
        ],
    },
});
var myUserId = "";

const myVideo = createFrame();
myVideo.video.muted = true;

const peers = {};
const screens = {};

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
            addVideoStream(myVideo, stream, id);

            initEventHandlers(stream);

            callHandle(stream, id);
        })
        .catch((e) => {
            console.log(e);
        });
});

function createFrame() {
    const videoDiv = document.createElement("div");
    videoDiv.classList.add("frame");
    const video = document.createElement("video");
    videoDiv.appendChild(video);
    frames.appendChild(videoDiv);
    return { videoDiv, video };
}

function callHandle(stream, id) {
    myPeer.on("call", (call) => {
        call.answer(stream);

        const frame = createFrame();
        call.on("stream", (userVideoStream) => {
            addVideoStream(frame, userVideoStream, id);
        });
    });

    socket.on("user-connected", (userId) => {
        connectToNewUser(userId, stream);
    });

    socket.emit("join-room", ROOM_ID, id);
    state.video = true;
    myUserId = id;

    socket.on("user-disconnected", (userId) => {
        console.log("disconnect: " + userId);
        if (peers[userId]) {
            peers[userId].close();
        }

        if (screens[userId]) {
            screens[userId].close();
        }
    });
}

function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream);

    const frame = createFrame();
    call.on("stream", (userVideoStream) => {
        addVideoStream(frame, userVideoStream, userId);
    });

    call.on("close", () => {
        frame.video.remove();
    });

    peers[userId] = call;
}

function addVideoStream(frame, stream, userId) {
    if (!stream) return;
    const { videoDiv, video } = frame;

    video.srcObject = stream;
    video.addEventListener("loadedmetadata", (e) => {
        video.play();
    });

    const nameFrame = withoutVideo("User");
    socket.on("video-off", (uid) => {
        if (uid === userId) {
            videoDiv.replaceChild(nameFrame, video);
            // frames.replaceChild(nameFrame, videoDiv);
        }
    });

    socket.on("video-back", (uid) => {
        if (uid === userId) {
            videoDiv.replaceChild(video, nameFrame);
            // frames.replaceChild(videoDiv, nameFrame);
        }
    });
}

function withoutVideo(username) {
    const frame = document.createElement("div");
    frame.classList.add("frame");
    frame.classList.add("inner-frame");
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
            socket.emit("video-off", myUserId);
        } else {
            myVideo.srcObject = videoStream;
            frames.replaceChild(myVideo, nameFrame);
            videoStream.getVideoTracks()[0].enabled = true;
            socket.emit("video-back", myUserId);
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
                    // myVideo.srcObject = stream;
                    const call = myPeer.call(myUserId, stream);
                    screens[myUserId] = call;
                    state.screen = true;
                    stream.getVideoTracks()[0].onended = () => {
                        // myVideo.srcObject = videoStream;
                        if (screens[myUserId]) {
                            screens[myUserId].close();
                        }
                        state.screen = false;
                    };
                })
                .catch((e) => {
                    console.log(e);
                });
        }
    });

    hangUp.addEventListener("click", () => {
        socket.disconnect();
        location.href = "/";
    });
}
