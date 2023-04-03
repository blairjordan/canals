import dynamic from 'next/dynamic'
import { useState } from 'react'
import Popup from '@/components/dom/Popup'

const Game = dynamic(() => import('@/components/canvas/Game'), { ssr: false })

export default function Page(props) {
  const [showPopup, setShowPopup] = useState(false) // Add state to manage popup visibility
  
  return (
    <>
      {showPopup && (
        <Popup>
          test
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
