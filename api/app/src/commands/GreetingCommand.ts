import { service } from '../boot';
import { Command } from '../../libs/plugins/CommandPlugin';
import { EventDispatcher } from '../../libs/plugins/EventPlugin/EventDispatcher';
import { GreetingEvent } from '../events/GreetingEvent';
import { inject, injectable } from '../boot';
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
    @inject(EventDispatcher) private readonly eventDispatcher: EventDispatcher
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
  }
}

export {
  GreetingCommand,
};
