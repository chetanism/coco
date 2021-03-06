import { controller } from '../../libs/plugins/WebPlugin/decorators/controller';
import { action } from '../../libs/plugins/WebPlugin/decorators/action';
import { Response } from 'express';
import { AbstractController } from '../../libs/plugins/WebPlugin/service/AbstractController';
import { TestMiddleware } from '../middlewares/TestMiddleware';
import { HelloMiddleware } from '../middlewares/HelloMiddleware';

@controller({
  route: '/test',
  middlewares: [TestMiddleware],
})
export class TestController extends AbstractController {
  @action({
    route: '/hello',
    middlewares: [HelloMiddleware],
  })
  async sayHello(req, res: Response) {
    res.json({
      hello: 'world!',
    });
  }

  @action({ route: '/test' })
  async sayTest(req, res: Response) {
    res.json({ msg: 'test' });
  }

  @action({ route: '/woosh' })
  async woosh(req, res) {
    res.json({ msg: 'woosh' });
  }
}

// @request
// @response
// @param
// @inject
// Response objects to handle returned response

