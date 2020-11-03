import { TaggedServiceLocator } from './TaggedServiceLocator';
import { ServiceLocator } from './ServiceLocator';
import { ContainerBuilder } from './ContainerBuilder';

describe('TaggedServiceLocator', () => {
  it('works as expected', async () => {
    const { container, decorators: {injectable, inject }} = new ContainerBuilder().buildContainer();

    @injectable({ tags: ['test'] })
    class A {
    }

    @injectable({ tags: ['test2'] })
    class B {
    }

    @injectable()
    class C {
    }

    @injectable({ tags: ['test'] })
    class D {
    }

    @injectable()
    class TestTaggedServiceLocator extends TaggedServiceLocator {
      constructor() {
        super('test');
      }
    }

    const tts: ServiceLocator = await container.resolve(TestTaggedServiceLocator);

    const a = await tts.resolve(A);
    expect(a).toBe(await container.resolve(A));

    await expect(tts.resolve(B)).rejects.toThrow();
    await expect(tts.resolve(C)).rejects.toThrow();

    const all = await tts.resolveAll();
    expect(all).toBeInstanceOf(Array);
    expect(all).toHaveLength(2);
    expect(all.includes(await container.resolve(A))).toBeTruthy();
    expect(all.includes(await container.resolve(D))).toBeTruthy();
  });
});
