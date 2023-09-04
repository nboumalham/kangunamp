import {Component, HostListener} from '@angular/core';
import {slideAnimation} from "./animations";
import {ChildrenOutletContexts} from "@angular/router";
import {SharedService} from "./services/shared.service";
import {Location} from "@angular/common";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    slideAnimation
  ]
})
export class AppComponent {
  title = 'kangunamp';
  constructor(private contexts: ChildrenOutletContexts, private sharedService : SharedService, private location : Location) {}


  getRouteAnimationData() {
    this.title = this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation']
    return (!this.sharedService.isDeviceMobile() ? this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'] : "inactive");
  }

  onResize(event: Event) {
    this.calculateGrid();
  }

  ngOnInit() {
    this.calculateGrid();
  }

  // Calculate the number of columns to display based on the screen width
  calculateGrid() {
    let size = 0;
    const width = window.innerWidth + 1;
    const height = window.innerHeight + 1;
    const ratio = width/height;
    this.sharedService.setBreakpoint(Math.ceil(3*ratio) - 1);
  }
}
