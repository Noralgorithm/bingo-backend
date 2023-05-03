import { NextFunction, Request, Response } from 'express'
import { ApiResponseDto } from '../utils/api_response_dto.util'

const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.body.role !== 'admin' && req.body.role !== 'super') {
    return res
      .status(403)
      .send(new ApiResponseDto(false, 'Access denied', null))
  }
  next()
}

export default isAdmin
