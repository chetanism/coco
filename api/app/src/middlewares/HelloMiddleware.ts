import { AbstractMiddleware } from '../../libs/plugins/WebPlugin/middlewares/AbstractMiddleware';
import { injectable } from '../boot';

@injectable()
export class HelloMiddleware extends AbstractMiddleware {
  middleware = (req, res, next) => {
    console.log('I\'m test controller hello action middleware');
    next();
  }
}
