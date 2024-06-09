import HttpException from "./HttpException";

class WrongProfileIdException extends HttpException {
  constructor() {
    super(401, "Wrong profile id");
  }
}

export default WrongProfileIdException;