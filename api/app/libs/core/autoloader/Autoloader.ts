import * as fs from 'fs';
import * as path from 'path';

export class Autoloader {
  async load(dir) {
    let promise = Promise.resolve();
    this.getAllFiles(dir)
      .filter((file) => file.indexOf('.') !== 0 && (file.slice(-3) === '.ts' || file.slice(-3) === '.js'))
      .forEach((file) => {
        promise = promise.then(() => import(file)).catch((e) => console.log(e));
      });

    return promise;
  }

  private getAllFiles(dirPath: string, arrayOfFiles?: string[]): string[] {
    const files: string[] = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function(file: string) {
      const filePath = path.join(dirPath, file);
      if (fs.statSync(dirPath + '/' + file).isDirectory()) {
        arrayOfFiles = this.getAllFiles(filePath, arrayOfFiles);
      } else {
        arrayOfFiles.push(filePath);
      }
    });

    return arrayOfFiles;
  }
}
