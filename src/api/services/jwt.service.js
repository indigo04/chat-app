import jwt from 'jsonwebtoken';

const secret = 'indigo04'

function generateAccessToken(user) {
  return jwt.sign(user, secret, { expiresIn: '1h' });
}

function generateRefreshToken(user) {
  return jwt.sign(user, secret, { expiresIn: '7d' });
}

function validateAccessToken(token) {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error(error)
  }
}

function validateRefreshToken(token) {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error(error)
  }
}

export const jwtService = {
  generateAccessToken,
  generateRefreshToken,
  validateAccessToken,
  validateRefreshToken,
};
