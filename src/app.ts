import express from 'express'
import api from './routes/api.router'
import cors from 'cors'

export const app = express()

app.use(cors())
app.use(express.json())

app.use(api)

app.get('/', (_req, res) => {
  res.send('Hello World!')
})
