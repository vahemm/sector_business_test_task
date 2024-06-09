import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import dataSource from "../config/typeorm.config";

import UserWithThatCredentialsAlreadyExistsException from "../exceptions/UserWithThatCredentialsAlreadyExistsException";
import DataStoredInToken from "../interfaces/dataStoredInToken";
import User from "./user.entity";
import TokenService from "../token/token.service";
import Token from "../token/token.entity";
import { CreateUserDto, LoginUserDto } from "./dtos/user.dto";
import WrongCredentialsException from "../exceptions/WrongCredentialsException";
import { RefreshTokenDto } from "./dtos/refreshToken.dto";
import WrongRefreshTokenException from "../exceptions/WrongRefreshTokenException";
import WrongDeviceIdException from "../exceptions/WrongProfileIdException";

class UserService {
  private userRepository = dataSource.getRepository(User);
  private tokenRepository = dataSource.getRepository(Token);
  private tokenService = new TokenService();

  public async register(userData: CreateUserDto) {
    const isUserExists = await this.userRepository.findOne({
      where: [{ email: userData.email }],
    });

    if (isUserExists) {
      throw new UserWithThatCredentialsAlreadyExistsException(userData.email);
    }

    const registrationDate = new Date();

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = this.userRepository.create({
      ...userData,
      password: hashedPassword,
      registrationDate,
    });
    await this.userRepository.save(user);

    delete (user as { password?: string }).password;

    const tokenData = await this.tokenService.createToken(user);

    return {
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
      user,
    };
  }

  public async login(loginData: LoginUserDto) {
    const user = await this.userRepository.findOne({
      where: [{ email: loginData.email }],
      select: [
        "id",
        "firstName",
        "lastName",
        "email",
        "gender",
        "registrationDate",
        "password",
      ],
    });

    if (!user) {
      throw new WrongCredentialsException();
    }

    const match = await bcrypt.compare(loginData.password, user.password);

    if (!match) {
      throw new WrongCredentialsException();
    }

    delete (user as { password?: string }).password;

    const tokenData = await this.tokenService.createToken(user);

    return {
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
      user,
    };
  }

  public async updateToken(data: RefreshTokenDto) {
    const refreshTokenSecret = process.env.JWT_REFRESH_TOKEN_SECRET as string;

    const decoded = jwt.verify(
      data.refreshToken,
      refreshTokenSecret
    ) as DataStoredInToken;

    const user = await this.userRepository.findOne({
      where: { id: +decoded.id },
    });

    if (!user) {
      throw new WrongRefreshTokenException();
    }

    const oldToken = await this.tokenService.findToken(user, data.refreshToken);

    if (!oldToken) {
      throw new WrongRefreshTokenException();
    }

    const tokenData = await this.tokenService.createToken(user);

    return {
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
      user,
    };
  }

  public async logout(user: User, deviceId: string) {
    const oldToken = await this.tokenService.findTokenByDeviceId(
      user,
      deviceId
    );

    if (!oldToken) {
      throw new WrongDeviceIdException();
    }

    await this.tokenService.deleteToken(user);
  }
}

export default UserService;
