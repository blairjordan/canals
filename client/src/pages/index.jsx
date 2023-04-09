import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import Popup from '@/components/dom/Popup'
import Login from '@/components/dom/Login'
import { useAppContext } from '@/context';
import { useLazyQuery } from '@apollo/client';
import { PLAYER } from '@/graphql/player';

const Game = dynamic(() => import('@/components/canvas/Game'), { ssr: false })

export default function Page(props) {
  const [showLogin, setShowPopup] = useState(false) // Add state to manage popup visibility

  const [getPlayer, { loading: loadingPlayer, data: playerData, error: playerError }] = useLazyQuery(PLAYER);

  const [state, dispatch] = useAppContext();

  const handleLogin = (id) => {
    getPlayer({ variables: { id } });
  };

  useEffect(() => {
    if (!loadingPlayer && playerData && playerData.player) {
      dispatch({ type: 'LOGIN', payload: playerData.player });
    }
  }, [loadingPlayer, playerData]);

  return (
    <>
      {
      // state.player.id is truthy when the player is logged in
      !(state.player && state.player.id) && (
        <Popup>
          <Login onLogin={handleLogin} />
        </Popup>
      )}
      {/* Map over the popups in state and render a Popup component for each one */}
      {state.popups.map(({ id, title, message }) => (
        <Popup key={id}>
          <h2>{title}</h2>
          <p>{message}</p>
        </Popup>
      ))}
    </>
  )
}

Page.canvas = (props) => <Game />

export async function getStaticProps() {
  return { props: { title: 'Game' } }
}
