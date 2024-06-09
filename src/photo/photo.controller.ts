import * as express from "express";
import Controller from "../interfaces/controller.interface";
import { RequestWithUser } from "../interfaces/requestWithUser.interface";
import { authMiddleware } from "../middlewares/auth.middleware";
import PhotoService from "./photo.service";
import { photoUpdateMulter, upload } from "../middlewares/multer.middlware";
import WrongPhotoIdException from "../exceptions/WrongPhotoIdException";
import path from "path";
import { RequestWithUserAndPhoto } from "../interfaces/requestWithUserAndPhoto.interface";
import { photoUpdateMiddleware } from "../middlewares/photoUpdate.middleware";

class PhotoController implements Controller {
  public path = "/photo";
  public router = express.Router();
  private photoService = new PhotoService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}`,
      authMiddleware,
      upload.single("photo"),
      this.upload
    );

    this.router.get(`${this.path}/list`, authMiddleware, this.photosList);

    this.router.get(
      `${this.path}/download/:id`,
      authMiddleware,
      this.photoDownload
    );

    this.router.delete(
      `${this.path}/delete/:id`,
      authMiddleware,
      this.photoDelete
    );

    this.router.put(
      `${this.path}/update/:id`,
      authMiddleware,
      photoUpdateMiddleware,
      photoUpdateMulter.single("photo"),
      this.photoUpdate
    );

    this.router.get(`${this.path}/:id`, authMiddleware, this.getPhotoInfo);
  }

  private upload = async (
    request: RequestWithUserAndPhoto,
    response: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const { file, user } = request;
   
      const photoInfo = await this.photoService.upload(file, user);

      response.send({ photoInfo });
    } catch (error) {
      next(error);
    }
  };

  private photosList = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const { user } = request;
      const listSize = +request.query.list_size;
      const page = +request.query.page;

      const photosList = await this.photoService.photosList(user, listSize, page);

      response.send({ photosList });
    } catch (error) {
      next(error);
    }
  };

  private getPhotoInfo = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const { user } = request;

      const id = +request.params.id;

      if (!id) {
        throw new WrongPhotoIdException();
      }

      const photo = await this.photoService.getPhotoById(user, id);

      if (!photo) {
        throw new WrongPhotoIdException();
      }

      response.send(photo);
    } catch (error) {
      next(error);
    }
  };

  private photoDownload = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const { user } = request;

      const id = +request.params.id;

      if (!id) {
        throw new WrongPhotoIdException();
      }

      const photo = await this.photoService.getPhotoById(user, id);

      if (!photo) {
        throw new WrongPhotoIdException();
      }

      const photoPath = path.join(__dirname, "../uploads", photo.photoName);
      response.download(photoPath);
    } catch (error) {
      next(error);
    }
  };

  private photoDelete = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const { user } = request;

      const id = +request.params.id;

      if (!id) {
        throw new WrongPhotoIdException();
      }

      const deleteResult = await this.photoService.deletePhotoByID(user, id);

      if (deleteResult.affected === 0) {
        throw new WrongPhotoIdException();
      }

      return response.json({
        success: 1,
        message: "photo deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  private photoUpdate = async (
    request: RequestWithUserAndPhoto,
    response: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const { user } = request;

      const id = +request.params.id;

      const photo = await this.photoService.updatePhotoById(user, id, request.photo);

      response.send(photo);
    } catch (error) {
      next(error);
    }
  };
}

export default PhotoController;
