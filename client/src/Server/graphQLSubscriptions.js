import {
    gql,
  } from "@apollo/client/core"
  import { GraphQLBase } from "./graphQLBase"
class GraphQLSubscriptions extends GraphQLBase {
    // constructor(client) {
    //     super(client)
    // }


  //Subscriptions
  initPlayerSubscriptions(updateCallback) {
    const playerPosUpdateSUB = gql`
      subscription {
        listen(topic: "player_updated") {
          query {
            players {
              nodes {
                position
                id
              }
            }
          }
        }
      }
    `
    this.client.subscribe({ query: playerPosUpdateSUB }).subscribe({
      next(result) {
        updateCallback(result?.data?.listen?.query?.players.nodes)
      },
      error(error) {
        console.error("Subscription error: ", error)
      },
    })
  }
}

export  {GraphQLSubscriptions }