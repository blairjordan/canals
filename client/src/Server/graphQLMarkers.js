import { gql } from "@apollo/client/core"
import { GraphQLBase } from "./graphQLBase"
class GraphQLMarkers extends GraphQLBase {
  // constructor(client) {
  //     super(client)
  // }

  // Marker types:
  // 📍 geo_marker
  // 🎣 fishing_spot
  // 🧑‍🌾 vendor
  // ⛽ fuel_station
  getMarkers(markerType) {
    return new Promise((resolve) => {
      this.client
        .query({
          query: gql`
            query Markers($markerType: String!) {
              markers(condition: { type: $markerType }) {
                nodes {
                  id
                  position
                  nodeId
                  type
                  props
                  toMarker {
                    nodes {
                      id
                    }
                  }
                }
              }
            }
          `,
          variables: {
            markerType,
          },
        })
        .then((result) => resolve(result?.data?.markers?.nodes))
    })
  }
}

export { GraphQLMarkers }
