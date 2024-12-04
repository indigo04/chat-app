import { ApiError } from "../Exceptions/ApiError.js";
import { MessageService } from "../services/message.service.js"
import { RoomService } from "../services/room.service.js"
import bcrypt from 'bcrypt'

function normalize(room) {
  const { id, name, admin, users } = room
  const normalized = { id, name, admin, users };

  return normalized
}

async function searchRoom(req, res) {
  const { id } = req.params
  const rooms = await RoomService.findAll();
  let room = null;
  rooms.map(element => {
    if (element.users.includes(id)) {
      room = element
    }
  })

  const data = room !== null ? room : null

  let messages = []

  if (room !== null) {
    messages = await MessageService.getAll(room.id)
  }

  res.send({ data, messages })
}

async function create(req, res) {
  const { name, password, admin } = req.body

  if (!name) {
    throw ApiError.badRequest('Name is required')
  }

  if (!password) {
    throw ApiError.badRequest('Password is required')
  }

  if (password.length < 6) {
    throw ApiError.badRequest('Your password is too short')
  }

  if (!admin) {
    throw ApiError.unauthorized()
  }

  const existRoom = await RoomService.findByName(name)

  if (existRoom) {
    throw ApiError.badRequest('Name is already taken')
  }

  const hashed = await bcrypt.hash(password, 10)

  const room = await RoomService.create(name, hashed, admin)

  if (room) {
    room.users = [...room.users, admin]
    await room.save()

    const normalizedRoom = normalize(room)

    res.status(200).send(normalizedRoom)
  }
}

async function join(req, res) {
  const { name, password, user } = req.body

  if (!name) {
    throw ApiError.badRequest('Name is required')
  }

  if (!password) {
    throw ApiError.badRequest('Password is required')
  }

  if (!user) {
    throw ApiError.unauthorized()
  }

  const room = await RoomService.findByName(name)

  let messages = []

  if (room !== null) {
    const isPasswordValid = await bcrypt.compare(password, room.password)

    if (!isPasswordValid) {
      throw ApiError.badRequest('Incorrect password')
    }
    messages = await MessageService.getAll(room.id)

    const usersSet = new Set(room.users)
    usersSet.add(user)

    room.users = Array.from(usersSet)
    await room.save()

    const normalizedRoom = normalize(room)

    res.send({ room: normalizedRoom, messages })
  }

  throw ApiError.badRequest('Wrong name or password')
}

async function remove(req, res) {
  const { userId } = req.body
  const { id } = req.params

  if (!userId) {
    throw ApiError.unauthorized()
  }

  const room = await RoomService.find(id)


  if (!room) {
    throw ApiError.notFound()
  }

  if (room.admin === userId) {
    await RoomService.remove(id, userId)
    res.sendStatus(204)
  }

  throw ApiError.forbidden()
}

async function leave(req, res) {
  const { userId } = req.body
  const { id } = req.params
  const room = await RoomService.find(id)

  if (!userId) {
    throw ApiError.unauthorized()
  }

  if (!room) {
    throw ApiError.notFound()
  }

  if (room.admin === userId) {
    await RoomService.remove(id, userId)
    res.sendStatus(204)
  }
  room.users = room.users.filter(item => item !== userId)

  await room.save()
  res.sendStatus(204)
}

export const RoomController = {
  create,
  join,
  remove,
  leave,
  searchRoom
}
