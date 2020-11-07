import 'reflect-metadata';
import * as express from 'express';
import { Application, Router } from 'express';
import { ApplicationMiddlewareServiceLocator } from './ApplicationMiddlewareServiceLocator';
import { AbstractApplicationMiddleware } from '../middlewares/AbstractApplicationMiddleware';
import { ControllerLocator } from './ControllerLocator';
import { ControllerKey, ControllerOptions } from '../decorators/controller';
import { AbstractController } from './AbstractController';
import { ActionKey } from '../decorators/action';
import { MiddlewareServiceLocator } from './MiddlewareServiceLocator';
import { AbstractMiddleware } from '../middlewares/AbstractMiddleware';

export type ApplicationOptions = {
  staticPath?: string,
}

type RouterDefinition = {
  route: string,
  router: Router,
  parent: AbstractController,
  self: AbstractController
}

export class ApplicationBuilder {
  constructor(
    private readonly options: ApplicationOptions = {},
    private readonly applicationMiddlewaresLocator: ApplicationMiddlewareServiceLocator,
    private readonly middlewaresLocator: MiddlewareServiceLocator,
    private readonly controllerLocator: ControllerLocator,
  ) {
  }

  async build() {
    const app: Application = express();
    const middlewares: AbstractApplicationMiddleware[] = await this.applicationMiddlewaresLocator.resolveAll();

    for (const middleware of middlewares) {
      const mw = middleware.middleware || middleware.get();
      if (mw) {
        app.use(mw);
      }
    }

    if (this.options.staticPath) {
      app.use(express.static(this.options.staticPath));
    }

    await this.buildControllers(app);

    return app;
  }

  private async buildControllers(app: Application) {
    const controllers: AbstractController[] = await this.controllerLocator.resolveAll();
    const routerDefinitions: Map<AbstractController, RouterDefinition> = new Map;

    // build controller routers
    for (const controller of controllers) {
      routerDefinitions.set(
        controller,
        await this.buildControllerRouter(controller),
      );
    }

    // console.log(routerDefinitions);

    // bind to parent router
    for (const { router, route, parent, self } of routerDefinitions.values()) {
      if (parent) {
        const { router: parentRouter } = routerDefinitions.get(parent);
        console.log('attaching ', self, ' to ', parent, ' at ', route)
        parentRouter.use(route, router);
      }
    }

    // pick root level routers
    const rootRouters = Array.from(routerDefinitions.values()).filter(({ parent }) => !parent);
    // console.log(rootRouters);

    for(const rootRouter of rootRouters) {
      app.use(rootRouter.route, rootRouter.router);
    }
  }

  private async buildControllerRouter(controller: AbstractController): Promise<RouterDefinition> {
    const router = express.Router();
    const controllerOptions = Reflect.getOwnMetadata(ControllerKey, controller.constructor);
    const { route, middlewares, parent }: ControllerOptions = controllerOptions;

    const resolvedMiddlewares: AbstractMiddleware[] = await Promise.all(
      (middlewares || []).map((mw) => this.middlewaresLocator.resolve(mw)),
    );

    for (const middleware of resolvedMiddlewares) {
      const mw = middleware.middleware;
      if (mw) {
        router.use(mw);
      }
    }

    await this.buildControllerActions(controller, router);

    return {
      router,
      route,
      parent: parent ? await this.controllerLocator.resolve(parent) : null,
      self: controller,
    };
  }

  private async buildControllerActions(controller: AbstractController, router) {
    const actions = Reflect.getOwnMetadata(ActionKey, controller.constructor.prototype);

    for (const action of actions) {
      // const actionOptions = Reflect.getOwnMetadata(ActionKey, controller);
      const { propertyKey, options: { route, methods, name, middlewares } } = action;

      const resolvedMiddlewares: AbstractMiddleware[] = await Promise.all(
        (middlewares || []).map((amw) => this.middlewaresLocator.resolve(amw)),
      );

      const middlewaresToApply = resolvedMiddlewares
        .map((mw) => mw.middleware)
        .filter((mw) => mw);

      const methodsToApply = methods || ['use'];

      for (const method of methodsToApply) {
        router[method](route, middlewaresToApply, controller[propertyKey].bind(controller));
      }
    }
  }


  //
  // private async buildControllers(app: Application) {
  //   const controllers: AbstractController[] = await this.controllerLocator.resolveAll();
  //   const router = express.Router();
  //
  //   for (const controller of controllers) {
  //     const actions = Reflect.getOwnMetadata(ActionKey, controller);
  //
  //     const [fullParentPath, allParentMiddlewares] = await this.buildControllerHierarchy(controller);
  //
  //     for (const action of actions) {
  //       const actionOptions = Reflect.getOwnMetadata(ActionKey, controller);
  //       const { route: actionRoute, methods, name, middlewares: actionMiddlewares } = actionOptions;
  //
  //       const resolvedActionMiddlewares = await Promise.all(
  //         actionMiddlewares.map((amw) => this.middlewaresLocator.resolve(amw)),
  //       );
  //
  //       const fullPath = fullParentPath + actionRoute;
  //       const allMiddlewares = [...allParentMiddlewares, ...resolvedActionMiddlewares];
  //
  //
  //     }
  //   }
  // }
  //
  // private async buildControllerHierarchy(controller: AbstractController): Promise<[string, any[]]> {
  //   const controllerOptions = Reflect.getOwnMetadata(ControllerKey, controller.constructor);
  //   const { route, middlewares, parent } = controllerOptions;
  //
  //   let parentPath = '';
  //   let parentMiddlewares = [];
  //   if (parent) {
  //     const parentController = await this.controllerLocator.resolve(parent);
  //     [parentPath, parentMiddlewares] = await this.buildControllerHierarchy(parentController);
  //   }
  //
  //   const resolvedMiddlewares = await Promise.all(
  //     middlewares.map((mw) => this.middlewaresLocator.resolve(mw)),
  //   );
  //
  //   return [parentPath + route, [...parentMiddlewares, ...resolvedMiddlewares]];
  // }


}
