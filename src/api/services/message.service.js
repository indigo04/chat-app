import { Message } from "../Models/Message.js"

async function findOne(id) {
  return Message.findByPk(id)
}

async function getAll(roomId) {
  return Message.findAll({ where: { roomId } })
}

function create(roomId, author, body) {

  return Message.create({ roomId, author, body })
}

async function remove(id) {
  return Message.destroy({ where: { id } })
}

export const MessageService = {
  findOne,
  getAll,
  create,
  remove,
}
