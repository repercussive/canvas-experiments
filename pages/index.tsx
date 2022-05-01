import Head from 'next/head'
import CircularMotion from '@/experiments/CircularMotion'

export default function Home() {
  return (
    <div>
      <Head>
        <title>Canvas Experiments</title>
      </Head>

      <main>
        <CircularMotion />
      </main>
    </div>
  )
}
