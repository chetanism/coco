import { AbstractMiddleware } from '../../libs/plugins/WebPlugin/middlewares/AbstractMiddleware';
import { injectable } from '../boot';

@injectable()
export class TestMiddleware extends AbstractMiddleware {
  middleware = (req, res, next) => {
    console.log('I\'m test controller middleware');
    next();
  }
}
