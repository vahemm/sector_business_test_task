import HttpException from "./HttpException";

class UserWithThatCredentialsAlreadyExistsException extends HttpException {
  constructor(credentials: string) {
    super(400, `User with email "${credentials}" already exists`);
  }
}

export default UserWithThatCredentialsAlreadyExistsException;
