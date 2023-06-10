
# 🚤 Canals

Canals is a boat simulation game which allows players to explore different canals, complete challenges, and enjoy the scenery of the waterways.

![Screenshot](screenshots/screenshot1.gif)

## 💻 Technology Stack

- [React](https://react.dev/) and [Three.js](https://threejs.org/) (using [Fiber](https://docs.pmnd.rs/react-three-fiber))
- [Postgraphile](https://www.graphile.org/postgraphile/) GraphQL server
- [Sqitch](https://sqitch.org/) database deployments
- [Blender](https://www.blender.org/) 3D models

## ✨ Features

- 🔧 **Boat Customization**: Customize your boat with decorations and accessories
- ⬆ **Boat Upgrades**: Upgrade your boat to improve its performance
- 📦 **Deliveries**: Deliver goods to earn rewards
- 🎣 **Fishing**: Catch fish to earn rewards
- ⛽ **Fuel**: Refuel your boat at pumps
- 🌐 **Multiplayer**: Collaborate and interact with other players
- 🗺 **Expanding Regions**: While currently focusing on European / Dutch-style canals, the game has plans to expand to different regions in the future.
- 🔓 **Locks**: Operate locks to navigate through different water levels

## 💻 Deployed Version

A deployed version of the game is available at [canals.boats](https://canals.boats/)

(Login using usernames: `1`, `2`, `3`, or `4`)

## 💾 Installation

To install and set up the Canals, follow the instructions below for the server and client components:

### Prerequisites

*   [Docker](https://docs.docker.com/get-docker/)
*   [Node.js](https://nodejs.org/en/download/)

### Server

1.  Create the Docker container for PostgreSQL: `npm run db:init`
2.  Start the server by running: `npm run start`

This will launch the server and make it accessible for the client.

You can access the GraphQL playground at [http://localhost:3000/graphql](http://localhost:3000/graphql) to explore the API.

### Client

1.  Navigate to the client directory:  `cd client`
2.  Install the client dependencies: `npm run install` 
3.  Start the client development server: `npm run dev --port=3001` 

This command will compile the client code and launch a development server.

## 🎮 Usage

Once both the server and client are set up, you can access the Canals by opening a web browser and navigating to the provided URL (e.g., `http://localhost:3001`).

### 🕹 Controls

The game can be played using the following controls:

- **WASD**: Move the boat
- **F**: Fish
- **E**: Interact with markers or objects
- **I**: Inventory
- **Esc**: Cancel current action

## 🎨 Art Style

The target art style is medium-to-low poly art style with ghibli-like trees, aiming to capture the charm and ambiance found in various canal locations worldwide.

## 🤝 Contributing

Contributions to the Canals project are welcome! If you'd like to contribute, you can follow these steps:

- 🍴 Fork the repository and create a new branch for your changes.
- 🛠️ Make your modifications, addressing the issue or feature you're working on.
- 🚀 Commit your changes and push them to your forked repository.
- 🔀 Open a pull request (PR) to submit your changes.

You can also browse the existing issues and PRs to contribute to ongoing discussions or offer your assistance.

## 📢 Suggestions

If you have any feedback, suggestions, or need help related to Canals, please feel free to open an issue in this repository.
