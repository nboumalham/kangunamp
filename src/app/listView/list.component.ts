import {Component, ElementRef, ViewChild } from '@angular/core';
import {KeyboardHelper} from '../helpers/keyboard.helper'
import {ListItem} from './list-item.model';
import { Location } from '@angular/common'
import { Router } from '@angular/router';

@Component({
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  providers: [{ provide: KeyboardHelper, useExisting: ListComponent }]
})
export abstract class ListComponent extends KeyboardHelper{

  @ViewChild('container') container!: ElementRef;
  public itemList : ListItem[] = [];
  public index = 0;


  constructor(protected router: Router) {
    super();
    this.left_button_label = "Player";
  }

  
  abstract listItems(parentId? : string): void;
  abstract selectItem(item : ListItem) : void;

  handleDownButton() {
    // Your row selection code
    this.itemList[this.index].selected = false;
    if (this.index+1 < this.itemList.length) {
      this.index++
    } else {
      this.index = 0;
    }
    this.itemList[this.index].selected = true;
    this.scrollToSelected();
  }

  handleUpButton() {
    // Your row selection code
    this.itemList[this.index].selected = false;

    if (this.index == 0) {
      this.index = this.itemList.length-1
    } else {
      this.index--;
    }
    this.itemList[this.index].selected = true;
    this.scrollToSelected();
  }

  handleCenterButton() {
    this.selectItem(this.itemList[this.index]);
  }

  handleSoftRightButton() {
  }

  handleSoftLeftButton() {
    this.router.navigate(['player']);
  }

  handleBackButton() {
  }

  scrollToSelected() {
    const containerElement = this.container.nativeElement;
    const itemElements = containerElement.querySelectorAll('.list-item');
    const selectedItemElement = itemElements[this.index];
    const itemHeight = selectedItemElement.offsetHeight;
    const containerHeight = containerElement.offsetHeight;
    const containerScrollTop = containerElement.scrollTop;
    const containerScrollBottom = containerScrollTop + containerHeight;
    const selectedItemTop = selectedItemElement.offsetTop;
    const selectedItemBottom = selectedItemTop + itemHeight;

    if (selectedItemTop < containerScrollTop) {
      containerElement.scrollTop = selectedItemTop;
    } else if (selectedItemBottom > containerScrollBottom) {
      containerElement.scrollTop = selectedItemBottom - containerHeight;
    }
  }

}


export enum KEY_CODE {
  UP_ARROW = 38,
  DOWN_ARROW = 40,
  RIGHT_ARROW = 39,
  LEFT_ARROW = 37,
  ENTER = 13,
  SEVEN = 103,
  BACKSPACE = 8,
}