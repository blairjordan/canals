import {
    gql,
  } from "@apollo/client/core"
  import { GraphQLBase } from "./graphQLBase"
class GraphQLMarkers extends GraphQLBase {
    // constructor(client) {
    //     super(client)
    // }

    getGeoMarkers() {
        return new Promise((resolve) => {
          this.client
            .query({
              query: gql`
              query MyQuery {
                    markers(condition: {type: "geo_marker"}) {
                      nodes {
                        id
                        position
                        nodeId
                        type
                        toMarker {
                          nodes {
                            id
                          }
                        }
                      }
                    }
                  }
              `
            })
            .then((result) => resolve(result?.data?.markers?.nodes))
        })
      }
}

export {GraphQLMarkers}