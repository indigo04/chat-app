import { Room } from "../Models/Room.js"

async function create(name, password, admin) {
  return Room.create({ name, password, admin })
}

function find(id) {
  return Room.findByPk(id);
}

function findAll() {
  return Room.findAll()
}

function findByName(name) {
  return Room.findOne({ where: { name } })
}

async function remove(roomId) {
  return Room.destroy({ where: { id: roomId } })
}


export const RoomService = {
  create,
  find,
  findAll,
  findByName,
  remove,
}
