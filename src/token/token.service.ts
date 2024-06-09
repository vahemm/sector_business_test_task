import * as jwt from "jsonwebtoken";
import dataSource from "../config/typeorm.config";
import DataStoredInToken from "../interfaces/dataStoredInToken";
import TokenData from "../interfaces/tokenData.interface";
import User from "../user/user.entity";
import Token from "./token.entity";

class TokenService {
  private userRepository = dataSource.getRepository(User);
  private tokenRepository = dataSource.getRepository(Token);

  public async createToken(user: User): Promise<TokenData> {
    const expiresIn = 60 * 100;
    const acceesTokenSecret = process.env.JWT_ACCESS_TOKEN_SECRET as string;
    const refreshTokenSecret = process.env.JWT_REFRESH_TOKEN_SECRET as string;
    const dataStoredInToken: DataStoredInToken = {
      id: user.id,
    };

    await this.tokenRepository
      .createQueryBuilder()
      .delete()
      .andWhere("token.userId = :userId", { userId: user.id })
      .execute();

    const accessToken = await jwt.sign(dataStoredInToken, acceesTokenSecret, {
      expiresIn,
    });
    const refreshToken = await jwt.sign(dataStoredInToken, refreshTokenSecret);

    const token = this.tokenRepository.create({
      accessToken,
      refreshToken,
      user,
    });

    await this.tokenRepository.save(token);
    return {
      expiresIn,
      accessToken,
      refreshToken,
    };
  }

  public async findToken(user: User, refreshToken: string) {
    return await this.tokenRepository.findOne({
      where: {
        user,
        refreshToken,
      },
    });
  }

  public async findTokenByDeviceId(user: User, deviceId: string) {
    return await this.tokenRepository.findOne({
      where: {
        user,
      },
    });
  }

  public async deleteToken(user: User) {
    await this.tokenRepository
      .createQueryBuilder()
      .delete()
      .where("token.userId = :userId", { userId: user.id })
      .execute();
  }
}

export default TokenService;
