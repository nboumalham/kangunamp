import {HostListener, Directive, OnDestroy} from '@angular/core';

@Directive({
})
export abstract class KeyboardHelper implements OnDestroy {

  abstract handleSoftLeftButton() : void;
  abstract handleSoftRightButton() : void;
  abstract handleBackButton() : void;
  abstract handleCenterButton() : void;
  abstract handleUpButton() : void;
  abstract handleDownButton() : void;
  abstract handleLeftButton() : void;
  abstract handleRightButton() : void;

  protected isAttached = true;

  ngOnAttach() {
    this.isAttached = true;
  }

  ngOnDetach() {
    this.isAttached = false;
  }
  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (!this.isAttached) {
      //console.debug('[',this.constructor.name, '] : ', ' IGNORED keyEvent because component is not attached');
      return;
    } else {
      //console.debug('[',this.constructor.name, '] : ', ' keyEvent : ', event.keyCode);
    }

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

  ngOnDestroy() {
    // Remove the event listener when the component is destroyed
    // console.debug : print the name of the class destructed
    console.debug(this.constructor.name + ' destroyed');
    window.removeEventListener('keydown', this.keyEvent);
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
