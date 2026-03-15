import cors from 'cors'
import express from 'express'
import morgan from 'morgan'
import assetsRoutes from './routes/assetsRoutes.js'
import authRoutes from './routes/authRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'
import paymentsRoutes from './routes/paymentsRoutes.js'
import rentalsRoutes from './routes/rentalsRoutes.js'
import tenantsRoutes from './routes/tenantsRoutes.js'
import usersRoutes from './routes/usersRoutes.js'

const app = express()

app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' })
})

app.use('/api/auth', authRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/assets', assetsRoutes)
app.use('/api/rentals', rentalsRoutes)
app.use('/api/tenants', tenantsRoutes)
app.use('/api/payments', paymentsRoutes)
app.use('/api/users', usersRoutes)

app.use((error, _request, response, _next) => {
  console.error(error)
  response.status(500).json({ message: 'Something went wrong.' })
})

export default app
