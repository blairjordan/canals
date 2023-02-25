Canal Server 🛥
=========

Canal Server is a GraphQL server that provides APIs to manage players and grid nodes. It uses PostgreSQL as a database and PostGraphile as a GraphQL server.

Getting Started
---------------

### Prerequisites

*   [Docker](https://docs.docker.com/get-docker/)
*   [Node.js](https://nodejs.org/en/download/)

### Installing

1.  Clone the repository:

```bash
git clone git@github.com:peglegau/canals.git
```

2.  Install dependencies:

```bash
cd canal
npm install
```

4.  Create the database tables and functions:

```bash
npm run db:init
```

This will create the database required by the GraphQL server in a docker container. It will also create the default grid nodes.

> 🔄 You can re-run this command to reset the database.

5.  Start the GraphQL server:

```bash
npm start
```

Usage
---------------

You can access the GraphQL playground at [http://localhost:3000/graphql](http://localhost:3000/graphql) to explore the API.

#### Queries

*   `players`: Get a list of all players.
*   `player(id: ID!)`: Get a player by ID.
*   `gridNodes`: Get a list of all grid nodes.
*   `gridNode(id: ID!)`: Get a grid node by ID.
*   `gridNodeLinks`: Get a list of all grid node links.
*   `gridNodeLink(id: ID!)`: Get a grid node link by ID.

#### Mutations

*   `createPlayer(input: PlayerInput!)`: Create a new player.
*   `updatePlayer(id: ID!, input: PlayerInput!)`: Update a player.
*   `deletePlayer(id: ID!)`: Delete a player.
*   `createGridNode(input: GridNodeInput!)`: Create a new grid node.
*   `updateGridNode(id: ID!, input: GridNodeInput!)`: Update a grid node.
*   `deleteGridNode(id: ID!)`: Delete a grid node.

#### Subscriptions

You can subscribe to player updates using the following subscription:

*   `playerUpdates`: Subscribe to player updates.


Accessing GraphQL via Web App
---------------

To access the GraphQL API in a web app, you can use the fetch API or a dedicated GraphQL client library such as Apollo Client.

Here's an example using the Apollo Client to query the GraphQL API:

```javascript
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

const client = new ApolloClient({
  uri: 'http://localhost:3000/graphql',
  cache: new InMemoryCache()
});

client.query({
  query: gql`
    query {
      players {
        nodes {
          id
          username
          meta
          position
        }
      }
    }
  `
})
  .then(result => console.log(result));
```

Subscriptions Via Apollo
---------------

Similar to the example above, but subscribing to player updates:

> At the moment, all player updates go to the player_updated topic.
>
> TODO: Use topic relevant to the player position  ?

```javascript
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

const client = new ApolloClient({
  uri: 'ws://localhost:3000/graphql',
  cache: new InMemoryCache(),
});

const subscription = gql`
  subscription {
    listen(topic: "player_updated") {
      query {
        players {
          nodes {
            id
            meta
            nodeId
            position
            username
          }
        }
      }
    }
  }
`;

const subscriptionObserver = {
  next(data) {
    console.log(data);
  },
  error(error) {
    console.error(error);
  },
};

const subscriptionHandle = client.subscribe({ query: subscription }).subscribe(subscriptionObserver);

subscriptionHandle.unsubscribe();

```