import { app, roomsController } from './app'
import { connectToDatabase } from './database/connection'

;(async () => {
  await connectToDatabase(roomsController)

  app.listen(3000, () => {
    console.log('Server listening on port 3000...')
  })
})()
