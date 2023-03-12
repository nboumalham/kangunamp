import {HostListener, Directive} from '@angular/core';

@Directive({
})
export abstract class KeyboardHelper {

  abstract handleSoftLeftButton() : void;
  abstract handleSoftRightButton() : void;
  abstract handleBackButton() : void;
  abstract handleCenterButton() : void;
  abstract handleUpButton() : void;
  abstract handleDownButton() : void;

  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {

  switch (event.keyCode) {
    case KEY_CODE.DOWN_ARROW:
      console.log("down");
      this.handleDownButton();
      break;

    case KEY_CODE.UP_ARROW:
      console.log("up");
      this.handleUpButton();
      break;

    case KEY_CODE.ENTER:
      console.log("enter");
      this.handleCenterButton();
      break;

    case KEY_CODE.SEVEN:
      this.handleSoftLeftButton();
      break;

    case KEY_CODE.NINE:
      this.handleSoftRightButton();
      break;

    case KEY_CODE.BACKSPACE:
      this.handleBackButton();
      break;

    default:
      // Handle other key events here
      break;
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
    NINE = 105,
    BACKSPACE = 8,
}