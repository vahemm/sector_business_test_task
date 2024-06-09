import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import Token from "../token/token.entity";
import Photo from "../photo/photo.entity";
import { Gender } from "./gender.enum";

@Entity()
class User {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public firstName: string;

  @Column()
  public lastName: string;

  @Column({ unique: true, nullable: true })
  public email: string;

  
  @Column({ nullable: true, type: "enum", enum: Gender })
  public gender: Gender;

  @Column({ type: "timestamp" })
  public registrationDate: Date;

  @Column({ select: false })
  public password: string;

  @OneToMany(() => Token, (token: Token) => token.user)
  public tokens: Token[];

  @OneToMany(() => Photo, (photo: Photo) => photo.user)
  public photos: Photo[];
}

export default User;
