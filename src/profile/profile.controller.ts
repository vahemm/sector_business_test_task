import * as express from "express";
import Controller from "../interfaces/controller.interface";
import { RequestWithUser } from "../interfaces/requestWithUser.interface";
import { authMiddleware } from "../middlewares/auth.middleware";
import ProfileService from "./profile.service";
import User from "../user/user.entity";
import WrongProfileIdException from "../exceptions/WrongProfileIdException";
import validationMiddleware from "../middlewares/validation.middleware";
import { UpdateProfileDto } from "./dtos/profile.dto";

class ProfileController implements Controller {
  public path = "/profile";
  public router = express.Router();
  private profileService = new ProfileService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, authMiddleware, this.profile);
    this.router.get(`${this.path}s`, this.profiles);
    this.router.get(`${this.path}/:id`, this.getProfileById);
    this.router.put(
      `${this.path}`,
      authMiddleware,
      validationMiddleware(UpdateProfileDto),
      this.updateProfileById
    );
  }

  private profile = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const user: User = request.user;

    try {
      response.send({ user });
    } catch (error) {
      next(error);
    }
  };

  private getProfileById = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const id = +request.params.id;

    if (!id) {
      throw new WrongProfileIdException();
    }

    try {
      const user = await this.profileService.getProfileById(id);

      response.send({ user });
    } catch (error) {
      next(error);
    }
  };

  private updateProfileById = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const user = await this.profileService.updateProfileById(
      request.user.id,
      request.body
    );

    try {
      response.send({ user });
    } catch (error) {
      next(error);
    }
  };

  private profiles = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const page = +request.query.page;
      const authorization = request.headers.authorization;
      const profiles = await this.profileService.profiles(page, authorization);

      response.send({ profiles });
    } catch (error) {
      next(error);
    }
  };
}

export default ProfileController;
