import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from '@angular/router';
import {KeyboardHelper} from "./app/helpers/keyboard.helper";
import {ListComponent} from "./app/itemView/listView/list.component";
import {Component, ComponentRef} from "@angular/core";

interface DetachedRouteHandleExt extends DetachedRouteHandle {
  componentRef: ComponentRef<Component>;
}
export class CustomReuseStrategy implements RouteReuseStrategy {
  private handlers: { [key: string]: DetachedRouteHandleExt } = {};

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    //print all the stored routes and check if they have isAttached set to true
    return true; // Always detach components for reuse
  }

  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandleExt | null): void {
    if (handle) {
      this.callHook(handle, 'ngOnDetach');
      this.handlers[route.routeConfig!.path || ''] = handle;
    }
  }
  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    const shouldAttach = !!route.routeConfig && !!this.handlers[route.routeConfig.path || ''];
    return shouldAttach;
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    const key = this.getSnapshotKey(route);
    const stored: DetachedRouteHandleExt = this.handlers[route.routeConfig!.path || ''];
    console.debug('===========================================================')
    console.debug('handlers size: ', this.handlers)
    if(stored) {
      this.callHook(stored, 'ngOnAttach');
      for(let key in this.handlers) {
        const componentRef = this.handlers[key].componentRef;
        if (
          componentRef &&
          componentRef.instance &&
          typeof (componentRef.instance as any)['isAttached'] === 'boolean'
        ) {
          console.debug(key ," isAttached: ", (componentRef.instance as any)['isAttached']);
        } else {
          console.debug(key, ": ruh oh no isAttached property found. we are fucked", (componentRef.instance as any)['isAttached'])
        }
      }
      return stored;
    }
    for(let key in this.handlers) {
      const componentRef = this.handlers[key].componentRef;
      if (
        componentRef &&
        componentRef.instance &&
        typeof (componentRef.instance as any)['isAttached'] === 'boolean'
      ) {
        console.debug(key ," isAttached: ", (componentRef.instance as any)['isAttached']);
      }
    }
    return null;
  }

  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return future.routeConfig === curr.routeConfig;
  }

  private callHook(detachedTree: DetachedRouteHandleExt, hookName: string): void {
    const componentRef = detachedTree.componentRef;
    if (
      componentRef &&
      componentRef.instance &&
      typeof (componentRef.instance as any)[hookName] === 'function'
    ) {
      (componentRef.instance as any)[hookName]();
    }
  }


  private getSnapshotKey(snapshot: ActivatedRouteSnapshot): string {
    return snapshot.pathFromRoot.join('->');
  }

}
