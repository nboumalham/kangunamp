import {ListItem} from '../listView/list-item.model';


export class TrackItem extends ListItem {

	public trackImageURL : string = "https://cdn.iconscout.com/icon/premium/png-512-thumb/question-mark-4397530-3644875.png?f=avif&w=256";
	public albumName : string = "--";

  	constructor(id: string, title: string, subtitle: string, selected : boolean, albumName? : string, trackImageURL? : string) {
  		super(id, title, subtitle, selected);
  		if (typeof trackImageURL !== 'undefined') {
  			this.trackImageURL = trackImageURL;
  		}
  		if (typeof albumName !== 'undefined') {
  			this.albumName = albumName;
  		}
  		
  }
}
