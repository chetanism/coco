import { CommandServiceLocator } from './CommandServiceLocator';
import * as commandLineArgs from 'command-line-args';
import { Command } from '../model/Command';

export class CommandRunner {
  constructor(private readonly commandServiceLocator: CommandServiceLocator) {
  }

  async run() {
    const mainDefinitions = [
      { name: 'command', defaultOption: true },
    ];

    const mainOptions = commandLineArgs(mainDefinitions, { stopAtFirstUnknown: true });
    const argv = mainOptions._unknown || [];
    const { command } = mainOptions;
    const cmd: Command = await this.commandServiceLocator.findCommand(command);
    console.log(`\nRunning command ${command}..\n`);
    await cmd.runCommand(argv);
  }
}
