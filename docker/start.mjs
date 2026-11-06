import net from 'node:net'

if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
  const secret = process.env.PAYLOAD_SECRET ?? ''
  if (!secret || secret.startsWith('demo-only-') || secret.startsWith('replace-with-')) {
    throw new Error('Configure a secure PAYLOAD_SECRET before using PostgreSQL mode.')
  }
  let db
  try {
    db = new URL(process.env.DATABASE_URL || '')
  } catch {
    throw new Error('DATABASE_URL must be a valid PostgreSQL URI.')
  }
  if (!['postgres:', 'postgresql:'].includes(db.protocol)) {
    throw new Error('PostgreSQL mode requires a postgres:// or postgresql:// DATABASE_URL.')
  }
  if (!db.password || db.password === 'demo-only-change-me' || db.password.startsWith('replace-')) {
    throw new Error('Configure a strong POSTGRES_PASSWORD before using PostgreSQL mode.')
  }
  let connected = false
  for (let attempt = 0; attempt < 45; attempt++) {
    connected = await new Promise(resolve => {
      const socket = net.connect({ host: db.hostname, port: Number(db.port || 5432) })
      socket.setTimeout(2000)
      socket.once('connect', () => { socket.destroy(); resolve(true) })
      socket.once('error', () => { socket.destroy(); resolve(false) })
      socket.once('timeout', () => { socket.destroy(); resolve(false) })
    })
    if (connected) break
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  if (!connected) throw new Error('PostgreSQL is unreachable after 90 seconds.')
}

await import('./server.js')
