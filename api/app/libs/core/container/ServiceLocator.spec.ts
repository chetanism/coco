import { ServiceLocator } from './ServiceLocator';
import { ContainerFactory } from './ContainerFactory';
import { FactoryName } from './Container';

describe('ServiceLocator', () => {
  it('works as expected', async () => {
    const { container, injectable, inject } = (new ContainerFactory()).build();

    @injectable()
    class A {
    }

    @injectable()
    class B {
    }

    @injectable()
    class C {
    }

    @injectable()
    class ABServiceLocator extends ServiceLocator {
      getSupportedServices(): FactoryName[] {
        return [A, B];
      }
    }

    @injectable()
    class Test {
      constructor(
        @inject(ABServiceLocator) public readonly sl: ABServiceLocator
      ) {
      }
    }

    const test: Test = await container.resolve(Test);
    const a = await test.sl.resolve(A);
    expect(a).toBe(await container.resolve(A));

    await expect(test.sl.resolve(C)).rejects.toThrow();

    const [a1, b1] = await test.sl.resolveAll();
    expect(a1).toBe(await container.resolve(A))
    expect(b1).toBe(await container.resolve(B))

    expect(() => {
      test.sl.container = container;
    }).toThrow();
  });
});
