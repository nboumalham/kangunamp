import { Component, OnInit } from '@angular/core';

import { AudioService } from '../services/audio.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
   
  statusLogo : string = "s";

  constructor(private audioService: AudioService) {}

  ngOnInit(): void {
    this.audioService.getPlayerStatus().subscribe(status => {
    	this.statusLogo = status;
    });
  }

}
