import { AbstractSerializer } from './serializer/AbstractSerializer';
import { NormalizerService } from './NormalizerService';
import { SerializerServiceLocator } from './serializer/SerializerServiceLocator';

export type SerializerOptions = {
  defaultSerializer: 'json'
}

export type SerializableGroup = string | Record<string, SerializableGroups>;
export type SerializableGroups = SerializableGroup[] | Record<string, SerializableGroup[]>;

export type SerializeOptions = {
  serializer?: string,
  groups?: SerializableGroups
}

export class SerializerService {
  constructor(
    private readonly options: SerializerOptions,
    private readonly normalizerService: NormalizerService,
    private readonly serializerServiceLocator: SerializerServiceLocator,
  ) {
  }

  public async serialize(value: any | any[], {
    groups = [],
    serializer: serializerType = '',
  }: SerializeOptions = {}): Promise<any> {
    const normalized = await this.normalizerService.normalize(value, { groups });
    const serializer: AbstractSerializer = await this.getSerializer(serializerType || this.options.defaultSerializer);
    return serializer.serialize(normalized, {});
  }

  private async getSerializer(type): Promise<AbstractSerializer> {
    return this.serializerServiceLocator.resolveByAlias(`serializer.${type}`);
  }
}
