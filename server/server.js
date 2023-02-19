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

// Handle Socket.io connections
io.on("connection", (socket) => {
  console.log("👋 Player connected")

  let currentRoom = "0_0"

  // Handle player updates
  socket.on("update", ({ id, ...position }) => {
    // Data includes:
    // position (xyz)
    // rotation (xyz)
    // velocity (xyz)
    // angular_velocity (xyz)

    // Update the player in the database
    const sql = `
      UPDATE players
      SET position = '${JSON.stringify(position)}'
      WHERE id = $1
    `

    const GRID_SIZE = 100

    // Calculate current room based on grid size.
    const newRoom = `${Math.floor(position.x / GRID_SIZE)}_${Math.floor(
      position.y / GRID_SIZE
    )}`

    // If player's room has changed, then join it.
    if (newRoom !== currentRoom) {
      socket.leaveAll()
      socket.join(newRoom)
      console.log(`🚪 Player ${id} joined room ${newRoom}`)
    }

    pool.query(sql, [id], (err, result) => {
      if (err) {
        console.error(err.message)
      } else {
        console.log(`⬆ Player ${id} updated`)
        socket.volatile.emit("update", { id, ...position })
      }
    })
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
