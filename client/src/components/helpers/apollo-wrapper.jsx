import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  split,
  createHttpLink,
} from '@apollo/client'
import { getMainDefinition } from '@apollo/client/utilities'
import { useState } from 'react'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';

// TODO: Replace hard-coded values with environment variables

export const ApolloWrapper = ({ children }) => {
  const ssrMode = typeof window === 'undefined';

  const httpLink = createHttpLink({
    // TODO: Source from environment variable
  })

  const wsLink = typeof window !== "undefined" ?  new GraphQLWsLink(createClient({
    // TODO: Source from environment variable
  })) : null

  const splitLink = typeof window !== "undefined" ? split(
    ({ query }) => {
      const definition = getMainDefinition(query)
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      )
    },
    wsLink,
    httpLink
  ): httpLink

  const client = new ApolloClient({
    ssrMode,
    cache: new InMemoryCache(),
    link: splitLink,
  })

  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  )
}
