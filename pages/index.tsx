import Head from 'next/head'
import CanvasA from '../experiments/CanvasA'

export default function Home() {
  return (
    <div>
      <Head>
        <title>Canvas Experiments</title>
      </Head>

      <main>
        <CanvasA />
      </main>
    </div>
  )
}
