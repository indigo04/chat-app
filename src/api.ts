import axios from 'axios'

axios.defaults.baseURL = 'http://localhost:3005'
axios.defaults.withCredentials = true

type AuthProps = {
  name: string
  password: string
}

type RoomProps = {
  name: string
  password: string
  user: string | null
}

type AdditionalRoomProps = {
  roomId: string
  userId: string
}

type MessageProps = {
  roomId: string
  author: string
  body: string
}

axios.interceptors.request.use((request) => {
  const accessToken = localStorage.getItem('accessToken')

  if (accessToken) {
    request.headers.Authorization = `Bearer ${accessToken}`
  }

  return request
})

async function find(userId: string) {
  const response = await axios.post('/find', { userId })
  return response.data
}

async function searchRoom(id: string) {
  const response = await axios.get(`/room/search/${id}`)
  return response.data
}

async function login({ name, password }: AuthProps) {
  const response = await axios.post('/login', { name, password })
  return response.data
}
async function logout() {
  const response = await axios.get('/logout')
  return response.data
}

async function register({ name, password }: AuthProps) {
  const response = await axios.post('/register', { name, password })
  return response.data
}

async function refresh() {
  const response = await axios.get('/refresh')
  return response.data
}

async function createRoom({ name, password, user }: RoomProps) {
  const response = await axios.post('/room/create', { name, password, admin: user })
  return response.data
}

async function joinRoom({ name, password, user }: RoomProps) {
  const response = await axios.post('/room/join', { name, password, user })
  return response.data
}

async function findUsers(users: string[]) {
  const response = await axios.post('/room/users', { users })
  return response.data
}

async function removeRoom({ roomId, userId }: AdditionalRoomProps) {
  const response = await axios.delete(`/room/remove/${roomId}`, { data: { userId } })
  return response.data
}

async function leave({ roomId, userId }: AdditionalRoomProps) {
  const response = await axios.patch(`/room/leave/${roomId}`, { userId })
  return response.data
}

async function createMessage({ roomId, author, body }: MessageProps) {
  const response = await axios.post('/message/create', { roomId, author, body })
  return response.data
}

async function editMessage(id: string, author: string, body: string) {
  const response = await axios.patch(`/message/edit/${id}`, { author, body })
  return response.data
}

async function removeMessage(id: string, author: string) {
  const response = await axios.delete(`/message/remove/${id}`, { data: { author } })
  return response.data
}

export const ApiController = {
  login,
  logout,
  register,
  refresh,
  createRoom,
  joinRoom,
  removeRoom,
  leave,
  find,
  findUsers,
  searchRoom,
  createMessage,
  removeMessage,
  editMessage,
}
