import { gql } from '@apollo/client'

// Marker types:
// 📍 geo_marker
// 🎣 fishing_spot
// 🧑‍🌾 vendor
// ⛽ fuel_station
// 🚪 lock
export const MARKERS = gql`
  query Markers($markerType: String = "%") {
    markers(filter: { type: { like: $markerType } }) {
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
