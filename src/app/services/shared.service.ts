import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  selectedIndexes: number[] = [0];

  getCurrentIndex() {
    console.debug(this.selectedIndexes);
    return this.selectedIndexes.slice(-1)[0];
  }

  updateViewIndex(index: number, hasChild : boolean) {
    this.selectedIndexes = this.selectedIndexes.slice(0, -1);
    this.selectedIndexes.push(index);
    if(hasChild) this.selectedIndexes.push(0);
    console.debug(this.selectedIndexes);
  }

  popViewIndex() : number {
    this.selectedIndexes = this.selectedIndexes.slice(0, -1);
    console.debug(this.selectedIndexes);
    return this.getStackSize();
  }

  getStackSize() : number {
    return this.selectedIndexes.length
  }
}