import { AbstractEvent } from '../../libs/plugins/EventPlugin/AbstractEvent';

export class GreetingEvent extends AbstractEvent {
  getType(): string {
    return 'GreetingEvent';
  }
}
