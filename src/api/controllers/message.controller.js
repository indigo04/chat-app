import { ApiError } from "../Exceptions/ApiError.js";
import { wss } from "../index.js";
import { MessageService } from "../services/message.service.js";
import { RoomService } from "../services/room.service.js";


async function create(req, res) {
  const { roomId, author, body } = req.body

  const existRoom = await RoomService.find(roomId)

  if (!existRoom) {
    throw ApiError.notFound()
  }

  if (!author) {
    throw ApiError.notFound()
  }

  if (!body) {
    throw ApiError.badRequest('Body is required')
  }

  const message = await MessageService.create(roomId, author, body)

  wss.emit('message', message)

  res.status(200).send(message)
}

async function remove(req, res) {
  const { author } = req.body
  const { id } = req.params;
  const message = await MessageService.findOne(id)

  if (!message) {
    throw ApiError.notFound()
  }

  if (!author) {
    throw ApiError.notFound()
  }

  if (message.author !== author) {
    throw ApiError.forbidden()
  }

  wss.emit('remove', message)
  await MessageService.remove(id, author)

  res.sendStatus(204)
}

async function edit(req, res) {
  const { body } = req.body
  const { id } = req.params;

  const message = await MessageService.findOne(id)

  if (!message) {
    throw ApiError.notFound()
  }

  if (!body) {
    throw ApiError.badRequest('Body is required')
  }

  message.body = body
  await message.save()
  wss.emit('edit', message)

  res.send(message)
}

export const MessageController = {
  create,
  remove,
  edit
}
