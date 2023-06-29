'use client'

import { ApolloClient, InMemoryCache, ApolloProvider, split, createHttpLink } from '@apollo/client'
import { getMainDefinition } from '@apollo/client/utilities'
import { withRouter } from 'next/router'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { setContext } from '@apollo/client/link/context'
import { createClient } from 'graphql-ws'

// TODO: Replace hard-coded values with environment variables

export const ApolloWrapper = withRouter(({ children, router }) => {
  const ssrMode = typeof window === 'undefined'

  const playerId = router.query.playerId || ''

  const getHeaders = () => ({
    // Allow for passing of playerIds via ?playerId=<playerId>
    ...(!ssrMode
      ? {
          ...(playerId !== '' ? { x_player_id: playerId } : {}),
        }
      : {}),
  })

  const httpLink = createHttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_HTTP_URL,
  })

  const wsLink =
    typeof window !== 'undefined'
      ? new GraphQLWsLink(
          createClient({
            url: process.env.NEXT_PUBLIC_GRAPHQL_WS_URL,
            fetchOptions: {
              credentials: 'same-origin',
            },
          }),
        )
      : null

  const splitLink =
    typeof window !== 'undefined'
      ? split(
          ({ query }) => {
            const definition = getMainDefinition(query)
            return definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
          },
          wsLink,
          httpLink,
        )
      : httpLink

  const authLink = setContext((_, { headers, ...rest }) => ({ headers: getHeaders(), ...rest }))

  const client = new ApolloClient({
    ssrMode,
    cache: new InMemoryCache(),
    link: authLink.concat(splitLink),
  })

  return <ApolloProvider client={client}>{children}</ApolloProvider>
})
