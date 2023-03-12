export class MainMenuItem extends ListItem {
  
  constructor(id: string, title: string, subtitle: string, selected : boolean) {
    this.id = id;
    this.title = title;
    this.subtitle = subtitle;
    super(selected);
  }
}
