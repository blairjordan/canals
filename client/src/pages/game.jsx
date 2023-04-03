import dynamic from 'next/dynamic'
import Instructions from '@/components/dom/Instructions'

const Game = dynamic(() => import('@/components/canvas/Game'), { ssr: false })

export default function Page(props) {
  return (
    <Instructions>
      <span className='text-green-200'>Game Placeholder</span>.
    </Instructions>
  )
}

Page.canvas = (props) => <Game/>

export async function getStaticProps() {
  return { props: { title: 'Game' } }
}
