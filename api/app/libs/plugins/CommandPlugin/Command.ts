import * as commandLineArgs from 'command-line-args';

abstract class Command {
  public static Command = '';

  public async runCommand(argv) {
    const optionDefinitions = this.getOptions();
    const options = commandLineArgs(optionDefinitions, { argv });
    await this.run(options);
  }

  protected abstract run(options);

  protected getOptions() {
    return [];
  }
}

export { Command };
