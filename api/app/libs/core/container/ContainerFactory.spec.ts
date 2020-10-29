import { ContainerFactory } from './ContainerFactory';

let containerFactory: ContainerFactory;


describe('ContainerFactory', () => {
  beforeEach(() => {
    containerFactory = new ContainerFactory();
  });

  describe('#build', () => {
    it('creates container and service, provide decorators that work as expected', async () => {
      const { container, service, provider } = containerFactory.build();
      const { resolve } = container;

      @service()
      class SteeringWheel {
      }

      @provider('Engine', () => ['engine1'])
      class Engine {
        constructor(public readonly id: string) {
        }
      }

      @service('Car', { dependsOn: ['Engine', SteeringWheel] })
      class Car {
        constructor(public readonly engine: Engine, public readonly steeringWheel) {
        }
      }

      const car: Car = await resolve('Car');

      expect(car).toBeInstanceOf(Car);
      expect(car.engine).toBeInstanceOf(Engine);
      expect(car.engine.id).toBe('engine1');
      expect(car.steeringWheel).toBeInstanceOf(SteeringWheel);
    });

    it('does fancy stuff', async () => {
      const { container, provider, service, inject, injectable } = containerFactory.build();

      interface Weapon {
      }

      const WeaponType = Symbol('Weapon');

      @injectable(WeaponType, { tags: { era: 'modern' } })
      class Gun implements Weapon {
      }

      @provider(WeaponType, () => [], { tags: { era: 'historic' } })
      class Sword implements Weapon {
      }

      @injectable(WeaponType)
      class Punch implements Weapon {
      }

      @service('King', { dependsOn: [{ type: WeaponType, tags: { era: 'historic' } }] })
      class King {
        constructor(public readonly weapon: Weapon) {
        }
      }

      @service('King', { tags: { era: 'modern' } })
      class President {
        constructor(public readonly weapon: Weapon) {
        }
      }

      @injectable('Sniper')
      class Sniper {
        constructor(@inject(WeaponType, { era: 'modern' }) public readonly weapon: Weapon) {
        }
      }

      @injectable('CommonMan')
      class CommonMan {
        constructor(@inject(WeaponType) public readonly weapon: Weapon) {
        }
      }

      const king = await container.resolve('King');
      const president = await container.resolve('King', { era: 'modern' });
      const sniper = await container.resolve('Sniper');
      const commonMan = await container.resolve('CommonMan');

      expect(king.weapon).toBeInstanceOf(Sword);
      expect(sniper.weapon).toBeInstanceOf(Gun);
      expect(commonMan.weapon).toBeInstanceOf(Punch);
      expect(president.weapon).toBe(undefined);
    });

    it('does cool stuff', async () => {
      const { container, inject, injectable } = containerFactory.build();

      @injectable()
      class Engine {
      }

      @injectable({ tags: { wheels: 4 } })
      class Car1 {
        constructor(@inject(Engine) public readonly engine: Engine) {
        }
      }

      @injectable('Car2')
      class Car2 {
        constructor(@inject(Engine) public readonly engine: Engine) {
        }
      }

      const car1 = await container.resolve(Car1, { wheels: 4 });
      const car2 = await container.resolve('Car2');
      expect(car1.engine).toBe(car2.engine);
      expect(car1.engine).toBe(await container.resolve(Engine));
    });

    it('does really cool stuff', async () => {
      const { container, provider, inject, injectable } = containerFactory.build();

      @provider(() => ['mailgunTransport'])
      @provider(() => ['sesTransport'], { tags: { type: 'ses' } })
      @provider(() => ['jsonTransport'], { tags: { type: 'debug' } })
      class Mailer {
        constructor(public readonly transport) {
        }
      }

      @injectable()
      class SomeRegularService {
        constructor(@inject(Mailer) public readonly mailer: Mailer) {
        }
      }

      @injectable()
      @provider(async (resolve) => [await resolve(Mailer, { type: 'debug' })], { tags: { type: 'debug' } })
      class SomeImportantService {
        constructor(@inject(Mailer, { type: 'ses' }) public readonly mailer: Mailer) {
        }
      }

      const srs = await container.resolve(SomeRegularService);
      expect(srs).toBeInstanceOf(SomeRegularService);
      expect(srs.mailer).toBeInstanceOf(Mailer);
      expect(srs.mailer.transport).toBe('mailgunTransport');

      const sis = await container.resolve(SomeImportantService);
      expect(sis).toBeInstanceOf(SomeImportantService);
      expect(sis.mailer).toBeInstanceOf(Mailer);
      expect(sis.mailer.transport).toBe('sesTransport');


      const sisDebug = await container.resolve(SomeImportantService, { type: 'debug' });
      expect(sisDebug).toBeInstanceOf(SomeImportantService);
      expect(sisDebug.mailer).toBeInstanceOf(Mailer);
      expect(sisDebug.mailer.transport).toBe('jsonTransport');

    });

    it('throws error on using provider without getDependencies', () => {
      expect(() => {
        const { provider } = containerFactory.build();

        @provider()
        class A {
        }

      }).toThrow();
    });

    describe('* injectable', () => {
      it('injects items in correct order', async () => {
        const { container, inject, injectable } = containerFactory.build();

        @injectable()
        class A {
        }

        @injectable()
        class B {
        }

        @injectable()
        class C {
          constructor(
            @inject(A) public readonly a,
            @inject(B) public readonly b,
          ) {
          }
        }

        const c: C = await container.resolve(C);
        expect(c.a).toBeInstanceOf(A);
        expect(c.b).toBeInstanceOf(B);
      });

      it('works fine if type is specifically specified', async () => {
        const { container, injectable } = containerFactory.build();

        @injectable()
        class B {
        }

        @injectable(B, { tags: { type: 'a' } })
        class A extends B {
        }

        const b = await container.resolve(B);
        expect(b).toBeInstanceOf(B);

        const a = await container.resolve(B, { type: 'a' });
        expect(a).toBeInstanceOf(A);
      });
    });

    describe('* provider', () => {
      it('throws an error if getDependencies doesn\'t return an array', () => {
        const { container, provider } = containerFactory.build();

        function foo(): any {
          return 'foo';
        }

        @provider(foo)
        class A {
        }

        @provider(A)
        class B {
        }

        expect(container.resolve(A)).rejects.toThrow();
        expect(container.resolve(B)).rejects.toThrow();
      });
    });
  });
});
