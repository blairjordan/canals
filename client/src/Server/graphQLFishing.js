
import {
    gql,
  } from "@apollo/client/core"
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
                markers(condition: {type: "fishing_spot"}) {
                  nodes {
                    id
                    position
                    nodeId
                    type
                  }
                }
              }
              `
            })
            .then((result) => resolve(result?.data?.markers?.nodes))
        })
      }

    goFish(playerId, markerId) {

        return new Promise((resolve) => {
          this.client
          .mutate({
            mutation: gql`
              mutation GoFish($id: Int!,$marker: Int!,) {
                  goFish(input: {playerId: $id, markerId: $marker}) {
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
                id: Number(playerId),
                marker: Number(markerId),
            },
            })
            .then((result) => resolve(result?.data?.goFish?.playerItem))
        })
    }
}

export {GraphQLFishing}