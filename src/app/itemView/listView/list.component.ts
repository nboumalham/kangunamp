import {Component } from '@angular/core';
import {BaseListItem} from '../../models/list-item.model';



import {ItemComponent} from "../item.component";
import {KeyboardHelper} from "../../helpers/keyboard.helper";

@Component({
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss', '../../../assets/themes/default.scss'],
  providers: [{ provide: KeyboardHelper, useExisting: ItemComponent }]
})
export class ListComponent extends ItemComponent {

  /** ITEMCOMPONENT METHODS **/
  scrollToSelected(attempts = 5, delay = 50): void {
    if (attempts <= 0) {
      console.warn('Failed to scroll to selected item after maximum attempts');
      return;
    }

    const containerElement = this.container.nativeElement;
    const itemElements = containerElement.querySelectorAll('.list-item');
    const selectedItemElement = itemElements[this.index];

    if (!selectedItemElement) {
      setTimeout(() => {
        this.scrollToSelected(attempts - 1, delay);
      }, delay);
      return;
    }

    const itemHeight = selectedItemElement.offsetHeight;
    const containerHeight = containerElement.offsetHeight/2;
    const containerScrollTop = containerElement.scrollTop;
    const containerScrollBottom = containerScrollTop + containerHeight;
    const selectedItemTop = selectedItemElement.offsetTop - itemHeight; //- itemHeight is supposed to subtract the height of the header. So always make sure the header is equal in height to the item
    const selectedItemBottom = selectedItemTop + itemHeight;

    if (selectedItemTop < containerScrollTop) {
      containerElement.scrollTop = selectedItemTop;
    } else if (selectedItemBottom > containerScrollBottom) {
      containerElement.scrollTop = selectedItemBottom - containerHeight;
    }
  }

  /** KEYBOARD HELPER METHODS **/
  handleDownButton() {
    this.nextItem();
  }
  handleUpButton() {
    this.previousItem();
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
  handleLeftButton(): void {
  }
  handleRightButton(): void {
  }
}
