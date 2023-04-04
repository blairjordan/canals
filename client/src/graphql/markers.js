import { gql } from '@apollo/client'

// TODO: Use this query somewhere and delete this usage comment
// variables: {
//   markerType,
// },
// })
// .then((result) => resolve(result?.data?.markers?.nodes))

// Marker types:
// 📍 geo_marker
// 🎣 fishing_spot
// 🧑‍🌾 vendor
// ⛽ fuel_station
export const MARKERS = gql`
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
        markerItems {
          nodes {
            item {
              id
              name
              price
            }
          }
        }
      }
    }
  }
`
