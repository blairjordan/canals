import { gql } from '@apollo/client'

export const PLAYERS_ALL = gql`
  query GetPlayersAll {
    players {
      nodes {
        id
        username
        meta
        position
        playerItems {
          nodes {
            id
            props
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
          props
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

export const PLAYER_UPDATED = gql`
  mutation UpdatePlayer($id: BigInt!, $position: JSON!) {
    updatePlayer(input: { patch: { position: $position }, id: $id }) {
      player {
        id
        position
      }
    }
  }
`

// TODO: Split into separate subscriptions for
// - player position
// - player items
// - general player info
//
// (Requires changes to the backend)
export const PLAYER_UPDATES = gql`
  subscription {
    listen(topic: "player_updated") {
      relatedNode {
        ... on Player {
          id
          position
          fuel
          balance
          playerItems {
            nodes {
              id
              props
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
          package {
            id
            props
            item {
              id
              itemKey
              name
              description
              props
            }
          }
        }
      }
    }
  }
`
