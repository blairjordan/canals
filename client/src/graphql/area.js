import { gql } from '@apollo/client'

export const AREAS = gql`
  query areas {
    areas {
      nodes {
        id
        props
        areaMarkers {
          nodes {
            fromMarker {
              id
              position
              positionHash
            }
            toMarker {
              id
              position
              positionHash
            }
          }
        }
      }
    }
  }
`
