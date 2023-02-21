const express = require("express")
const http = require("http")
const socketIO = require("socket.io")
const { Pool } = require("pg")

// Create the Express app
const app = express()
const server = http.createServer(app)

// Set up the Socket.io server
const io = socketIO(server, 
  {
    cors: {
      origin: "http://localhost:3001"
    }
  }
)

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
  socket.on("update", ({ id, positionData }) => {
    // positionData includes:
    // position[]
    // rotation[]
    // velocity[]
    // angular_velocity[]

    const GRID_SIZE = 100

    const [position_x, position_y, _] = positionData.position

    // Calculate current room based on grid size.
    const newRoom = `${Math.floor(position_x / GRID_SIZE)}_${Math.floor(
      position_y / GRID_SIZE
    )}`

    // If player's room has changed, then join it.
    if (newRoom !== currentRoom) {
      socket.leaveAll()
      socket.join(newRoom)
      socket.to(newRoom).volatile.emit("player-join", { id, positionData })
      console.log(`🚪 Player ${id} joined room ${newRoom}`)
      currentRoom = newRoom
    }

    const player = players.find((player) => player.id === id)
    if (!player) {
      players.push({ id, socket:socket.id, currentRoom, positionData })
    } else {
      player.position = positionData
      player.currentRoom = currentRoom
    }

    console.log(`⬆ Player ${id} updated`)
    socket.to(newRoom).volatile.emit("player-update", { id, positionData })

    console.log("👩‍👩‍👧‍👧 All players", JSON.stringify(players))
  })

  // Handle disconnections
  socket.on("disconnect", () => {
    const  index = players.findIndex((player) => player.socket === socket.id);
    if(index>=0) {
      console.log("🏃 Player removed from game:"+ players[index].id)
      players.splice(index, 1);
      //could put something here so player stays around for a few minutes and could in still have interactions with bots/people
    }
    console.log("🏃 Player disconnected")
  })
})

// Start the server
const port = 3000
server.listen(port, () => {
  console.log(`🛥 Canal server running on port ${port}`)
})
