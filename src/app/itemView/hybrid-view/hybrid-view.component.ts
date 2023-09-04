import {Component} from '@angular/core';
import {DeviceType, SharedService} from "../../services/shared.service";

@Component({
  selector: 'app-hybrid-view',
  templateUrl: './hybrid-view.component.html',
  styleUrls: ['./hybrid-view.component.scss']
})
export class HybridViewComponent  {

  constructor(public sharedService : SharedService) { }

  protected readonly DeviceType = DeviceType;
}
