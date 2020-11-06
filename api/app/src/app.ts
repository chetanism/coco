import { container } from './boot';
import { ApplicationServer } from '../libs/plugins/WebPlugin/service/ApplicationServer';

container.resolve(ApplicationServer).then((applicationServer: ApplicationServer) => {
  try {
    applicationServer.start();
    console.log('Server started');
  } catch (e) {
    console.error('Server failed with exception: ', e);
  }
});

