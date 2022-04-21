import randomInRange from '@/logic/util/randomInRange'
import { useLayoutEffect, useRef } from 'react'

const colors = ['coral', 'skyblue', 'slategray']
let mousePos = undefined as undefined | { x: number, y: number }

class Circle {
  private x = 0
  private y = 0
  private baseRadius
  private radius
  private color
  private dx = randomInRange(0.05, 0.1) * (Math.random() > 0.5 ? 1 : -1)
  private dy = randomInRange(0.05, 0.1) * (Math.random() > 0.5 ? 1 : -1)
  private ctx
  private canvas
  private bounds = { x: { lower: 0, upper: 0 }, y: { lower: 0, upper: 0 } }

  constructor(args: { canvas: HTMLCanvasElement, baseRadius: number }) {
    const { canvas, baseRadius } = args
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.baseRadius = baseRadius
    this.radius = baseRadius
    this.color = colors[Math.floor(randomInRange(0, colors.length))]
    this.setBounds()
    this.randomizePosition()
  }

  public update = () => {
    if (this.x < this.bounds.x.lower) this.dx = Math.abs(this.dx)
    if (this.x > this.bounds.x.upper) this.dx = -Math.abs(this.dx)
    if (this.y < this.bounds.y.lower) this.dy = Math.abs(this.dy)
    if (this.y > this.bounds.y.upper) this.dy = -Math.abs(this.dy)

    const unsettleAmount = this.radius - this.baseRadius
    this.x += this.dx * unsettleAmount
    this.y += this.dy * unsettleAmount
    this.draw()
  }

  public setBounds = () => {
    const { baseRadius: radius, canvas } = this
    const xBounds = { lower: radius, upper: canvas.width - radius }
    const yBounds = { lower: radius, upper: canvas.height - radius }
    this.bounds = { x: xBounds, y: yBounds }
  }

  public randomizePosition = () => {
    this.x = randomInRange(this.bounds.x.lower, this.bounds.x.upper)
    this.y = randomInRange(this.bounds.y.lower, this.bounds.y.upper)
  }

  private draw = () => {
    const ctx = this.ctx
    this.radius = this.calculateRadius()
    ctx.beginPath()
    ctx.fillStyle = this.color
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    ctx.fill()
  }

  private calculateRadius = () => {
    if (!mousePos) return this.baseRadius
    const deltaX = Math.abs(this.x - mousePos.x)
    const deltaY = Math.abs(this.y - mousePos.y)
    const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2)
    const grow = 1 / Math.pow(Math.max(distance / 500, 0.15), 2)
    return this.baseRadius + grow
  }
}


const InteractiveBalls = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null!)

  useLayoutEffect(() => {
    startTrackingMousePosition()

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const circles = [] as Circle[]

    for (let i = 0; i < 500; i++) {
      const circle = new Circle({ canvas, baseRadius: 5 })
      circles.push(circle)
    }

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      circles.forEach((circle) => circle.setBounds())
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    const animate = () => {
      requestAnimationFrame(animate)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      circles.forEach((circle) => circle.update())
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

export default InteractiveBalls