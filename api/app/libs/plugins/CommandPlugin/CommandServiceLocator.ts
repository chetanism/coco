import { FactoryName, FactoryOptions, FilteredServiceLocator, Type } from '../../core/container';
import { Command } from './Command';

interface CommandType extends Type<Command> {
  Command: string
}

export class CommandServiceLocator extends FilteredServiceLocator {
  filter(name: FactoryName, options: FactoryOptions): boolean {
    return typeof name === 'function' && name.prototype instanceof Command;
  }


  async findCommand(commandName: string) {
    const factory = this.getSupportedServices().find(
      (factoryName: CommandType) => typeof factoryName === 'function' && factoryName.Command === commandName,
    );
    return this.resolve(factory);
  }
}
