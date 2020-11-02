import { TaggedServiceLocator } from '../container/TaggedServiceLocator';

export class CommandServiceLocator extends TaggedServiceLocator {
  constructor() {
    super('app.command');
  }
}
