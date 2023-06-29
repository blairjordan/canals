import { gql } from '@apollo/client'

import { PLAYER_ITEM_FIELDS } from './fragments'

export const FISH = gql`
  mutation {
    fish(input: {}) {
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
  mutation ($itemId: Int!) {
    purchaseItem(input: { itemId: $itemId }) {
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
  mutation ($markerId: Int!, $playerItemId: Int!) {
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
  mutation {
    refuel(input: {}) {
      player {
        id
        fuel
        balance
      }
    }
  }
`

export const OPERATE_LOCK = gql`
  mutation {
    operateLock(input: {}) {
      marker {
        id
        props
      }
    }
  }
`

export const PICKUP_PACKAGE = gql`
  mutation {
    pickupPackage(input: {}) {
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
  mutation {
    deliverPackage(input: {}) {
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

export const EQUIP_ITEM = gql`
  mutation ($playerId: Int!, $playerItemId: Int!) {
    equipItem(input: { playerId: $playerId, playerItemId: $playerItemId }) {
      player {
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

export const UNEQUIP_ITEM = gql`
  mutation ($playerId: Int!, $playerItemId: Int!) {
    unequipItem(input: { playerId: $playerId, playerItemId: $playerItemId }) {
      player {
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
