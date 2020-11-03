import { container } from './boot';

container.resolve('cli.handler').then(async (commandRunner) => {
  try {
    await commandRunner.run();
    console.log('Command completed');
  } catch (e) {
    console.error('Command failed with exception: ', e);
  }
});

