import fs from 'fs'
import { pool } from '../src/db-conn.ts'

async function migrate() {
  const migrationsDir = new URL('../migrations/', import.meta.url)
  const files = fs.readdirSync(migrationsDir).sort()

  try {
    for (const file of files) {
      const sql = fs.readFileSync(new URL(file, migrationsDir), 'utf-8')

      console.log(`running migration: ${file}`)
      await pool.query(sql)
    }

    console.log('migration complete')
  } catch (err) {
    console.error(err)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

void migrate()
