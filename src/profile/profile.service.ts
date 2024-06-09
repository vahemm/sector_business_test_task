import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import dataSource from "../config/typeorm.config";

import UserWithThatCredentialsAlreadyExistsException from "../exceptions/UserWithThatCredentialsAlreadyExistsException";
import DataStoredInToken from "../interfaces/dataStoredInToken";
import TokenService from "../token/token.service";
import Token from "../token/token.entity";
import { isEmail, isPhoneNumber } from "class-validator";
import WrongCredentialsException from "../exceptions/WrongCredentialsException";
import WrongRefreshTokenException from "../exceptions/WrongRefreshTokenException";
import WrongDeviceIdException from "../exceptions/WrongProfileIdException";
import User from "../user/user.entity";
import { LoginUserDto } from "../user/dtos/user.dto";
import WrongProfileIdException from "../exceptions/WrongProfileIdException";
import { UpdateProfileDto } from "./dtos/profile.dto";

class ProfileService {
  private userRepository = dataSource.getRepository(User);
  private tokenRepository = dataSource.getRepository(Token);
  private tokenService = new TokenService();

  public async getProfileById(id: number) {
    const user = await this.userRepository.findOne({
      where: [{ id }],
    });

    if (!user) {
      throw new WrongProfileIdException();
    }

    return user;
  }

  public async updateProfileById(id: number, body: UpdateProfileDto) {
    try {
      await this.userRepository
        .createQueryBuilder()
        .update<User>(User, {
          ...body,
        })
        .where("id = :id", { id })
        .updateEntity(true)
        .execute();
    } catch (error) {
      console.log({ error });
    }

    return await this.getProfileById(id);
  }

  public async profiles(pageParam, authorization) {
    let user: User;
    if (authorization) {
      try {
        const secret = process.env.JWT_ACCESS_TOKEN_SECRET as string;

        const bearerToken = authorization.replace("Bearer ", "");

        const verificationResponse = jwt.verify(
          bearerToken,
          secret
        ) as DataStoredInToken;

        const id = verificationResponse.id;

        user = await this.userRepository.findOne({ where: { id } });
        const token = await this.tokenRepository.findOne({
          where: { accessToken: bearerToken },
        });

        if (user && token) {
          user = user;
        }
      } catch (error) {
        console.log({ error });
      }
    }
    const listSize = 10;
    const page = pageParam ? pageParam - 1 : 0;

    let profiles: User[];

    if (user) {
      profiles = await this.userRepository
        .createQueryBuilder("user")
        .leftJoinAndSelect("user.photos", "photos")
        .orderBy("user.registrationDate", "ASC")
        .where("user.id != :id", { id: user.id })
        .skip(listSize * page)
        .take(listSize)
        .getMany();
    } else {
      profiles = await this.userRepository
        .createQueryBuilder("user")
        .leftJoinAndSelect("user.photos", "photos")
        .orderBy("user.registrationDate", "ASC")
        .skip(listSize * page)
        .take(listSize)
        .getMany();
    }

    return profiles;
  }
}

export default ProfileService;
