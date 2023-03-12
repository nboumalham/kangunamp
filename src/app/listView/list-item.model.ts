export class ListItem {
	public id: string;
	public title: string;
	public subtitle: string;
	public selected : boolean;
	
  	constructor(id: string, title: string, subtitle: string, selected : boolean) {
    	this.id = id;
    	this.title = title;
	    this.subtitle = subtitle;
    	this.selected = selected;
  }
}
