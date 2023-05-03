import { gql } from '@apollo/client'

// TODO: use this query somewhere and delete this usage comment
// .then((result) => resolve(result?.data?.players?.nodes))
export const PLAYERS_ALL = gql`
  query GetPlayersAll {
    players {
      nodes {
        id
        username
        meta
        position
      }
    }
  }
`

export const PLAYER = gql`
  query GetPlayer($id: BigInt!) {
    player(id: $id) {
      id
      username
      meta
      position
      balance
      fuel
      playerItems {
        nodes {
          id
          item {
            id
            itemKey
            name
            type
            description
            props
            price
          }
        }
      }
    }
  }
`

export const PLAYER_UPDATE = gql`
  mutation UpdatePlayer($id: BigInt!, $position: JSON!) {
    updatePlayer(input: { patch: { position: $position }, id: $id }) {
      player {
        id
        position
      }
    }
  }
`

export const PLAYERS_NEARBY = gql`
  subscription {
    listen(topic: "player_updated") {
      query {
        players {
          nodes {
            position
            id
          }
        }
      }
    }
  }
`
