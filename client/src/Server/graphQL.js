
import { HttpLink, ApolloClient, InMemoryCache, gql, split } from '@apollo/client/core';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';

class GraphQL {
    constructor() {
      const httpLink = new HttpLink({
        uri: 'https://canals-api.onrender.com/graphql'
      });
      
      const wsLink = new GraphQLWsLink(createClient({
        url: 'wss://canals-api.onrender.com/graphql',
      }));
      const splitLink = split(
        ({ query }) => {
          const definition = getMainDefinition(query);
          return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
          );
        },
        wsLink,
        httpLink,
      );

        this.client = new ApolloClient({
          link: splitLink,
          cache: new InMemoryCache(),
          defaultOptions: {
            watchQuery: {
              fetchPolicy: 'no-cache',
            },
          },
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

    async updatePlayerPosition(id, pos) {
      // mutation UpdatePlayerPos($id: BigInt!, $position: JSON!) {
      //   updatePlayer(input: {patch: {position: $position}, id: $id}) {
      //     clientMutationId
      //   }
      // }
      
      const gqlMute = gql(`
        mutation {
          updatePlayer(
            input: {patch: {position: `+JSON.stringify(JSON.stringify(pos))+`}, id: `+JSON.stringify(id)+`}
          ) {
            player {
              id
              position
            }
          }
        }
        `)


      return new Promise((resolve) => {
      this.client.mutate({
          mutation: gqlMute
        })
        .then(result => resolve(result));
      });
    }

    async getPlayerPosition(id) {
      return new Promise((resolve) => {
      this.client.query({
        query: gql`
          query GetPlayer($id: BigInt!) {
            player(id:$id) {
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

    //Subscriptions
    initPlayerSubscriptions(updateCallback) {
      const playerPosUpdateSUB = gql`
      subscription {
        listen(topic: "player_updated") {
          relatedNode {
            ... on Player {
              id
              position
            }
          }
        }
      }
      `;
      this.client.subscribe({ query: playerPosUpdateSUB }).subscribe({
        next(result) {
          updateCallback(result?.data?.listen?.relatedNode);
        },
        error(error) {
          console.error('Subscription error: ', error);
        },
      });

      console.log('init subscription')
    }

}

export default new GraphQL()