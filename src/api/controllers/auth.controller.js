import { ApiError } from "../Exceptions/ApiError.js"
import { UserService } from "../services/auth.service.js"
import { jwtService } from "../services/jwt.service.js"
import { tokenService } from "../services/token.service.js"
import bcrypt from 'bcrypt'

function normalize(user) {
  const { id, name } = user;
  const normalized = { id, name }

  return normalized
}

async function find(req, res) {
  const { userId } = req.body;
  const user = await UserService.find(userId)
  const normalized = normalize(user)
  res.send(normalized)
}

async function findAll(req, res) {
  const { users } = req.body;
  const array = [];
  for (const el of users) {
    const user = await UserService.find(el)
    const normalized = normalize(user)
    array.push(normalized)
  }

  res.send({users: array})
}


async function register(req, res) {
  const { name, password } = req.body

  if (!name) {
    throw ApiError.badRequest('Name is required')
  }

  if (!password) {
    throw ApiError.badRequest('Password is required')
  }

  if (password.length < 6) {
    throw ApiError.badRequest('Your password is too short')
  }

  const existUser = await UserService.findByName(name)

  if (existUser) {
    throw ApiError.badRequest('Name is already taken')
  }

  const hashed = await bcrypt.hash(password, 10)

  const user = await UserService.register(name, hashed)

  await sendAuthentication(res, user);
}

async function login(req, res) {
  const { name, password } = req.body

  if (!name) {
    throw ApiError.badRequest('Name is required')
  }

  if (!password) {
    throw ApiError.badRequest('Password is required')
  }

  const user = await UserService.login(name)

  if (!user) {
    throw ApiError.notFound()
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw ApiError.badRequest('Incorrect password')
  }

  await sendAuthentication(res, user);
}

async function refresh(req, res) {
  const { refreshToken } = req.cookies;
  const userData = jwtService.validateRefreshToken(refreshToken);

  if (!userData) {
    throw ApiError.Unauthorized();
  }

  const token = tokenService.getByToken(refreshToken);

  if (!token) {
    throw ApiError.Unauthorized();
  }

  const user = await UserService.find(userData.id);

  await sendAuthentication(res, user);
}

async function logout(req, res) {
  const { refreshToken } = req.cookies;
  const userData = jwtService.validateRefreshToken(refreshToken);

  res.clearCookie('refreshToken');

  if (userData) {
    await tokenService.remove(userData.id);
  }

  res.sendStatus(204);
}

async function sendAuthentication(res, user) {
  const normalized = normalize(user)
  const accessToken = jwtService.generateAccessToken(normalized);
  const refreshToken = jwtService.generateRefreshToken(normalized);

  await tokenService.save(user.id, refreshToken);

  res.cookie('refreshToken', refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });

  res.send({
    user: normalized,
    accessToken,
  });
}

export const AuthController = {
  register,
  login,
  logout,
  refresh,
  find,
  findAll
}
