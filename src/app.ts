import express from 'express'
import api from './routes/api.router'

export const app = express()

app.use(express.json())

app.use(api)

app.get('/', (_req, res) => {
  res.send('Hello World!')
})
