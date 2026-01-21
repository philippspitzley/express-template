import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'

import { appEnv } from '../env.ts'
import { errorHandler } from './middleware/errorHandler.ts'
import { notFound } from './middleware/notFoundHandler.ts'
import routesIndex from './routes/index.ts'

const app = express()

// Middleware -------------------------------------- //
app.use(helmet())
app.use(
  cors({
    origin: appEnv.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
    credentials: true,
  }),
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

// Routers ----------------------------------------- //
app.use('/', routesIndex)

// Errorhandler - Must be last --------------------- //
app.use(notFound)
app.use(errorHandler)

export { app }
export default app
