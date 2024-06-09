import fs from "fs";
import multer from "multer";
import path from "path";
import {
  RequestWithUserAndOldPhoto,
} from "../interfaces/requestWithUserAndPhoto.interface";

const storage = multer.diskStorage({
  destination: (req, photo, cb) => {
    
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, photo, cb) => {
    cb(null, Date.now() + "-" + photo.originalname);
  },
});

export const upload = multer({
  storage,
  fileFilter: function (req, photo, cb) {
   
    var ext = path.extname(photo.originalname);
    if (ext !== ".png" && ext !== ".jpg") {
      return cb(
        new Error("Only images with extensions .png and .jpg are allowed")
      );
    }
    cb(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

const photoUpdateStorage = multer.diskStorage({
  destination: (req: RequestWithUserAndOldPhoto, photo, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req: RequestWithUserAndOldPhoto, photo, cb) => {
    cb(null, Date.now() + "-" + photo.originalname);
  },
});

export const photoUpdateMulter = multer({
  storage: photoUpdateStorage,
  fileFilter: (req: RequestWithUserAndOldPhoto, photo, cb) => {
    var ext = path.extname(photo.originalname);
    if (ext !== ".png" && ext !== ".jpg") {
      return cb(
        new Error("Only images with extensions .png and .jpg are allowed")
      );
    }
    let photos = fs.readdirSync(path.join(__dirname, "../uploads"));
    if (photos.includes(req.oldPhoto.photoName)) {
      fs.unlinkSync(path.join(__dirname, "../uploads", req.oldPhoto.photoName));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});
