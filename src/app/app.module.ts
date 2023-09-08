import { NgModule, isDevMode } from '@angular/core';
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
import { OnScreenKeyboardComponent } from './on-screen-keyboard/on-screen-keyboard.component';
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import { AudioQueueComponent } from './audio-queue/audio-queue.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { HybridViewComponent } from './itemView/hybrid-view/hybrid-view.component';
import {LazyImageDirective} from "./directives/lazy-image.directive";
import {PwaService} from "./services/pwa.service";
import {RouteReuseStrategy} from "@angular/router";
import {DraggableDirective} from "./directives/draggable.directive";

@NgModule({
    declarations: [
        AppComponent,
        ListComponent,
        GridComponent,
        PlayerComponent,
        AuthComponent,
        HeaderComponent,
        OnScreenKeyboardComponent,
        AudioQueueComponent,
        HybridViewComponent,
        LazyImageDirective,
        DraggableDirective
    ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
  ],
  providers: [
    AudioService,
    PwaService],
  bootstrap: [AppComponent]
})
export class AppModule { }
