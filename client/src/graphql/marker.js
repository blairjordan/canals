import { gql } from '@apollo/client'

// Marker types:
// 📍 geo_marker
// 🎣 fishing_spot
// 🧑‍🌾 vendor
// ⛽ fuel_station
// 🚪 lock
// 🚢 marina

const MARKER_FIELDS = gql`
  fragment MarkerFields on Marker {
    id
    position
    nodeId
    type
    props
    radius
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
    packages {
      nodes {
        item {
          id
          itemKey
          name
          description
        }
        props
      }
    }
  }
`

export const MARKERS = gql`
  query markers($includeMarkerType: String = "%", $excludeMarkerType: String = "geo_marker") {
    markers(filter: { and: [{ type: { like: $includeMarkerType } }, { type: { notLike: $excludeMarkerType } }] }) {
      nodes {
        ...MarkerFields
      }
    }
  }
  ${MARKER_FIELDS}
`

export const MARKER_UPDATED = gql`
  subscription {
    listen(topic: "global:marker_updated") {
      relatedNode {
        ... on Marker {
          ...MarkerFields
        }
      }
    }
  }
  ${MARKER_FIELDS}
`
