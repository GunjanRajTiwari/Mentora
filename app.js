const express = require("express");

const app = express();

// app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.sendFile("index.html");
});

app.listen(8000, () => {
    console.log("Server is running ...");
});
