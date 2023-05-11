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

export const REFUEL = gql`
  mutation Refuel($playerId: Int!) {
    refuel(input: { playerId: $playerId }) {
      player {
        id
        fuel
        balance
      }
    }
  }
`

export const OPERATE_LOCK = gql`
  mutation ($playerId: Int!) {
    operateLock(input: { playerId: $playerId }) {
      marker {
        id
        props
      }
    }
  }
`

export const PICKUP_PACKAGE = gql`
  mutation ($playerId: Int!) {
    pickupPackage(input: { playerId: $playerId }) {
      player {
        playerItems {
          nodes {
            id
            props
            item {
              name
              type
            }
          }
        }
      }
    }
  }
`

export const DELIVER_PACKAGE = gql`
  mutation ($playerId: Int!) {
    deliverPackage(input: { playerId: $playerId }) {
      player {
        balance
        playerItems {
          nodes {
            id
            props
            item {
              name
              type
            }
          }
        }
      }
    }
  }
`
