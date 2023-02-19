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
  console.log("User connected")

  // Handle player updates
  socket.on("update", ({ id, ...position }) => {
    console.log("Player updated:", id)

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
    pool.query(sql, [id], (err, result) => {
      if (err) {
        console.error(err.message)
      } else {
        console.log(`Player ${id} updated`)
      }
    })
  })

  // Handle disconnections
  socket.on("disconnect", () => {
    console.log("User disconnected")
  })
})

// Start the server
const port = 3000
server.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
