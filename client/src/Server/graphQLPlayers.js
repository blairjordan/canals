import {
    gql,
  } from "@apollo/client/core"
import { GraphQLBase } from "./graphQLBase"
class GraphQLPlayers extends GraphQLBase {
    // constructor(client) {
    //     super(client)
    // }

  //Get all players
  getPlayers() {
    return new Promise((resolve) => {
      this.client
        .query({
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
          `,
        })
        .then((result) => resolve(result?.data?.players?.nodes))
    })
  }

  //Get player with inventory
  async getPlayer(id) {
    return new Promise((resolve) => {
      this.client
        .query({
          query: gql`
            query GetPlayer($id: BigInt!) {
              player(id: $id) {
                id
                username
                meta
                position
              }
            }
          `,
          variables: {
            id: id,
          },
        })
        .then((result) => resolve(result?.data?.player))
    })
  }

  async guestPlayer() {
    return new Promise((resolve) => {
      this.client
        .mutate({
          mutation: gql`
            mutation CreatePlayer($username: String!) {
              createPlayer(input: { player: { username: $username } }) {
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
            username: "guest",
          },
        })
        .then((result) => resolve(result?.data?.createPlayer?.player))
    })
  }

  async updatePlayerPosition(id, position) {
    const gqlMute = gql(`
        mutation UpdatePlayer($id: BigInt!, $position: JSON!) {
          updatePlayer(
            input: {patch: {position: $position}, id: $id}
          ) {
            player {
              id
              position
            }
          }
        }
        `)

    return new Promise((resolve) => {
      this.client
        .mutate({
          mutation: gqlMute,
          variables: {
            id,
            position,
          },
        })
        .then((result) => resolve(result))
    })
  }

  async getPlayerPosition(id) {
    return new Promise((resolve) => {
      this.client
        .query({
          query: gql`
            query GetPlayer($id: BigInt!) {
              player(id: $id) {
                position
              }
            }
          `,
          variables: {
            id: id,
          },
        })
        .then((result) => resolve(result))
    })
  }
}

export {GraphQLPlayers}