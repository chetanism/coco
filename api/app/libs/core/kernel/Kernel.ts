import { ContainerFactory } from '../container/ContainerFactory';
import { Container } from '../container/Container';

export type KernelOptions = {
  debug: boolean,
}

export class Kernel {
  constructor(
    private readonly options: KernelOptions,
  ) {

  }
}

// bundles can->
// add commands, -> add command classes to container
// have config, ->
// have events listener, ->
// register services, ->
// get services injected, ->
// trigger events ->

