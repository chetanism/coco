import { AbstractEvent } from './AbstractEvent';
import { EventEmitter } from 'events';
import { EventListenerServiceLocator } from './EventListenerServiceLocator';
import { AbstractEventListener } from './AbstractEventListener';

export class EventDispatcher {
  private dispatcher = new EventEmitter();
  private eventsBound = false;

  constructor(
    private readonly serviceLocator: EventListenerServiceLocator
  ) {
  }

  public async dispatch(event: AbstractEvent, name?: string) {
    if (!this.eventsBound) {
      await this.bindListeners();
      this.eventsBound = true;
    }
    this.dispatcher.emit(name || event.getType(), event);
  }

  public bindEvent(event: string, listener) {
    this.dispatcher.on(event, listener);
    return () => this.dispatcher.off(event, listener);
  }

  bindListener(listener: AbstractEventListener) {
    const subscribedEvents = listener.getSubscribedEvents();
    for (const event of Reflect.ownKeys(subscribedEvents)) {
      const eventStr = <string>event;
      let methods = subscribedEvents[eventStr];

      if (!Array.isArray(methods)) {
        methods = [methods];
      }

      for (const method of methods) {
        this.bindEvent(eventStr, method);
      }
    }
  }

  private async bindListeners() {
    const listeners: AbstractEventListener[] = await this.serviceLocator.resolveAll();
    for(const listener of listeners) {
      this.bindListener(listener);
    }
  }
}
