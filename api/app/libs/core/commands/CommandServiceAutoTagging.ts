import { AutoServiceTagging, ClassType, FactoryName } from '../container';
import { Command } from './Command';

export class CommandServiceAutoTagging extends AutoServiceTagging {
  addTags(Klass: ClassType, type: FactoryName): string[] {
    if (Klass.prototype instanceof Command) {
      return ['app.command'];
    }
  }
}
