import app from './app.ts'
import { env } from './config.ts'
import { logStartup } from './utils/logger.ts'

app.listen(env.PORT, () => {
  logStartup(env.PORT)
})
