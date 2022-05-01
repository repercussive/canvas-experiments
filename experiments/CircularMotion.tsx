import randomInRange from '@/logic/util/randomInRange'
import { useLayoutEffect, useRef } from 'react'

type Coords = { x: number, y: number }

const colors = ['aquamarine', 'violet', 'slateblue']
let mousePos = undefined as Coords | undefined

class Particle {
  private x = 0
  private y = 0
  private radius = randomInRange(1.5, 3)
  private rotationSpeed = randomInRange(0.5, 1)
  private centerMoveSpeed = randomInRange(0.015, 0.05)
  private radians = randomInRange(0, Math.PI * 2)
  private distanceFromCenter = randomInRange(100, 200)
  private centerPos
  private color
  private ctx
  private canvas

  constructor(args: { canvas: HTMLCanvasElement, color: string }) {
    const { canvas, color } = args
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.color = color
    this.centerPos = {
      x: this.canvas.width / 2,
      y: this.canvas.height / 2
    }
    this.updatePosition()
  }

  public update = () => {
    const previousPoint = { x: this.x, y: this.y }
    this.radians += this.rotationSpeed * 0.03

    const targetCenterPos = mousePos ?? this.centerPos
    this.centerPos = {
      x: this.centerPos.x + this.centerMoveSpeed * (targetCenterPos.x - this.centerPos.x),
      y: this.centerPos.y + this.centerMoveSpeed * (targetCenterPos.y - this.centerPos.y)
    }
    this.updatePosition()

    this.draw(previousPoint)
  }

  public setColor = (color: string) => {
    this.color = color
  }

  private updatePosition = () => {
    this.x = this.centerPos.x + this.distanceFromCenter * Math.sin(this.radians)
    this.y = this.centerPos.y - this.distanceFromCenter * Math.cos(this.radians)
  }

  private draw = (previousPoint: Coords) => {
    const ctx = this.ctx
    ctx.beginPath()
    ctx.strokeStyle = this.color
    ctx.lineWidth = this.radius
    ctx.moveTo(previousPoint.x, previousPoint.y)
    ctx.lineTo(this.x, this.y)
    ctx.stroke()
    ctx.closePath()
  }
}


const CircularMotion = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null!)

  useLayoutEffect(() => {
    startTrackingMousePosition()

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles = [] as Particle[]

    for (let i = 0; i < 50; i++) {
      const newParticle = new Particle({
        canvas,
        color: colors[Math.floor(randomInRange(0, colors.length))]
      })

      particles.push(newParticle)
    }

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    const animate = () => {
      requestAnimationFrame(animate)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      particles.forEach((particle) => {
        particle.update()
      })
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

function startTrackingMousePosition() {
  window.addEventListener('mousemove', (e) => {
    mousePos = { x: e.clientX, y: e.clientY }
  })
}

export default CircularMotion