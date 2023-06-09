'use client'

import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  split,
  createHttpLink,
} from '@apollo/client'
import { getMainDefinition } from '@apollo/client/utilities'
import { useState, useEffect } from 'react'
import { withRouter } from 'next/router';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { setContext } from '@apollo/client/link/context'
import { useAuth0 } from '@auth0/auth0-react'
import { createClient } from 'graphql-ws';

export const ApolloWrapper = withRouter(({ children, router }) => {
  const { isAuthenticated, getAccessTokenSilently, isLoading } = useAuth0()
  const [bearerToken, setBearerToken] = useState('')

  const ssrMode = typeof window === 'undefined';

  const userId = router.query.userId || ''

  const getHeaders = () => ({
    // 🦘 Non-production only: Allow for passing of userIds via ?userId=<userId>
    ...(!ssrMode ? {
      ...(userId !== '' ? { 'x_user_id':  userId } : {}),
      Authorization: bearerToken ? `Bearer ${bearerToken}` : '',
    } : {})
  })

  const httpLink = createHttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_HTTP_URL,
    fetchOptions: {
      credentials: 'same-origin',
    },
  })

  const wsLink = typeof window !== "undefined" ?  new GraphQLWsLink(createClient({
    url: process.env.NEXT_PUBLIC_GRAPHQL_WS_URL,
    connectionParams: {
      headers: {
        Authorization: bearerToken ? `Bearer ${bearerToken}` : '',
      },
    },
    lazy: true,
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

  useEffect(() => {
    const getToken = async () => {
      const token = isAuthenticated
        ? await getAccessTokenSilently()
        : ''
      setBearerToken(token)
    }
    getToken()
  }, [getAccessTokenSilently, isAuthenticated, isLoading])

  const authLink = setContext((_, { headers, ...rest }) => ({ headers: getHeaders(), ...rest }))

  const client = new ApolloClient({
    ssrMode,
    cache: new InMemoryCache(),
    link: authLink.concat(splitLink),
  })

  return (
    <ApolloProvider client={client}>
      {isLoading ? (
        <p>🚤 Loading</p>
      ) : bearerToken || !isAuthenticated ? (
        children
      ) : (
        <p>🚤 Loading</p>
      )}
    </ApolloProvider>
  )
})
