import dataSource from "../config/typeorm.config";
import Photo from "./photo.entity";
import path from "path";
import fs from "fs";

class PhotoService {
  private photoRepository = dataSource.getRepository(Photo);

  public async upload(photo, user) {
    const newPhoto = this.photoRepository.create({
      photoName: photo.filename,
      extension: path.extname(photo.originalname),
      mimeType: photo.mimetype,
      photoSize: photo.size,
      user,
    });
    const photoInfo = await this.photoRepository.save(newPhoto);

    return photoInfo;
  }

  public async photosList(user, listSizeParam, pageParam) {
    const listSize = listSizeParam || 10;
    const page = pageParam ? pageParam - 1 : 0;

    const photoList = await this.photoRepository
      .createQueryBuilder()
      .orderBy("uploadDate", "ASC")
      .where("userId = :userId", { userId: user.id })
      .skip(listSize * page)
      .take(listSize)
      .getMany();

    return photoList;
  }

  public async getPhotoById(user, id) {
    const photo = await this.photoRepository
      .createQueryBuilder()
      .orderBy("uploadDate", "ASC")
      .where("id = :id", { id })
      .andWhere("userId = :userId", { userId: user.id })
      .getOne();

    return photo;
  }

  public async updatePhotoById(user, id, photo) {
    await this.photoRepository
      .createQueryBuilder()
      .update<Photo>(Photo, {
        photoName: photo.filename,
        extension: path.extname(photo.originalname),
        mimeType: photo.mimetype,
        photoSize: photo.size,
      })
      .where("id = :id", { id })
      .andWhere("userId = :userId", { userId: user.id })
      .updateEntity(true)
      .execute();

    return await this.getPhotoById(user, id);
  }

  public async deletePhotoByID(user, id) {
    const photo = await this.photoRepository
      .createQueryBuilder()
      .orderBy("uploadDate", "ASC")
      .where("id = :id", { id })
      .andWhere("userId = :userId", { userId: user.id })
      .getOne();

    const deleteResult = await this.photoRepository
      .createQueryBuilder()
      .delete()
      .where("id = :id", { id })
      .andWhere("userId = :userId", { userId: user.id })
      .execute();

    if (deleteResult.affected !== 0) {
      try {
        let photos = fs.readdirSync(path.join(__dirname, "../uploads"));

        if (photos.includes(photo.photoName)) {
          fs.unlinkSync(path.join(__dirname, "../uploads", photo.photoName));
        }
      } catch (error) {
        console.log({ error });
      }
    }

    return deleteResult;
  }
}

export default PhotoService;
