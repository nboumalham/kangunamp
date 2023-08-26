import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { ListComponent } from './itemView/listView/list.component';
import { PlayerComponent } from './player/player.component';
import { AuthComponent } from './authView/auth.component';

import { AudioService } from './services/audio.service';
import { HeaderComponent } from './header/header.component';
import {GridComponent} from "./itemView/gridView/grid.component";

@NgModule({
  declarations: [
    AppComponent,
    ListComponent,
    GridComponent,
    PlayerComponent,
    AuthComponent,
    HeaderComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
  ],
  providers: [AudioService],
  bootstrap: [AppComponent]
})
export class AppModule { }
