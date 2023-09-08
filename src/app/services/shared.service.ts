import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export class IndexHistory {
  index! : number;
  totalItems! : number;
  scrollTop! : number;
}

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  public selectedIndexHistory : IndexHistory[] = [{index: 0, totalItems: 0, scrollTop: 0}];
  private title = new BehaviorSubject<string>('Jellypod');
  private _breakpoint : number = 0;

  getCurrentIndex() {
    return this.selectedIndexHistory.slice(-1)[0].index;
  }

  getCurrenScroll() {
    return this.selectedIndexHistory.slice(-1)[0].scrollTop;
  }

  getCurrentTotalItems() {
    return this.selectedIndexHistory.slice(-1)[0].totalItems;
  }

  updateViewIndexHistory(currentIndex: IndexHistory, childIndex?: IndexHistory): void{

    this.selectedIndexHistory = this.selectedIndexHistory.slice(0, -1);
    this.selectedIndexHistory.push(currentIndex);
    if(childIndex) this.selectedIndexHistory.push(childIndex);
  }


  popViewIndex() : number {
    this.selectedIndexHistory = this.selectedIndexHistory.slice(0,-1);
    return this.getStackSize();
  }

  resetViewIndex() : void {
    this.selectedIndexHistory = [{index:0, scrollTop: 0, totalItems: 0}];
  }

  getStackSize() : number {
    return this.selectedIndexHistory.length;
  }

  getTitle() {
    return this.title.asObservable();
  }

  setTitle(title: string) {
    this.title.next(title);
  }

  getBreakpoint(): number {
    return this._breakpoint;
  }

  setBreakpoint(value: number) {
    this._breakpoint = value;
  }

  getDeviceType() {
    return this._breakpoint > 2 ? DeviceType.DESKTOP : DeviceType.MOBILE;
  }

  isDeviceMobile() : boolean {
    return this.getDeviceType() == DeviceType.MOBILE
}

  public getDeviceId(): string {
    let deviceId = localStorage.getItem('jellyfin_device_id');
    if (!deviceId) {
      deviceId = this.generateUUID();
      localStorage.setItem('jellyfin_device_id', deviceId);
    }
    return deviceId;
  }

  private generateUUID(): string {
    let d = new Date().getTime();
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      // tslint:disable-next-line:no-bitwise
      const r = ((d + Math.random() * 16) % 16) | 0;
      d = Math.floor(d / 16);
      // tslint:disable-next-line:no-bitwise
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
    return uuid;
  }

  public getDeviceName(): string {
    //TODO: get device name from device for now just return a static name
    return "Kangunamp";
  }
}

export enum DeviceType {
  DESKTOP = "desktop",
  MOBILE = "mobile",
  TV = "tv"
}
