import { loadEnvFile } from 'node:process'
import app from './app.ts'

loadEnvFile()

const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})
