import { gql } from '@apollo/client'

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
              itemKey
              type
              name
              price
            }
          }
        }
      }
    }
  }
`
