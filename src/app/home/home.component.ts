import { Component, OnInit } from '@angular/core';
import {ListItem} from '../listView/list-item.model';
import { ListComponent } from '../listView/list.component';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Location } from '@angular/common'

@Component({
  selector: 'home',
  templateUrl: '../listView/list.component.html',
  styleUrls: ['../listView/list.component.scss']
})
export class HomeComponent extends ListComponent implements OnInit {

  constructor(private location: Location, router: Router) {
    super(router);
  }

   ngOnInit(): void {
    this.listItems();
  }


  selectItem(item : ListItem) : void {
    if(item.title === "Music"){
    	this.router.navigate(['artists']);
    }
    else if(item.title === "Settings"){
      this.router.navigate(['settings']);
    }
  }

  listItems(): void {
    this.itemList.push(new ListItem("0", "Music", "Jellyfin", true));
    this.itemList.push(new ListItem("1", "Settings", "App settings", false));
    this.itemList.push(new ListItem("2", "Quit", "Jellyfin", false));
  }
}