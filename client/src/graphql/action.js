import { gql } from '@apollo/client'

// TODO: use this mutation somewhere and delete this usage comment
// variables: {
// playerId: Number(playerId),
// },
// })
// .then((result) => resolve(result?.data?.fish?.playerItem))
export const FISH = gql`
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
`