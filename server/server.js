const express = require("express")
const http = require("http")
const socketIO = require("socket.io")
const { Pool } = require("pg")

// Create the Express app
const app = express()
const server = http.createServer(app)

// Set up the Socket.io server
const io = socketIO(server)

// Connect to the PostgreSQL database
const pool = new Pool({
  user: "myuser",
  host: "localhost",
  database: "mydb",
  password: "mypassword",
  port: 5432,
})

const players = []

// Handle Socket.io connections
io.on("connection", (socket) => {
  console.log("👋 Player connected")

  let currentRoom = "0_0"

  // Handle player updates
  socket.on("update", ({ id, position }) => {
    // Data includes:
    // position (xyz)
    // rotation (xyz)
    // velocity (xyz)
    // angular_velocity (xyz)

    const GRID_SIZE = 100

    // Calculate current room based on grid size.
    const newRoom = `${Math.floor(position.pos_x / GRID_SIZE)}_${Math.floor(
      position.pos_y / GRID_SIZE
    )}`

    // If player's room has changed, then join it.
    if (newRoom !== currentRoom) {
      socket.leaveAll()
      socket.join(newRoom)
      socket
        .to(newRoom)
        .volatile.emit("player-joined-room", { id, ...position })
      console.log(`🚪 Player ${id} joined room ${newRoom}`)
      currentRoom = newRoom
    }

    const player = players.find((player) => player.id === id)
    if (!player) {
      players.push({ id, position, currentRoom })
    } else {
      player.position = position
      player.currentRoom = currentRoom
    }

    console.log(`⬆ Player ${id} updated`)
    socket.volatile.emit("update", { id, ...position })

    console.log("👩‍👩‍👧‍👧 All players", JSON.stringify(players))
  })

  // Handle disconnections
  socket.on("disconnect", () => {
    console.log("🏃 Player disconnected")
  })
})

// Start the server
const port = 3000
server.listen(port, () => {
  console.log(`🛥 Canal server running on port ${port}`)
})
