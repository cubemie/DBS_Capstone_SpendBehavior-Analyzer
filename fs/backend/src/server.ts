import app from './app.ts'
import { env } from './config.ts'

app.listen(env.PORT, () => {
  console.log(`Listening on port ${env.PORT}`)
})
