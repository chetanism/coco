import {
  ContainerDecoratorsBuilder,
  InjectableDecorator,
  InjectDecorator,
} from './ContainerDecoratorsBuilder';
import { Container } from './Container';

describe('ContainerDecoratorsBuilder', () => {
  const builder = new ContainerDecoratorsBuilder();
  let container: Container, inject: InjectDecorator, injectable: InjectableDecorator;

  beforeEach(() => {
    container = new Container();
    ({ inject, injectable } = builder.buildDecorators(container));
  });


  describe('* service decorator', () => {
    describe('with specific name', () => {
      it('works as expected', async () => {
        @injectable('AA')
        class A {
        }

        const a1 = await container.resolve('AA');
        const a2 = await container.resolve('AA');

        expect(a1).toBeInstanceOf(A);
        expect(a1).toBe(a2);
      });
    });

    describe('with auto name', () => {
      it('works as expected', async () => {
        @injectable()
        class A {
        }

        const a1 = await container.resolve(A);
        const a2 = await container.resolve(A);

        expect(a1).toBeInstanceOf(A);
        expect(a1).toBe(a2);
      });

      it('handles static dependencies', async () => {
        @injectable()
        class X {
        }

        @injectable({ dependsOn: [X] })
        class A {
          constructor(public readonly shouldBeX) {
          }
        }

        const a = await container.resolve(A);
        expect(a.shouldBeX).toBeInstanceOf(X);
      });

      it('handles dependency resolution at runtime', async () => {
        @injectable({ getDependenciesList: () => ['X'] })
        class A {
          constructor(public readonly shouldBeX) {
          }
        }

        const a = await container.resolve(A);
        expect(a.shouldBeX).toBe('X');
      });
    });
  });

  describe('* inject and injectable', () => {
    it('work with specific name', async () => {
      @injectable('A')
      class A {
      }

      @injectable('B')
      class B {
        constructor(@inject('A') public readonly a) {
        }
      }

      const b = await container.resolve('B');
      expect(b.a).toBeInstanceOf(A);
    });

    it('works with auto name', async () => {
      @injectable()
      class A {
      }

      @injectable()
      class B {
        constructor(@inject(A) public readonly a) {
        }
      }

      const b = await container.resolve(B);
      expect(b.a).toBeInstanceOf(A);
    });

    it('throws error if getDependencies returns object with string key', () => {
      @injectable({ getDependencies: () => ({ 'a': 1 }) })
      class A {
      }

      expect(container.resolve(A)).rejects.toThrow();
    });

    it('throws error if a dependency is injected twice', () => {
      @injectable()
      class X {
      }

      @injectable({ getDependencies: () => ({ 0: 1 }) })
      class A {
        constructor(@inject(X) public readonly x) {
        }
      }

      expect(container.resolve(A)).rejects.toThrow();
    });

    it('throws warns if a dependency is missed to be injected', async () => {
      @injectable({ getDependencies: () => ({ 1: 1 }) })
      class A {
        constructor(public readonly x, public readonly y) {
        }
      }

      const mockFn = jest.fn(() => null);
      console.warn = mockFn;


      const a = await container.resolve(A);
      expect(a.x).toBe(undefined);
      expect(a.y).toBe(1);
      expect(mockFn.mock.calls.length).toBe(1);
    });
  });
});
