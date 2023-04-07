import { gql } from '@apollo/client'

// TODO: use this query somewhere and delete this usage comment
// .then((result) => resolve(result?.data?.players?.nodes))
export const PLAYERS_ALL = gql`
  query {
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

// TODO: use this query somewhere and delete this usage comment
// variables: {
//   id: id,
// },
// .then((result) => resolve(result?.data?.player))
export const PLAYER = gql`
  query GetPlayer($id: BigInt!) {
    player(id: $id) {
      id
      username
      meta
      position
    }
  }
`

// TODO: use this mutation somewhere and delete this usage comment
// variables: {
//   username: "guest",
// },
// })
// .then((result) => resolve(result?.data?.createPlayer?.player))
export const PLAYER_CREATE = gql`
  mutation CreatePlayer($username: String!) {
    createPlayer(input: { player: { username: $username } }) {
      player {
        username
        position
        nodeId
        meta
        id
        balance
      }
    }
  }
`

// TODO: use this mutation somewhere and delete this usage comment
// variables: {
//   id,
//   position,
// },
export const PLAYER_UPDATE = gql`
  mutation UpdatePlayer($id: BigInt!, $position: JSON!) {
    updatePlayer(input: { patch: { position: $position }, id: $id }) {
      player {
        id
        position
        fuel
      }
    }
  }
`

// TODO: use this mutation somewhere and delete this usage comment
// this.client.subscribe({ query: playerPosUpdateSUB }).subscribe({
//   next(result) {
//     updateCallback(result?.data?.listen?.query?.players.nodes)
//   },
//   error(error) {
//     console.error("Subscription error: ", error)
//   },
// })
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
