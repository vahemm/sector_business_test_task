import { NextFunction, Response } from "express";
import WrongAuthenticationTokenException from "../exceptions/WrongAuthenticationTokenException";
import { RequestWithUserAndOldPhoto } from "../interfaces/requestWithUserAndPhoto.interface";
import PhotoService from "../photo/photo.service";
import WrongPhotoIdException from "../exceptions/WrongPhotoIdException";

export async function photoUpdateMiddleware(
  request: RequestWithUserAndOldPhoto,
  response: Response,
  next: NextFunction
) {
  const photoService = new PhotoService();

  try {
    const id = +request.params.id;

    if (!id) {
      throw new WrongPhotoIdException();
    }

    request.oldPhoto = await photoService.getPhotoById(request.user, id);

    next();
  } catch (error) {
    next(new WrongAuthenticationTokenException());
  }
}
