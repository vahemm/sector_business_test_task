import { Request } from "express";
import User from "../user/user.entity";
import Photo from "../photo/photo.entity";


export interface RequestWithUserAndPhoto extends Request {
  user: User;
  photo: Photo;
}

export interface RequestWithUserAndOldPhoto extends Request {
  user: User;
  oldPhoto: Photo;
}

