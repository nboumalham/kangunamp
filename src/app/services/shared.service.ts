import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  selectedIndexes: number[] = [0];

  private title = new BehaviorSubject<string>('Jellypod');

  getCurrentIndex() {
    return this.selectedIndexes.slice(-1)[0];
  }

  updateViewIndex(index: number, hasChild : boolean) {
    this.selectedIndexes = this.selectedIndexes.slice(0, -1);
    this.selectedIndexes.push(index);
    if(hasChild) this.selectedIndexes.push(0);
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
}
