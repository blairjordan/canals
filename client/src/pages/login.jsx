import dynamic from 'next/dynamic'
import Instructions from '@/components/dom/Instructions'

const Login = dynamic(() => import('@/components/canvas/Login'), { ssr: false })

export default function Page(props) {
  return (
    <Instructions>
      <span className='text-green-200'>Login Placeholder</span>.
    </Instructions>
  )
}

Page.canvas = (props) => <Login route='/'/>

export async function getStaticProps() {
  return { props: { title: 'Login' } }
}
