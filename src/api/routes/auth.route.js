import express from 'express'
import { catchError } from '../Utils/catchError.js'
import { AuthController } from '../controllers/auth.controller.js'
import { authMiddleware } from '../Middlewares/AuthMiddleware.js'

export const authRouter = express.Router()

authRouter.post('/login', catchError(AuthController.login))
authRouter.post('/register', catchError(AuthController.register))
authRouter.get('/logout', authMiddleware, catchError(AuthController.logout));
authRouter.get('/refresh', authMiddleware, catchError(AuthController.refresh));
authRouter.post('/find', authMiddleware, catchError(AuthController.find))

