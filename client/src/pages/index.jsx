import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import Popup from '@/components/dom/Popup'
import Login from '@/components/dom/Login'
import { useAppContext } from '@/context';
import { useLazyQuery } from '@apollo/client';
import { PLAYER } from '@/graphql/player';

const Game = dynamic(() => import('@/components/canvas/Game'), { ssr: false })

export default function Page(props) {
  const [showPopup, setShowPopup] = useState(false) // Add state to manage popup visibility

  const [getPlayer, { loading: loadingPlayer, data: playerData, error: playerError }] = useLazyQuery(PLAYER);

  const [state, dispatch] = useAppContext();

  const handleLogin = (id) => {
    getPlayer({ variables: { id } });
    setShowPopup(false); // Hide the login popup after setting the current player
  };

  useEffect(() => {
    if (!loadingPlayer && playerData && playerData.player) {
      dispatch({ type: 'LOGIN', payload: playerData.player });
    }
  }, [loadingPlayer, playerData]);

  return (
    <>
      {showPopup && (
        <Popup>
          {/* Render the Login component and pass the handleLogin function as a prop */}
          <Login onLogin={handleLogin} />
        </Popup>
      )}
      {/* Render the toggle button */}
      <button onClick={() => setShowPopup(!showPopup)}>Toggle UI</button>
    </>
  )
}

Page.canvas = (props) => <Game />

export async function getStaticProps() {
  return { props: { title: 'Game' } }
}
