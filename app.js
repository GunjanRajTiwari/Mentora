require("dotenv").config();
const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

// app.use(express.json());
app.set("view engine", "ejs");
app.use(express.static("public"));

// helpers
function makeCode(length = 8) {
    var result = "";
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

app.get("/", (req, res) => {
    res.render("dashboard");
});

app.get("/call", (req, res) => {
    res.redirect("/call/" + makeCode());
});

app.get("/call/:room", (req, res) => {
    const roomId = req.params.room;
    res.render("call", { roomId });
});

io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId) => {
        socket.join(roomId);

        socket.broadcast.to(roomId).emit("user-connected", userId);

        socket.on("disconnect", () => {
            socket.broadcast.to(roomId).emit("user-disconnected", userId);
        });
    });
});

const PORT = process.env.PORT;

server.listen(PORT, () => {
    console.log("Server is running ...");
});
