import { User } from "../Models/User.js"

function find(userId) {
  return User.findByPk(userId)
}

function findByName(name) {
  return User.findOne({ where: { name } })
}

async function register(name, password) {
  return User.create({ name, password })
}

function login(name) {
  return User.findOne({ where: { name } })
}

export const UserService = {
  register,
  login,
  find,
  findByName
}
