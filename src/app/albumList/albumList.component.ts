import { Component, OnInit } from '@angular/core';
import {ListItem} from '../listView/list-item.model';
import { JellyfinService } from '../services/jellyfin.service';
import { ListComponent } from '../listView/list.component';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Location } from '@angular/common'

@Component({
  selector: 'album-list',
  templateUrl: '../listView/list.component.html',
  styleUrls: ['../listView/list.component.scss']
})
export class AlbumListComponent extends ListComponent implements OnInit {

  constructor(router: Router, private route: ActivatedRoute, private jellyfinService: JellyfinService, private location: Location) {
    super(router);
  }

   ngOnInit(): void {
    var artistId = this.route.snapshot.paramMap.get('id');
    if(artistId != null)
      this.listItems(artistId);
  }


  leftSoftButton() : void {
    this.router.navigate(['player']);
  }

  selectItem(item : ListItem) : void {
    this.router.navigate(['albums', item.id, 'tracks']);
  }

  backButton(): void {
    this.location.back()
  }


  listItems(artistId: string): void {
    this.jellyfinService.listAlbums(artistId)
    .subscribe(
        albums => {
          albums.Items.forEach((album : any, index : number) => {
          var listItem : ListItem = new ListItem(album.Id, album.Name, album.Type, (index == 0 ? true : false));
          this.itemList.push(listItem);
          });
        },
        error => {
          console.log(error);
        });
  }
}