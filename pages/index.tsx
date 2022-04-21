import Head from 'next/head'
import InteractiveBalls from '@/experiments/InteractiveBalls'

export default function Home() {
  return (
    <div>
      <Head>
        <title>Canvas Experiments</title>
      </Head>

      <main>
        <InteractiveBalls />
      </main>
    </div>
  )
}
