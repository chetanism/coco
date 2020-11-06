import { controller } from '../../libs/plugins/WebPlugin/decorators/controller';
import { action } from '../../libs/plugins/WebPlugin/decorators/action';
import { Response } from 'express';
import { AbstractController } from '../../libs/plugins/WebPlugin/service/AbstractController';

@controller({ route: '/test' })
export class TestController extends AbstractController {

  @action({ route: '/hello', methods: ['get'] })
  async sayHello(req, res: Response) {
    res.json({
      hello: 'world!',
    });
  }
}
