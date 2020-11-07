import { AbstractApplicationMiddleware } from '../../libs/plugins/WebPlugin/middlewares/AbstractApplicationMiddleware';
import { injectable } from '../boot';

@injectable()
export class HelloToAll extends AbstractApplicationMiddleware {
  middleware = (req, res, next) => {
    console.log('Hi, I am app level middleware..');
    next();
  }
}
