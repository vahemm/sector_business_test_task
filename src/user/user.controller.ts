import * as express from "express";
import Controller from "../interfaces/controller.interface";
import { LoginUserDto, CreateUserDto } from "./dtos/user.dto";
import UserService from "./user.service";
import validationMiddleware from "../middlewares/validation.middleware";
import { RefreshTokenDto } from "./dtos/refreshToken.dto";
import { RequestWithUser } from "../interfaces/requestWithUser.interface";
import { authMiddleware } from "../middlewares/auth.middleware";
import User from "./user.entity";

class UserController implements Controller {
  public path = "/user";
  public router = express.Router();
  private userService = new UserService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/register`,
      validationMiddleware(CreateUserDto),
      this.register
    );
    this.router.post(
      `${this.path}/login`,
      validationMiddleware(LoginUserDto),
      this.login
    );
    this.router.post(
      `${this.path}/signin/new_token`,
      validationMiddleware(RefreshTokenDto),
      this.updateToken
    );

    this.router.post(
      `${this.path}/logout`,
      authMiddleware,
      this.logout
    );
  }

  private register = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const userData: CreateUserDto = request.body;
    try {
      const { accessToken, refreshToken, user } =
        await this.userService.register(userData);
      response.send({ user, accessToken, refreshToken });
    } catch (error) {
      next(error);
    }
  };

  private login = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const userData: LoginUserDto = request.body;
    try {
      const { accessToken, refreshToken, user } =
        await this.userService.login(userData);
      response.send({ user, accessToken, refreshToken });
    } catch (error) {
      next(error);
    }
  };

  private updateToken = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const data: RefreshTokenDto = request.body;
    try {
      const { accessToken, refreshToken, user } =
        await this.userService.updateToken(data);
      response.send({ user, accessToken, refreshToken });
    } catch (error) {
      next(error);
    }
  };

  private logout = async (
    request: RequestWithUser,
    response: express.Response,
    next: express.NextFunction
  ) => {
    const user: User = request.user;
    const deviceId: string = request.body.deviceId;
    try {
      await this.userService.logout(user, deviceId);
      response.status(200).json({ message: "You are logged out!" });
    } catch (error) {
      next(error);
    }
  };
}

export default UserController;
