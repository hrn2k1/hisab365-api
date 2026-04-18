import 'reflect-metadata';

export interface RouteDefinition {
  path: string;
  method: 'get' | 'post' | 'put' | 'delete' | 'patch';
  handlerName: string;
  authenticated?: boolean;
}

export interface ControllerMetadata {
  prefix: string;
  routes: RouteDefinition[];
}

export const CONTROLLER_PREFIX_METADATA_KEY = Symbol('CONTROLLER_PREFIX');
export const ROUTE_METADATA_KEY = Symbol('ROUTES');
export const AUTHENTICATED_METADATA_KEY = Symbol('AUTHENTICATED');

/**
 * Controller decorator - marks a class as a controller
 * @param prefix - the route prefix for this controller
 */
export function Controller(prefix: string = '') {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    Reflect.defineMetadata(CONTROLLER_PREFIX_METADATA_KEY, prefix, constructor);

    // Ensure routes metadata exists
    if (!Reflect.hasMetadata(ROUTE_METADATA_KEY, constructor)) {
      Reflect.defineMetadata(ROUTE_METADATA_KEY, [], constructor);
    }

    return constructor;
  };
}

/**
 * Get decorator - marks a method to handle GET requests
 * @param path - the route path
 */
export function Get(path: string = '') {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const routes: RouteDefinition[] = Reflect.getOwnMetadata(ROUTE_METADATA_KEY, target.constructor) || [];
    routes.push({
      path,
      method: 'get',
      handlerName: propertyKey,
    });
    Reflect.defineMetadata(ROUTE_METADATA_KEY, routes, target.constructor);
  };
}

/**
 * Post decorator - marks a method to handle POST requests
 * @param path - the route path
 */
export function Post(path: string = '') {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const routes: RouteDefinition[] = Reflect.getOwnMetadata(ROUTE_METADATA_KEY, target.constructor) || [];
    routes.push({
      path,
      method: 'post',
      handlerName: propertyKey,
    });
    Reflect.defineMetadata(ROUTE_METADATA_KEY, routes, target.constructor);
  };
}

/**
 * Put decorator - marks a method to handle PUT requests
 * @param path - the route path
 */
export function Put(path: string = '') {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const routes: RouteDefinition[] = Reflect.getOwnMetadata(ROUTE_METADATA_KEY, target.constructor) || [];
    routes.push({
      path,
      method: 'put',
      handlerName: propertyKey,
    });
    Reflect.defineMetadata(ROUTE_METADATA_KEY, routes, target.constructor);
  };
}

/**
 * Delete decorator - marks a method to handle DELETE requests
 * @param path - the route path
 */
export function Delete(path: string = '') {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const routes: RouteDefinition[] = Reflect.getOwnMetadata(ROUTE_METADATA_KEY, target.constructor) || [];
    routes.push({
      path,
      method: 'delete',
      handlerName: propertyKey,
    });
    Reflect.defineMetadata(ROUTE_METADATA_KEY, routes, target.constructor);
  };
}

/**
 * Patch decorator - marks a method to handle PATCH requests
 * @param path - the route path
 */
export function Patch(path: string = '') {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const routes: RouteDefinition[] = Reflect.getOwnMetadata(ROUTE_METADATA_KEY, target.constructor) || [];
    routes.push({
      path,
      method: 'patch',
      handlerName: propertyKey,
    });
    Reflect.defineMetadata(ROUTE_METADATA_KEY, routes, target.constructor);
  };
}

/**
 * Authenticated decorator - marks a route as requiring authentication
 */
export function Authenticated() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata(AUTHENTICATED_METADATA_KEY, true, target, propertyKey);
  };
}
