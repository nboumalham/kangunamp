import { Component, OnInit } from '@angular/core';
import { JellyfinService } from '../services/jellyfin.service';
import { StoreService } from '../services/store.service';
import { ListComponent } from '../listView/list.component';
import {TrackItem} from './track-item.model';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Location } from '@angular/common'

@Component({
  selector: 'track-list',
  templateUrl: '../listView/list.component.html',
  styleUrls: ['../listView/list.component.scss']
})
export class TrackListComponent extends ListComponent implements OnInit {

  constructor(private location: Location, private route: ActivatedRoute, private router: Router, private jellyfinService: JellyfinService, private storeService: StoreService) {
    super();
  }

   ngOnInit(): void {
    var artistId = this.route.snapshot.paramMap.get('id');
    if(artistId != null)
      this.listItems(artistId);
  }
  
  selectItem(item : TrackItem) : void {
    this.storeService.setPlayingTrack(item);
    //this.router.navigate(['player']);
  }

  listItems(artistId: string): void {
    this.jellyfinService.listItems(artistId)
    .subscribe(
        tracks => {
          tracks.Items.forEach((track : any, index : number) => {
          var listItem : TrackItem = new TrackItem(track.Id, track.Name, track.AlbumArtist, (index == 0 ? true : false), track.Album, this.jellyfinService.getTrackImageURL(track.Id));
          this.itemList.push(listItem);
          });
        },
        error => {
          console.log(error);
        });
  }
}