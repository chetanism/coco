import { Command } from '../../libs/plugins/CommandPlugin';
import { EventDispatcher } from '../../libs/plugins/EventPlugin/service/EventDispatcher';
import { GreetingEvent } from '../events/GreetingEvent';
import { inject, injectable } from '../boot';
import { MailService } from '../../libs/plugins/MailerPlugin/service/MailService';
import { SerializerService } from '../../libs/plugins/SerializerPlugin/service/SerializerService';
import { serializable } from '../../libs/plugins/SerializerPlugin/decorators/serializable';
import { expose } from '../../libs/plugins/SerializerPlugin/decorators/expose';

/**
 * Greeting command
 * Run as:
 *  npm run cli app:greeting                => 'Hello, World!'
 *  npm run cli app:greeting -- -n John     => 'Hello, John!'
 *  npm run cli app:greeting -- --name John => 'Hello, John!'
 *  npm run cli app:greeting -- John        => 'Hello, John!'
 */

@injectable()
class GreetingCommand extends Command {
  public static Command = 'app:greeting';

  constructor(
    @inject(EventDispatcher) private readonly eventDispatcher: EventDispatcher,
    @inject(MailService) private readonly mailService: MailService,
    @inject(SerializerService) private readonly serializer: SerializerService,
  ) {
    super();
  }

  protected getOptions(): any[] {
    return [
      { name: 'name', defaultOption: true, alias: 'n', defaultValue: 'World' },
    ];
  }

  protected async run(options) {
    const { name } = options;
    const greeting = `Hello, ${name}!`;
    console.log(greeting);
    await this.eventDispatcher.dispatch(new GreetingEvent());
    await this.mailService.sendMail({
      to: 'to@example.com',
      subject: 'subject',
      text: 'Hello mails!!',
    });

    console.log(await this.serializer.serialize('serializing a scalar value'));
    console.log(await this.serializer.serialize({
      key: ['serializing', 'a', 'simple', 'object'],
    }));

    @serializable()
    class A {
      @expose()
      a = 1;
    }

    @serializable()
    class B {
      @expose()
      a = new A;

      @expose()
      b = 2;

      c = 3;
    }

    console.log(await this.serializer.serialize(new B));
    console.log(await this.serializer.serialize([new B, 42, 'xx', new A]));
    console.log(await this.serializer.serialize({ bb: new B, aa: new A }));
  }
}

export {
  GreetingCommand,
};
