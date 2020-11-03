import { ContainerBuilder } from './ContainerBuilder';

describe('ContainerBuilder', () => {
  let container, service, inject, injectable;
  //
  // abstract class IA {
  // }

  // function iaTagger(name) {
  //   if (typeof name === 'function' && name.prototype instanceof IA) {
  //     return ['ia-tag'];
  //   }
  // }
  //
  // function bbTagger(name) {
  //   if (typeof name === 'string' && name.startsWith('service.bb.')) {
  //     return ['bb-tag'];
  //   }
  // }

  const builder = new ContainerBuilder();

  // it('works as expected', async () => {
  //   ({ container, decorators: { inject, service, injectable } } = builder.buildContainer([iaTagger, bbTagger]));
  //
  //   @service()
  //   class A extends IA {
  //   }
  //
  //   @injectable('service.bb.some-bb-service')
  //   class B {
  //     constructor(@inject(A) public readonly a) {
  //     }
  //   }
  //
  //   const b = await container.resolve('service.bb.some-bb-service');
  //   expect(b.a).toBeInstanceOf(A);
  //
  //   const iaTagged: any[] = container.getTaggedFactories('ia-tag');
  //   expect(iaTagged).toHaveLength(1);
  //   expect(iaTagged[0]).toBe(A);
  //
  //   const bbTagged: any[] = container.getTaggedFactories('bb-tag');
  //   expect(bbTagged).toHaveLength(1);
  //   expect(bbTagged[0]).toBe('service.bb.some-bb-service');
  // });

  it('works without taggers', async () => {
    ({ container, decorators: { injectable } } = builder.buildContainer());

    @injectable()
    class A {
    }

    expect(await container.resolve(A)).toBeInstanceOf(A);
  });
});
