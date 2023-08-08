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
  abstract handleLeftButton() : void;
  abstract handleRightButton() : void;

  public left_button_label : string = "";
  public middle_button_label : string = "";
  public right_button_label : string = "";

  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {
  //event.preventDefault();
  event.stopPropagation();

  switch (event.keyCode) {
    case KEY_CODE.DOWN_ARROW:
      this.handleDownButton();
      break;

    case KEY_CODE.UP_ARROW:
      this.handleUpButton();
      break;

    case KEY_CODE.LEFT_ARROW:
      this.handleLeftButton();
      break;

    case KEY_CODE.RIGHT_ARROW:
      this.handleRightButton();
      break;

    case KEY_CODE.ENTER:
      this.handleCenterButton();
      break;

    case KEY_CODE.SEVEN:
      this.handleSoftLeftButton();
      break;

    case KEY_CODE.NINE:
      this.handleSoftRightButton();
      break;

    case KEY_CODE.BACKSPACE : case KEY_CODE.ESCAPE:
        this.handleBackButton();
        break;

    default:
      // Handle other key events here
      break;
  }
}


//handling UI sounds
  clickSoundPath = "../../assets/sounds/click.mp3";
  debounceTimeout : any;
  lastPlayTime = 0;

  playClickSound() {
    const currentTime = new Date().getTime();
    const timeSinceLastPlay = currentTime - this.lastPlayTime;

    const audio = new Audio(this.clickSoundPath);

    if (timeSinceLastPlay < 100) { // 200 milliseconds threshold, adjust as needed
      audio.volume = 0.2; // Lower volume (adjust as needed)
    } else {
      audio.volume = 0.4; // Full volume
    }

    this.lastPlayTime = currentTime;
    audio.play();
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
    ESCAPE = 27,
}
