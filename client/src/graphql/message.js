import { gql } from '@apollo/client'
import { MESSAGE_FIELDS } from './fragments'

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
