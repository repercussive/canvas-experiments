import Head from 'next/head'
import SineWaves from '@/experiments/SineWaves'

export default function Home() {
  return (
    <div>
      <Head>
        <title>Canvas Experiments</title>
      </Head>

      <main>
        <SineWaves />
      </main>
    </div>
  )
}
