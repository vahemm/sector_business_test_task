import { IsString } from "class-validator";

export class CreateUserDto {
  @IsString()
  public firstName: string;

  @IsString()
  public lastName: string;

  @IsString()
  public email: string;

  @IsString()
  public password: string;
}

export class LoginUserDto {
  @IsString()
  public email: string;

  @IsString()
  public password: string;
}
