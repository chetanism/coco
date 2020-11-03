import { AbstractEventListener, EventHandler } from '../../libs/plugins/EventPlugin/AbstractEventListener';
import { GreetingEvent } from '../events/GreetingEvent';
import { injectable } from '../boot';

@injectable()
export class GreetingEventListener extends AbstractEventListener {
  getSubscribedEvents(): { [p: string]: EventHandler } {
    return {
      'GreetingEvent': this.onGreeting,
    };
  }

  onGreeting = (event: GreetingEvent) => {
    console.log('Greeting Event: ', GreetingEvent);
  };
}
