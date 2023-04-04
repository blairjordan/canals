import dynamic from 'next/dynamic'
import { useState } from 'react'
import Popup from '@/components/dom/Popup'
import { useQuery } from '@apollo/client'
import { PLAYERS_ALL } from '@/graphql/players'

const Game = dynamic(() => import('@/components/canvas/Game'), { ssr: false })

export default function Page(props) {
  const [showPopup, setShowPopup] = useState(false) // Add state to manage popup visibility
  
  const { loading: loadingUser, data: playerData, error } = useQuery(PLAYERS_ALL)

  return (
    <>
      {showPopup && (
        <Popup>
          test
          {
            loadingUser ? 'loading' : (error === null ? <p>{error}</p> : playerData.players.nodes.map((player) => (
              <div key={player.id}>{player.username}</div>
            )))
          }

        </Popup>
      )}
      <button onClick={() => setShowPopup(!showPopup)}>Toggle UI</button>
    </>
  )
}

Page.canvas = (props) => <Game/>

export async function getStaticProps() {
  return { props: { title: 'Game' } }
}
