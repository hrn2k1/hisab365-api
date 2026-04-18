import { Router } from 'express';
import { CONTROLLER_PREFIX_METADATA_KEY, ROUTE_METADATA_KEY, RouteDefinition, AUTHENTICATED_METADATA_KEY } from '../decorators';
import { authMiddleware } from '../middlewares/authMiddleware';

/**
 * Register all decorated controllers and routes
 */
export function registerControllers(router: Router, controllers: any[]): void {
  controllers.forEach((ControllerClass) => {
    const controllerInstance = new ControllerClass();
    const prefix = Reflect.getMetadata(CONTROLLER_PREFIX_METADATA_KEY, ControllerClass) || '';
    const routes: RouteDefinition[] = Reflect.getMetadata(ROUTE_METADATA_KEY, ControllerClass) || [];

    routes.forEach((route) => {
      const fullPath = `${prefix}${route.path}`;
      const handler = controllerInstance[route.handlerName].bind(controllerInstance);
      
      // Check if route requires authentication
      const isAuthenticated = Reflect.getMetadata(AUTHENTICATED_METADATA_KEY, controllerInstance, route.handlerName) || false;
      
      // Apply auth middleware if route is authenticated
      const middlewares = isAuthenticated ? [authMiddleware, handler] : [handler];

      switch (route.method) {
        case 'get':
          router.get(fullPath, ...middlewares);
          break;
        case 'post':
          router.post(fullPath, ...middlewares);
          break;
        case 'put':
          router.put(fullPath, ...middlewares);
          break;
        case 'delete':
          router.delete(fullPath, ...middlewares);
          break;
        case 'patch':
          router.patch(fullPath, ...middlewares);
          break;
      }
    });
  });
}
