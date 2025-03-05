const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const config = { port: process.env.PORT || 3000, jwtsecret: "kitakesana" };
const app = express();
const httpServer = createServer(app);
const cors = require("cors");

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://b27b-2a09-bac1-3480-18-00-3c3-1e.ngrok-free.app",
    ],
  })
);

app.use(bodyParser.json());

const io = new Server(httpServer, {
  cors: {
    origin: "https://b27b-2a09-bac1-3480-18-00-3c3-1e.ngrok-free.app",
    // origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const usersInRooms = {};

const authToken = (token) => {
  return jwt.verify(token, config.jwtsecret);
};

app.post("/api/v1/auth/login", (req, res) => {
  const payload = {
    room: req.body.room,
    name: req.body.name,
  };

  const token = jwt.sign(payload, config.jwtsecret);

  console.log(token);

  res.send({
    token,
  });
});

io.on("connection", (socket) => {
  try {
    console.log("request", socket.request.headers);
    const token = socket.request.headers.authorization.split(" ")[1];

    const auth = authToken(token);

    socket.join(auth.room);
    console.log("usersInRooms", usersInRooms);
    if (!usersInRooms[auth.room]) usersInRooms[auth.room] = {};

    usersInRooms[auth.room][auth.name] = { online: true, socketId: socket.id };

    io.to(auth.room).emit("roomUsers", usersInRooms[auth.room]);

    socket.on("message", (message) => {
      console.log("message", message);
      const payload = {
        name: auth.name,
        content: message.content,
      };
      socket.to(auth.room).emit("message", payload);
    });

    socket.on("disconnect", () => {
      if (usersInRooms[auth.room] && usersInRooms[auth.room][auth.name]) {
        usersInRooms[auth.room][auth.name].online = false;

        io.to(auth.room).emit("roomUsers", usersInRooms[auth.room]);
      }
    });
  } catch (error) {
    console.error("Error:", error.message);
  }
});

httpServer.listen(config.port, () => {
  console.log(`application is running at: http://localhost:${config.port}`);
});
