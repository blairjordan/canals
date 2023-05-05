import { gql } from '@apollo/client'

// Marker types:
// 📍 geo_marker
// 🎣 fishing_spot
// 🧑‍🌾 vendor
// ⛽ fuel_station
// 🚪 lock
const MARKER_FIELDS = gql`
  fragment MarkerFields on Marker {
    id
    position
    nodeId
    type
    props
    radius
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
`

export const MARKERS = gql`
  query ($markerType: String = "%") {
    markers(filter: { type: { like: $markerType } }) {
      nodes {
        ...MarkerFields
      }
    }
  }
  ${MARKER_FIELDS}
`

export const MARKER_UPDATED = gql`
  subscription {
    listen(topic: "marker_updated") {
      relatedNode {
        ... on Marker {
          ...MarkerFields
        }
      }
    }
  }
  ${MARKER_FIELDS}
`
