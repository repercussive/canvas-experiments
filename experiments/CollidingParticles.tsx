import randomInRange from '@/logic/util/randomInRange'
import { useLayoutEffect, useRef } from 'react'

const colors = ['coral', 'skyblue', 'slategray']
let mousePos = undefined as undefined | { x: number, y: number }

class Particle {
  public x = 0
  public y = 0
  public radius
  public velocity = { x: Math.random() > 0.5 ? 1 : -1, y: Math.random() > 0.5 ? 1 : -1 }
  public mass = 1
  private opacity = 0
  private color
  private ctx
  private canvas
  private bounds = { x: { lower: 0, upper: 0 }, y: { lower: 0, upper: 0 } }

  constructor(args: { canvas: HTMLCanvasElement, radius: number, color: string }) {
    const { canvas, radius, color } = args
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.radius = radius
    this.color = color
    this.setBounds()
    this.randomizePosition()
  }

  public update = (allParticles: Particle[]) => {
    if (this.x < this.bounds.x.lower) this.velocity.x = Math.abs(this.velocity.x)
    if (this.x > this.bounds.x.upper) this.velocity.x = -Math.abs(this.velocity.x)
    if (this.y < this.bounds.y.lower) this.velocity.y = Math.abs(this.velocity.y)
    if (this.y > this.bounds.y.upper) this.velocity.y = -Math.abs(this.velocity.y)

    this.x += this.velocity.x
    this.y += this.velocity.y

    for (const particle of allParticles) {
      if (this === particle) continue
      if (areParticlesColliding(this, particle)) {
        resolveCollision(this, particle)
      }
    }

    if (mousePos && getDistance(mousePos, this) < 150) {
      this.opacity = Math.min(1, this.opacity + 0.1)
    } else {
      this.opacity = Math.max(0, this.opacity - 0.02)
    }

    this.draw()
  }

  public setPosition = (x: number, y: number) => {
    this.x = x
    this.y = y
  }

  public setColor = (color: string) => {
    this.color = color
  }

  public setBounds = () => {
    const { radius, canvas } = this
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
    ctx.beginPath()
    ctx.strokeStyle = this.color
    ctx.fillStyle = this.color
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    ctx.stroke()
    ctx.save()
    ctx.globalAlpha = this.opacity
    ctx.fill()
    ctx.restore()
  }
}


const CollidingParticles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null!)

  useLayoutEffect(() => {
    startTrackingMousePosition()

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles = [] as Particle[]

    for (let i = 0; i < 350; i++) {
      const newParticle = new Particle({
        canvas,
        radius: 10,
        color: colors[Math.floor(randomInRange(0, colors.length))]
      })

      for (let j = 0; j < particles.length; j++) {
        if (areParticlesColliding(newParticle, particles[j])) {
          newParticle.randomizePosition()
          j = -1
        }
      }

      particles.push(newParticle)
    }

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      particles.forEach((particle) => particle.setBounds())
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    const animate = () => {
      requestAnimationFrame(animate)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((particle) => {
        particle.update(particles)
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

function getDistance(p1: { x: number, y: number }, p2: { x: number, y: number }) {
  const deltaX = p2.x - p1.x
  const deltaY = p2.y - p1.y
  return Math.sqrt(deltaX ** 2 + deltaY ** 2)
}

function areParticlesColliding(p1: Particle, p2: Particle) {
  const collisionDistance = p1.radius + p2.radius
  return getDistance(p1, p2) < collisionDistance
}

function rotate(velocity: { x: number, y: number }, angle: number) {
  const rotatedVelocities = {
    x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
    y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
  }

  return rotatedVelocities
}

function resolveCollision(particle1: Particle, particle2: Particle) {
  const xVelocityDiff = particle1.velocity.x - particle2.velocity.x
  const yVelocityDiff = particle1.velocity.y - particle2.velocity.y

  const xDist = particle2.x - particle1.x
  const yDist = particle2.y - particle1.y

  // Prevent accidental overlap of particles
  if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {

    // Grab angle between the two colliding particles
    const angle = -Math.atan2(particle2.y - particle1.y, particle2.x - particle1.x)

    // Store mass in var for better readability in collision equation
    const m1 = particle1.mass
    const m2 = particle2.mass

    // Velocity before equation
    const u1 = rotate(particle1.velocity, angle)
    const u2 = rotate(particle2.velocity, angle)

    // Velocity after 1d collision equation
    const v1 = { x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2), y: u1.y }
    const v2 = { x: u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m2 / (m1 + m2), y: u2.y }

    // Final velocity after rotating axis back to original location
    const vFinal1 = rotate(v1, -angle)
    const vFinal2 = rotate(v2, -angle)

    // Swap particle velocities for realistic bounce effect
    particle1.velocity.x = vFinal1.x
    particle1.velocity.y = vFinal1.y

    particle2.velocity.x = vFinal2.x
    particle2.velocity.y = vFinal2.y
  }
}

export default CollidingParticles