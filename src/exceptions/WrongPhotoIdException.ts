import HttpException from "./HttpException";

class WrongPhotoIdException extends HttpException {
  constructor() {
    super(400, "Wrong photo id");
  }
}

export default WrongPhotoIdException;