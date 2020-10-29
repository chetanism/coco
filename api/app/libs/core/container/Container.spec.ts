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
      expect(container['factories'].get('someValue')).toBeInstanceOf(Array);
      expect(container['factories'].get('someValue')).toHaveLength(1);
      expect(container['factories'].get('someValue')[0].factoryFunction()).toBe(42);
    });

    describe('when multiple values registered with same type', () => {
      beforeEach(() => {
        container.value('someValue', { value: 42 });
        container.value('someValue', { value: 43 });
      });

      it('adds value factories under same type', () => {
        expect(container['factories'].get('someValue')).toHaveLength(2);
      });
    });
  });

  describe('#factory', () => {
    it('registers a factory', () => {
      expect(container['factories'].has('Type1')).toBe(false);

      container.factory('Type1', { factoryFunction: () => 42 });

      expect(container['factories'].has('Type1')).toBe(true);
      expect(container['factories'].get('Type1')).toBeInstanceOf(Array);
      expect(container['factories'].get('Type1')).toHaveLength(1);
      expect(container['factories'].get('Type1')[0].factoryFunction()).toBe(42);
    });

    describe('when multiple factories registered with same type', () => {
      beforeEach(() => {
        container.factory('Type1', { factoryFunction: () => 42 });
        container.factory('Type1', { factoryFunction: () => 43 });
      });

      it('adds factories under same type', () => {
        expect(container['factories'].get('Type1')).toHaveLength(2);
      });
    });
  });

  describe('#resolve', () => {
    describe('when single factory is registered for a type', () => {
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

    describe('when multiple factories are registered for a type', () => {
      describe('when tags are not used', () => {
        beforeEach(() => {
          container.factory('thing1', { factoryFunction: () => 42 });
          container.factory('thing1', { factoryFunction: () => 43 });
        });

        it('throws an error while trying to resolve the value', () => {
          expect(container.resolve('thing1')).rejects.toThrow();
        });
      });

      describe('when tags are used (or not)', () => {
        beforeEach(() => {
          container.factory('thing1', { factoryFunction: () => 42 });
          container.factory('thing1', { factoryFunction: () => 43, tags: { a: 1 } });
          container.factory('thing1', { factoryFunction: () => 44, tags: { a: 1 } });
          container.factory('thing1', { factoryFunction: () => 45, tags: { a: 1, b: 2 } });
          container.factory('thing1', { factoryFunction: () => 46, tags: { a: 2 } });
          container.factory('thing1', { factoryFunction: () => 47, tags: { a: 2, b: 3 } });
        });

        it('resolves value for factory without tags if no tags are passed', async () => {
          const f2 = await container.resolve('thing1');
          expect(f2).toBe(42);
        });

        it('resolves value for unique tags', async () => {
          const f5 = await container.resolve('thing1', { b: 2, a: 1 });
          expect(f5).toBe(45);

          const f6 = await container.resolve('thing1', { a: 2 });
          expect(f6).toBe(46);
        });

        it('throws error for non-unique tags', () => {
          expect(container.resolve('thing1', { a: 1 })).rejects.toThrow();
        });

        it('throws an error if tags don\'t match any factory', () => {
          expect(container.resolve('thing1', { what: 'the heck' })).rejects.toThrow();
        });
      });
    });
  });

  describe('#checkSanity', () => {
    describe('when things are sane', () => {
      beforeEach(() => {
        container.factory('thing1', { factoryFunction: () => 42 });
        container.factory('thing2', { factoryFunction: () => 43 });
        container.factory('thing2', { factoryFunction: () => 44, tags: { a: 1 } });
        container.factory('thing2', { factoryFunction: () => 45, tags: { b: 1 } });
        container.factory('thing2', { factoryFunction: () => 46, tags: { a: 1, b: 1 } });
      });

      it('does not throws an error', () => {
        expect(container.checkSanity).not.toThrow();
      });
    });

    describe('when things are insane', () => {
      beforeEach(() => {
        container.factory('thing1', { factoryFunction: () => 42 });
        container.factory('thing2', { factoryFunction: () => 43 });
        container.factory('thing2', { factoryFunction: () => 44, tags: { a: 1 } });
      });

      it('throws an error for repetition without tags', () => {
        container.factory('thing2', { factoryFunction: () => 45 });
        expect(container.checkSanity).toThrow();
      });

      it('throws an error for repetition with tags', () => {
        container.factory('thing2', { factoryFunction: () => 46, tags: { a: 1 } });
        expect(container.checkSanity).toThrow();
      });
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
