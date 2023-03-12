import {
  HttpLink,
  ApolloClient,
  InMemoryCache,
  gql,
  split,
} from "@apollo/client/core"
import { GraphQLWsLink } from "@apollo/client/link/subscriptions"
import { getMainDefinition } from "@apollo/client/utilities"
import { createClient } from "graphql-ws"
import { GraphQLMarkers } from "./graphQLMarkers"
import { GraphQLPlayers } from "./graphQLPlayers"
import { GraphQLFishing } from "./graphQLFishing"
import { GraphQLSubscriptions } from "./graphQLSubscriptions"

class GraphQL {
  constructor() {
    const httpLink = new HttpLink({
      uri: "https://canals-api.onrender.com/graphql",
    })

    const wsLink = new GraphQLWsLink(
      createClient({
        url: "wss://canals-api.onrender.com/graphql",
      })
    )
    const splitLink = split(
      ({ query }) => {
        const definition = getMainDefinition(query)
        return (
          definition.kind === "OperationDefinition" &&
          definition.operation === "subscription"
        )
      },
      wsLink,
      httpLink
    )

    this.client = new ApolloClient({
      link: splitLink,
      cache: new InMemoryCache(),
      defaultOptions: {
        watchQuery: {
          fetchPolicy: "no-cachcd cl  e",
        },
      },
    })

    this.markers = new GraphQLMarkers(this.client);
    this.players = new GraphQLPlayers(this.client);
    this.fishing = new GraphQLFishing(this.client);
    this.subscriptions = new GraphQLSubscriptions(this.client);
  }

}

export default new GraphQL()
