import winston from 'winston'
import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'

// Create logs directory if it doesn't exist
const logsDir = join(process.cwd(), 'logs')
if (!existsSync(logsDir)) {
  mkdirSync(logsDir, { recursive: true })
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
})

if (process.env.NODE_ENV === 'development') {
  logger.add(
    new winston.transports.File({
      filename: join(logsDir, 'error.log'),
      level: 'error',
    })
  )
  logger.add(
    new winston.transports.File({
      filename: join(logsDir, 'combined.log'),
    })
  )
}

export { logger }
