import { JwtPayload } from '../auth/interfaces';

interface IJwtRequest extends Request {
  user: JwtPayload;
}

export { IJwtRequest };
