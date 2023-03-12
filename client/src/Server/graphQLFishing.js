import { gql } from "@apollo/client/core"
import { GraphQLBase } from "./graphQLBase"
class GraphQLFishing extends GraphQLBase {
  // constructor(client) {
  //     super(client)
  // }

  getFishingSpots() {
    return new Promise((resolve) => {
      this.client
        .query({
          query: gql`
            query MyQuery {
              markers(condition: { type: "fishing_spot" }) {
                nodes {
                  id
                  position
                  nodeId
                  type
                }
              }
            }
          `,
        })
        .then((result) => resolve(result?.data?.markers?.nodes))
    })
  }

  fish(playerId) {
    return new Promise((resolve) => {
      this.client
        .mutate({
          mutation: gql`
            mutation Fish($playerId: Int!) {
              fish(input: { playerId: $playerId }) {
                playerItem {
                  id
                  item {
                    description
                    type
                    props
                    name
                  }
                }
              }
            }
          `,
          variables: {
            playerId: Number(playerId),
          },
        })
        .then((result) => resolve(result?.data?.fish?.playerItem))
    })
  }
}

export { GraphQLFishing }
