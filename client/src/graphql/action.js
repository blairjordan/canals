import { gql } from '@apollo/client'

export const FISH = gql`
  mutation Fish($playerId: Int!) {
    fish(input: { playerId: $playerId }) {
      playerItem {
        id
        item {
          itemKey
          name
          description
          type
          props
        }
      }
    }
  }
`

export const PURCHASE = gql`
  mutation Purchase($playerId: Int!, $itemId: Int!) {
    purchaseItem(input: { playerId: $playerId, itemId: $itemId }) {
      playerItem {
        id
        item {
          id
          description
          type
          props
          name
        }
      }
    }
  }
`

export const SELL = gql`
  mutation Sell($markerId: Int!, $playerItemId: Int!) {
    sellItem(input: { markerId: $markerId, playerItemId: $playerItemId }) {
      player {
        id
        playerItems {
          edges {
            node {
              id
            }
          }
        }
      }
    }
  }
`
