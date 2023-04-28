import { Router } from 'express'
import { UsersController } from '../controllers/users/users.controller'

const router = Router()
const usersController = new UsersController()

router.get('/', (req, res) => usersController.findAll(req, res))

router.get('/:id', (req, res) => usersController.findOne(req, res))

router.post('/', (req, res) => usersController.create(req, res))

router.put('/:id', (req, res) => usersController.update(req, res))

router.delete('/:id', (req, res) => usersController.delete(req, res))

export default router
