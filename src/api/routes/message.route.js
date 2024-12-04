import express from 'express'
import { authMiddleware } from '../Middlewares/AuthMiddleware.js'
import { catchError } from '../Utils/catchError.js'
import { MessageController } from '../controllers/message.controller.js'

export const messageRouter = express.Router()

messageRouter.post('/create', authMiddleware, catchError(MessageController.create))
messageRouter.delete('/remove/:id', authMiddleware, catchError(MessageController.remove))
messageRouter.patch('/edit/:id', authMiddleware, catchError(MessageController.edit))
