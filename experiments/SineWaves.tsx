import { useLayoutEffect, useRef } from 'react'

const wave = {
  amplitude: 150,
  wavelength: 50,
  frequency: 1,
  trail: 15,
  trailGap: 15,
  xOffset: 0,
  hue: 0
}

const SineWaves = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null!)

  useLayoutEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    const animate = () => {
      requestAnimationFrame(animate)

      ctx.fillStyle = '#333'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.moveTo(0, canvas.height / 2)
      
      for (let i = 0; i < wave.trail; i++) {
        ctx.beginPath()
        for (let x = 0; x < canvas.width + wave.trail * wave.trailGap; x++) {
          const y = wave.amplitude * Math.sin(x / wave.wavelength - wave.xOffset) + canvas.height / 2
          ctx.lineTo(x - i * wave.trailGap, y)
        }
        ctx.strokeStyle = `
          hsla(${wave.hue - i / wave.trail * 100}, 
          80%, 
          60%, 
          ${Math.abs(Math.sin(wave.xOffset - i / wave.trail))})`
        ctx.stroke()
      }


      wave.xOffset += wave.frequency / 100
      wave.hue += 0.2
    }

    animate()
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        border: '1px solid black',
        position: 'fixed',
        inset: 0
      }}
    />
  )
}

export default SineWaves