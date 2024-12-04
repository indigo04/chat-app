import { ApiError } from "../Exceptions/ApiError.js"
import { jwtService } from "../services/jwt.service.js";


export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization']

  if (!authHeader) {
    throw ApiError.unauthorized()
  }

  const [, accessToken] = authHeader.split(' ');

  if (!accessToken) {
    throw ApiError.Unauthorized();
  }

  const userData = jwtService.validateAccessToken(accessToken);

  if (!userData) {
    throw ApiError.Unauthorized();
  }

  next()
}
