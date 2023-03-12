import { Component, OnInit } from '@angular/core';
import {ListItem} from '../listView/list-item.model';
import { JellyfinService } from '../services/jellyfin.service';
import { ListComponent } from '../listView/list.component';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Location } from '@angular/common'

@Component({
  selector: 'artist-list',
  templateUrl: '../listView/list.component.html',
  styleUrls: ['../listView/list.component.scss']
})
export class ArtistListComponent extends ListComponent implements OnInit {

  constructor(private location: Location, private router: Router, private jellyfinService: JellyfinService) {
    super();
  }

   ngOnInit(): void {
    this.listItems();
  }

  selectItem(item : ListItem) {
    this.router.navigate(['artists', item.id, 'albums']);
  }

/*  backButton(): void {
    this.location.back()
  }*/

  listItems(): void {
    this.jellyfinService.listArtists()
    .subscribe(
        artists => {
          artists.Items.forEach((artist : any, index : number) => {
          var listItem : ListItem = new ListItem(artist.Id, artist.Name, artist.Type, (index == 0 ? true : false));
          this.itemList.push(listItem);
          });
        },
        error => {
          console.log(error);
        });
  }
}