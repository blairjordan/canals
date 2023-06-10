import { gql } from '@apollo/client'

export const MESSAGE_FIELDS = gql`
  fragment MessageFields on Message {
    id
    message
    createdAt
    meta
    player {
      username
    }
  }
`

export const PLAYER_ITEM_FIELDS = gql`
  fragment PlayerItemFields on PlayerItem {
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
`
