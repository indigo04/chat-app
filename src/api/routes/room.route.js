import express from 'express';
import { RoomController } from '../controllers/room.controller.js';
import { authMiddleware } from '../Middlewares/AuthMiddleware.js';
import { catchError } from '../Utils/catchError.js';
import { AuthController } from '../controllers/auth.controller.js';

export const roomRouter = express.Router();

roomRouter.post('/join', authMiddleware, catchError(RoomController.join))
roomRouter.post('/create', authMiddleware, catchError(RoomController.create))
roomRouter.delete('/remove/:id', authMiddleware, catchError(RoomController.remove))
roomRouter.patch('/leave/:id', authMiddleware, catchError(RoomController.leave))
roomRouter.get('/search/:id', authMiddleware, catchError(RoomController.searchRoom))
roomRouter.post('/users', authMiddleware, catchError(AuthController.findAll))
