import { AbstractEvent } from '../../libs/plugins/EventPlugin/model/AbstractEvent';

export class GreetingEvent extends AbstractEvent {
  getType(): string {
    return 'GreetingEvent';
  }
}
