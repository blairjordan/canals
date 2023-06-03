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

export const PLAYER_POSITION_UPDATES = gql`
  subscription {
    listen(topic: "player_position_updated") {
      relatedNode {
        ... on Player {
          id
          position
        }
      }
    }
  }
`

export const PLAYER_ITEMS_UPDATES = gql`
  subscription {
    listen(topic: "player_items_updated") {
      relatedNode {
        ... on Player {
          id
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
  }
`

export const PLAYER_GENERAL_UPDATES = gql`
  subscription {
    listen(topic: "player_general_updated") {
      relatedNode {
        ... on Player {
          id
          fuel
          balance
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

`
