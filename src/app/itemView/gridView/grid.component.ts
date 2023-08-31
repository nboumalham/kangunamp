import {Component } from '@angular/core';

import {ItemComponent} from "../item.component";
import {KeyboardHelper} from "../../helpers/keyboard.helper";

@Component({
  selector: 'item-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss', '../../../assets/themes/default.scss'],
  providers: [{ provide: KeyboardHelper, useExisting: GridComponent }]
})
export class GridComponent  extends ItemComponent {
  handleLeftButton(): void {
    this.previousItem();
  }
  handleRightButton(): void {
    this.nextItem();
  }
  handleDownButton() {
    this.playClickSound();
    // Your row selection code
    this.itemList[this.index].selected = false;
    if (this.index + this.sharedService.getBreakpoint() < this.itemList.length) {
      this.index = this.index + this.sharedService.getBreakpoint();
    } else if (this.index == this.sharedService.getBreakpoint()) {
      this.index = 0;
    } else this.index = this.itemList.length - 1
    this.itemList[this.index].selected = true;
    this.scrollToSelected();
  }
  handleUpButton() {
    this.playClickSound();
    // Your row selection code
    this.itemList[this.index].selected = false;

    if (this.index == 0) {
      this.index = this.itemList.length-1
    } else if (this.index - this.sharedService.getBreakpoint() < 0) {
      this.index = 0;
    }
    else {
      this.index = this.index - this.sharedService.getBreakpoint();
    }
    this.itemList[this.index].selected = true;
    this.scrollToSelected();
  }
  handleCenterButton() {
    this.selectItem();
  }
  handleSoftRightButton() {
  }
  handleSoftLeftButton() {
    this.router.navigate(['player']);
  }
  handleBackButton() {
   this.navigateBack();
  }

  scrollToSelected(attempts = 5, delay = 50): void {
    if (attempts <= 0) {
      console.warn('Failed to scroll to selected item after maximum attempts');
      return;
    }

    const containerElement = this.container.nativeElement;
    const itemElements = containerElement.querySelectorAll('.grid-item');
    const selectedItemElement = itemElements[this.index];

    if (!selectedItemElement) {
      setTimeout(() => {
        this.scrollToSelected(attempts - 1, delay);
      }, delay);
      return;
    }

    const itemHeight = selectedItemElement.offsetHeight;
    const containerHeight = containerElement.offsetHeight;
    const containerScrollTop = containerElement.scrollTop;
    const containerScrollBottom = containerScrollTop + containerHeight;
    const selectedItemTop = selectedItemElement.offsetTop;
    const selectedItemBottom = selectedItemTop + itemHeight;
    const centerOffset = containerHeight / 2 - itemHeight / 2;

    if (selectedItemTop < containerScrollTop + centerOffset) {
      // Scroll to the top of the selected item centered on the screen
      containerElement.scrollTop = selectedItemTop - centerOffset;
    } else if (selectedItemBottom > containerScrollBottom - centerOffset) {
      // Scroll to the bottom of the selected item centered on the screen
      containerElement.scrollTop = selectedItemBottom - containerHeight + centerOffset;
    }
  }




  getColumnTemplate(): string {
    // Calculate the column template based on the number of columns
    return `repeat(${this.sharedService.getBreakpoint()}, 1fr)`;
  }

  getColumnWidth(): string {
    // Calculate the column template based on the number of columns
    return `${window.innerWidth/this.sharedService.getBreakpoint()}px`;
  }

}
