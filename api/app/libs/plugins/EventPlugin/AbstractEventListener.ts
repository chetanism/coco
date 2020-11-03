export type EventHandler = Function | Function[];

export abstract class AbstractEventListener {
  abstract getSubscribedEvents(): { [event: string]: EventHandler };
}
