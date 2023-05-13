import { gql } from '@apollo/client'

const MESSAGE_FIELDS = gql`
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

export const CHAT_GLOBAL = gql`
  subscription {
    listen(topic: "global_message_received") {
      relatedNode {
        ... on Message {
          ...MessageFields
        }
      }
    }
  }
  ${MESSAGE_FIELDS}
`

export const MESSAGE_CREATE = gql`
  mutation ($playerId: BigInt!, $message: String!) {
    createMessage(input: { message: { playerId: $playerId, message: $message } }) {
      clientMutationId
      message {
        id
        createdAt
      }
    }
  }
`
