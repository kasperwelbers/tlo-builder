import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { type Env } from './types'

export { ProjectRoom } from './ws/ProjectRoom'

const app = new Hono<{ Bindings: Env }>()

app.use('*', cors())

app.get('/', (c) => c.text('TLO Builder API'))

app.get('/ws/:projectId', async (c) => {
  const projectId = c.req.param('projectId')
  const id = c.env.PROJECT_ROOM.idFromName(projectId)
  const room = c.env.PROJECT_ROOM.get(id)
  return room.fetch(c.req.raw)
})

export default app
