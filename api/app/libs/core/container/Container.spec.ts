import { Container, ResolveFunction } from './Container';

let container: Container;

describe('Container', () => {
  beforeEach(() => {
    container = new Container();
  });

  describe('#value', () => {
    it('registers a value factory', () => {
      expect(container['factories'].has('someValue')).toBe(false);

      container.value('someValue', { value: 42 });

      expect(container['factories'].has('someValue')).toBe(true);
      expect(container['factories'].get('someValue').factoryFunction()).toBe(42);
    });

    it('doesn\'t add multiple values with same name', () => {
      expect(() => {
        container.value('someValue', { value: 42 });
        container.value('someValue', { value: 43 });
      }).toThrow();
    });
  });

  describe('#factory', () => {
    it('registers a factory', () => {
      expect(container['factories'].has('Type1')).toBe(false);

      container.factory('Type1', { factoryFunction: () => 42 });

      expect(container['factories'].has('Type1')).toBe(true);
      expect(container['factories'].get('Type1').factoryFunction()).toBe(42);
    });

    it('throws an error when multiple factories are registered with same name', () => {
      expect(() => {
        container.factory('Type1', { factoryFunction: () => 42 });
        container.factory('Type1', { factoryFunction: () => 43 });
      }).toThrow();
    });
  });

  describe('#resolve', () => {
    beforeEach(() => {
      container.factory('factoryType1', { factoryFunction: () => 42 });
      container.factory('thing2', { factoryFunction: () => new Object() });
    });

    it('invokes factory just once', async () => {
      const value1 = await container.resolve('thing2');
      const value2 = await container.resolve('thing2');
      expect(value1).toBe(value2);
    });

    it('resolves value with just the type', async () => {
      const value = await container.resolve('factoryType1');
      expect(value).toBe(42);
    });

    it('throws an error for unregistered type factories', () => {
      expect(container.resolve('some-unregistered-type')).rejects.toThrow();
    });
  });

  describe('#getTaggedFactories', () => {
    it('returns tagged factories correctly', () => {
      container.factory('f1', { factoryFunction: () => 41, tags: ['t1', 't2'] });
      container.factory('f2', { factoryFunction: () => 42, tags: ['t1', 't3'] });
      container.factory('f3', { factoryFunction: () => 43, tags: ['t2', 't3'] });

      const f12 = container.getTaggedFactories('t2');
      expect(f12).toBeInstanceOf(Array);
      expect(f12).toHaveLength(2);
      expect(f12[0]).toBe('f1');
      expect(f12[1]).toBe('f3');

      const nada = container.getTaggedFactories('nada');
      expect(nada).toBeInstanceOf(Array);
      expect(nada).toHaveLength(0)
    });
  });

  describe('* decoratorFunction option', () => {
    it('handles circular dependency', async () => {
      class Father {
        public son: Son;
      }

      class Son {
        public father: Father;
      }

      container.factory('father', {
        factoryFunction: () => new Father,
        decoratorFunction: async (father: Father, resolve: ResolveFunction) => {
          father.son = await resolve('son');
        },
      });

      container.factory('son', {
        factoryFunction: () => new Son,
        decoratorFunction: async (son: Son, resolve: ResolveFunction) => {
          son.father = await resolve('father');
        },
      });

      const son: Son = await container.resolve('son');
      const father: Father = await container.resolve('father');

      expect(son).toBeInstanceOf(Son);
      expect(father).toBeInstanceOf(Father);
      expect(son).toBe(father.son);
      expect(father).toBe(son.father);
    });
  });

  describe('* async factories', () => {
    it('can resolve async values', async () => {
      container.factory('test1', {
        factoryFunction: () => {
          return new Promise((resolve, reject) => {
            setTimeout(() => resolve(42), 100);
          });
        },
      });

      container.factory('test2', {
        factoryFunction: async (resolve) => {
          return (await resolve('test1')) * 2;
        },
      });

      const test2 = await container.resolve('test2');
      expect(test2).toBe(42 * 2);
    });
  });
});
