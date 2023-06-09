import { useRef } from 'react'
import dynamic from 'next/dynamic'
import { Auth0Provider } from '@auth0/auth0-react'
import Header from '@/config'
import Layout from '@/components/dom/Layout'
import { ApolloWrapper } from '@/components/helpers/apollo-wrapper'
import { AppContextProvider } from '@/context'
import '@/styles/index.css'

const Scene = dynamic(() => import('@/components/canvas/Scene'), { ssr: true })

export default function App({ Component, pageProps = { title: 'index' } }) {
  const ref = useRef()
  
  return (
    <>
      <Auth0Provider
        domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN || ''}
        clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID || ''}
        audience={process.env.NEXT_PUBLIC_AUTH0_AUDIENCE || ''}
        redirectUri={typeof window !== 'undefined' ? window.location.origin : ''}
      >
        <Header title={pageProps.title} />
        <ApolloWrapper>
          <AppContextProvider>
            <Layout ref={ref}>
              <Component {...pageProps} />
              {/* The canvas can either be in front of the dom or behind. If it is in front it can overlay contents.
              * Setting the event source to a shared parent allows both the dom and the canvas to receive events.
              * Since the event source is now shared, the canvas would block events, we prevent that with pointerEvents: none. */}
              {Component?.canvas && (
                <Scene className='pointer-events-none' eventSource={ref} eventPrefix='client'>
                  {Component.canvas(pageProps)}
                </Scene>
              )}
            </Layout>
          </AppContextProvider>
        </ApolloWrapper>
      </Auth0Provider>
    </>
  )
}
