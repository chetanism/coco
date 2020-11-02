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

      @injectable()
      class Gun implements Weapon {
      }

      @provider(() => [])
      class Sword implements Weapon {
      }

      @injectable()
      class Punch implements Weapon {
      }

      @service( { dependsOn: [Sword] })
      class King {
        constructor(public readonly weapon: Weapon) {
        }
      }

      @service()
      class President {
        constructor(public readonly weapon: Weapon) {
        }
      }

      @injectable()
      class Sniper {
        constructor(@inject(Gun) public readonly weapon: Weapon) {
        }
      }

      @injectable()
      class CommonMan {
        constructor(@inject(Punch) public readonly weapon: Weapon) {
        }
      }

      const king = await container.resolve(King);
      const president = await container.resolve(President);
      const sniper = await container.resolve(Sniper);
      const commonMan = await container.resolve(CommonMan);

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

      @injectable()
      class Car1 {
        constructor(@inject(Engine) public readonly engine: Engine) {
        }
      }

      @injectable('Car2')
      class Car2 {
        constructor(@inject(Engine) public readonly engine: Engine) {
        }
      }

      const car1 = await container.resolve(Car1);
      const car2 = await container.resolve('Car2');
      expect(car1.engine).toBe(car2.engine);
      expect(car1.engine).toBe(await container.resolve(Engine));
    });

    it('does really cool stuff', async () => {
      const { container, provider, inject, injectable } = containerFactory.build();

      @provider('mailgunMailer', () => ['mailgunTransport'])
      @provider('sesMailer', () => ['sesTransport'] )
      @provider('jsonMailer', () => ['jsonTransport'])
      class Mailer {
        constructor(public readonly transport) {
        }
      }

      @injectable()
      class SomeRegularService {
        constructor(@inject('mailgunMailer') public readonly mailer: Mailer) {
        }
      }

      @provider('sisDebug', async (resolve) => [await resolve('jsonMailer')])
      @injectable()
      class SomeImportantService {
        constructor(@inject('sesMailer') public readonly mailer: Mailer) {
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


      const sisDebug = await container.resolve('sisDebug');
      expect(sisDebug).toBeInstanceOf(SomeImportantService);
      expect(sisDebug.mailer).toBeInstanceOf(Mailer);
      expect(sisDebug.mailer.transport).toBe('jsonTransport');

    });

    it('throws error on using provider without getDependencies', () => {
      expect(() => {
        const { provider } = containerFactory.build();

        @provider(undefined)
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

        @injectable(A)
        class A extends B {
        }

        const b = await container.resolve(B);
        expect(b).toBeInstanceOf(B);

        const a = await container.resolve(A);
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
