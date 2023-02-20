# Server

Socket.io is used for the communication between the server and the clients.

To start the server, run `npm start` in the `server` directory.

The `update` message should include a player's ID and position data.

```
{
  "id": "test-player1",
  "positionData": {
      "position": [123, 545, 23],
      "rotation": [43, -55, -2],
      "velocity": [322, 12, 22],
      "angular_velocitory": [32, 54, 65]
  }
}
```

When a player updates their position, the server will broadcast the new position to all other players in the same room via the `player-update` message.

When a player joins a room, the server will broadcast the new player's ID to all other players in the same room via the `player-join` message.
