import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class SharedService {

  public selectedIndexes: number[] = [0];
  private title = new BehaviorSubject<string>('Jellypod');
  private _breakpoint : number = 0;

  getCurrentIndex() {
    return this.selectedIndexes.slice(-1)[0];
  }

  updateViewIndex(index: number, childIndex: number = 0): void{

    this.selectedIndexes = this.selectedIndexes.slice(0, -1);
    this.selectedIndexes.push(index);

    if (childIndex !== undefined) {
      this.selectedIndexes.push(childIndex);
    }
  }



  popViewIndex() : number {
    this.selectedIndexes = this.selectedIndexes.slice(0, -1);
    return this.getStackSize();
  }

  getStackSize() : number {
    return this.selectedIndexes.length
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
}

export enum DeviceType {
  DESKTOP = "desktop",
  MOBILE = "mobile",
  TV = "tv"
}
