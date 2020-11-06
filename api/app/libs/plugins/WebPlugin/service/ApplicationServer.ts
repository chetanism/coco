import * as http from 'http';
import { Application } from 'express';

export type ServerOptions = {
  port: number,

}

export class ApplicationServer {
  private server: http.Server;
  constructor(
    private readonly serverOptions: ServerOptions,
    private readonly app: Application,
  ) {
  }

  start() {
    this.app.set('port', this.serverOptions.port);
    this.server = http.createServer(this.app);
    this.server.listen(this.serverOptions.port);
    this.server.on('error', this.onError);
    this.server.on('listening', this.onListening);
  }

  onListening = () =>{
    const addr = this.server.address();
    const bind = typeof addr === 'string' ?
      'pipe ' + addr :
      'port ' + addr.port;
    console.log('Listening on ' + bind);
  }

  onError = (error) => {
    if (error.syscall !== 'listen') {
      throw error;
    }

    const bind = typeof this.serverOptions.port === 'string' ?
      'Pipe ' + this.serverOptions.port :
      'Port ' + this.serverOptions.port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit(1);
        break;
      default:
        throw error;
    }
  };
}
