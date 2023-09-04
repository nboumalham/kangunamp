import { Component } from '@angular/core';

@Component({
  selector: 'app-on-screen-keyboard',
  templateUrl: './on-screen-keyboard.component.html',
  styleUrls: ['./on-screen-keyboard.component.scss']
})
export class OnScreenKeyboardComponent {
  keyboardKeys: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'A', 'B', 'C', 'D', 'E', 'F'];
  inputField: string = '';

  onKeyClick(key: string): void {
    this.inputField += key; // Append the clicked key to the input field
  }
}
