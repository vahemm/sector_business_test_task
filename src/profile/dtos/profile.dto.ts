import { IsDate, IsEnum, IsOptional, IsString } from "class-validator";
import { Gender } from "../../user/gender.enum";

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  public firstName?: string;

  @IsOptional()
  @IsString()
  public lastName?: string;

  @IsOptional()
  @IsString()
  public email?: string;

  @IsOptional()
  @IsEnum(Gender)
  @IsString()
  public sex?: Gender;

  @IsOptional()
  @IsDate()
  public registrationDate?: Date;

  @IsOptional()
  @IsString()
  public password?: string;
}
