
import { ApolloClient, InMemoryCache, gql } from '@apollo/client/core';
class GraphQL {
    constructor() {
        this.client = new ApolloClient({
          uri: 'http://localhost:3000/graphql',
          cache: new InMemoryCache()
        });

        console.log('GraphQL constructor')
    }

    //Get all players
    getPlayers() 
    {
      return new Promise((resolve) => {
      this.client.query({
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
        .then(result => resolve(result));
      });
    }

    //Get player with inventory
    async getPlayer(id) {
      return new Promise((resolve) => {
      this.client.query({
          query: gql`
            query GetPlayer($id: BigInt!) {
              player(id:$id) {
                id
                username
                meta
                position
              }
            }
          `,
          variables: {
            "id": id
          }
        })
        .then(result => resolve(result));
      });
    }

    async guestPlayer() {
      return new Promise((resolve) => {
      this.client.mutate({
          mutation: gql`
            mutation CreatePlayer($username: String!) {
              createPlayer(input: {player: {username: $username}}) {
                player {
                  username
                  position
                  nodeId
                  meta
                  id
                  balance
                }
              }
            }
          `,
          variables: {
            "username": "guest"
          }
        })
        .then(result => resolve(result));
      });
    }

    //
    getPurchases() {
      
    }
}

export default new GraphQL()