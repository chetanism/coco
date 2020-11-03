import { FilteredServiceLocator } from './FilteredServiceLocator';
import { Container, FactoryName, FactoryOptions } from './Container';
import { ContainerBuilder } from './ContainerBuilder';

describe('FilteredServiceLocator', () => {
  const { container, decorators: { injectable } } = new ContainerBuilder().buildContainer();

  @injectable()
  class FServiceLocator extends FilteredServiceLocator {
    filter(name: FactoryName, options: FactoryOptions): boolean {
      return typeof name === 'string' && name.startsWith('f');
    }
  }

  it('works as expected', async () => {
    container.value('f2', { value: 42 });
    container.value('f3', { value: 43 });
    container.value('f4', { value: 44 });
    container.value('s4', { value: 64 });
    container.value('s5', { value: 65 });

    const serviceLocator = await container.resolve(FServiceLocator);

    expect(await serviceLocator.resolve('f2')).toBe(42);
    await expect(serviceLocator.resolve('s4')).rejects.toThrow();

    const allF = await serviceLocator.resolveAll();
    expect(allF.some((x) => x > 50)).toBe(false);
  });
});
