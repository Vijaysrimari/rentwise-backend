import dotenv from 'dotenv'
import app from './app.js'
import { connectDatabase } from './config/db.js'
import { seedDatabase } from './config/seedData.js'

dotenv.config()

const port = process.env.PORT || 5000

const startServer = async () => {
  try {
    await connectDatabase()
    await seedDatabase()

    app.listen(port, () => {
      console.log(`RentWise API running on port ${port}`)
    })
  } catch (error) {
    console.error('Unable to start server:', error)
    process.exit(1)
  }
}

startServer()
