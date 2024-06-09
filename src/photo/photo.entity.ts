import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import User from "../user/user.entity";

@Entity()
class Photo {
  @PrimaryGeneratedColumn()
  public id: string;

  @Column()
  public photoName: string;

  @Column()
  public extension: string;

  @Column()
  public mimeType: string;

  @Column()
  public photoSize: string;

  @CreateDateColumn()
  public uploadDate: Date;

  @ManyToOne(() => User, (user: User) => user.photos)
  public user: User;
}

export default Photo;
