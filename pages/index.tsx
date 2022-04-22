import Head from 'next/head'
import CollidingParticles from '@/experiments/CollidingParticles'

export default function Home() {
  return (
    <div>
      <Head>
        <title>Canvas Experiments</title>
      </Head>

      <main>
        <CollidingParticles />
      </main>
    </div>
  )
}
