import { gql } from '@apollo/client'

import { PLAYER_ITEM_FIELDS } from './fragments'

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
            ...PlayerItemFields
          }
        }
      }
    }
  }
  ${PLAYER_ITEM_FIELDS}
`

export const PLAYER_SELF = gql`
  query GetCurrentPlayer {
    currentPlayer {
      id
      username
      meta
      position
      balance
      fuel
      playerItems {
        nodes {
          ...PlayerItemFields
        }
      }
    }
  }
  ${PLAYER_ITEM_FIELDS}
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
              ...PlayerItemFields
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
  ${PLAYER_ITEM_FIELDS}
`
