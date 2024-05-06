import express from "express";
import cors from "cors";
import http from "http";
import { Server as socketIO } from "socket.io";

const PORT = process.env.PORT || 3002;

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);

const io = new socketIO(server, {
    cors: {
        origin: [
            "http://localhost:5173",
        ],
        methods: ["GET", "POST"]
    }
});


const activeUsers = {};
const offlineUsers = {};

io.on("connection", (socket) => {
    console.log(`${socket.id} is connected`);

    socket.on("join", (username) => {
        console.log(`${username} is now online`);
        if (!activeUsers[socket.id] && !Object.values(activeUsers).includes(username)) {
            activeUsers[socket.id] = username;
            io.emit("updateActiveUsers", Object.values(activeUsers)); 
        }
        if(offlineUsers[socket.id]){
            delete offlineUsers[socket.id];
            io.emit("updateOfflineUsers", Object.values(offlineUsers));
        }
        
    })

    socket.on("disconnect", () => {
        const username = activeUsers[socket.id]
        console.log(`${username} is now offline`)
        if (!offlineUsers[socket.id] && !Object.values(offlineUsers).includes(username)) {
            offlineUsers[socket.id] = username;
            io.emit("updateOfflineUsers", Object.values(offlineUsers)); 
        }
        if(username) {
            delete activeUsers[socket.id];
            io.emit("updateActiveUsers", Object.values(activeUsers));
        }
        }
    );
});

server.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});