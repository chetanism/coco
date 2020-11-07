import { controller } from '../../libs/plugins/WebPlugin/decorators/controller';
import { action } from '../../libs/plugins/WebPlugin/decorators/action';
import { Response } from 'express';
import { AbstractController } from '../../libs/plugins/WebPlugin/service/AbstractController';
import { TestController } from './TestController';

@controller({
  route: '/child',
  parent: TestController
})
export class TestChildController extends AbstractController {
  @action({
    route: '/hello',
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


}

// @request
// @response
// @param
// @inject
// Response objects to handle returned response

