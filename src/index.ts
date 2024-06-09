import dotenv from "dotenv";
import App from "./app";
import dataSource from "./config/typeorm.config";
import UserController from "./user/user.controller";
import PhotoController from "./photo/photo.controller";
import ProfileController from "./profile/profile.controller";

dotenv.config();

(async () => {
  try {
    dataSource.initialize();
  } catch (error) {
    console.log("Error while connecting to the database", error);
    return error;
  }
  const app = new App([
    new UserController(),
    new ProfileController(),
    new PhotoController()
  ]);
  app.listen();
})();
