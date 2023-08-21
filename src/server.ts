import { app, roomsController } from './app'
import { connectToDatabase } from './database/connection'
import { PORT } from './config'

(async () => {
  await connectToDatabase(roomsController)

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`)
  })
})()
