import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListComponent } from './itemView/listView/list.component';
import { PlayerComponent } from './player/player.component';
import { AuthComponent } from './authView/auth.component';
import {HybridViewComponent} from "./itemView/hybrid-view/hybrid-view.component";
const routes: Routes = [
  { path: 'home', component: ListComponent, data: { type: 'home', animation: 'Home' } },
  { path: 'settings', component: ListComponent, data: { type: 'settings', animation: '1' } },
  { path: 'about', component: ListComponent, data: { type: 'about' } },
  { path: 'themes', component: ListComponent, data: { type: 'themes' } },
  { path: 'artists', component: HybridViewComponent, data: { type: 'artists', animation: '1' } },
  { path: 'artists/:id/albums', component: HybridViewComponent, data: { type: 'albums',  animation: '2' } },
  { path: 'artists/:id/tracks', component: ListComponent, data: { type: 'artistTracks',  animation: '2'  }  },
  { path: 'albums', component: HybridViewComponent, data: { type: 'albums', animation: "1" } },
  { path: 'albums/:id/tracks', component: ListComponent, data: { type: 'albumTracks',  animation: '3'  }  },
  { path: 'playlists', component: HybridViewComponent, data: { type: 'playlists',  animation: '1'  } },
  { path: 'playlists/:id/tracks', component: ListComponent, data: { type: 'playlistTracks',  animation: '2'  }  },
  { path: 'player', component: PlayerComponent, data: { animation: 'player'  } },
  { path: 'queue', component: ListComponent, data: { type: 'queueTracks',  animation: 'drawer'  } },
  { path: 'auth', component: AuthComponent, data: { animation: 'drawer'  } },
  { path: '',   redirectTo: '/home', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
