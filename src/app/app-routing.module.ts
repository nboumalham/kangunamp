import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListComponent } from './listView/list.component';
import { PlayerComponent } from './player/player.component';
import { AuthComponent } from './authView/auth.component';
import {GridComponent} from "./gridView/grid.component";
//import { SettingsComponent } from './settings/settings.component';

const routes: Routes = [
  { path: 'home', component: ListComponent, data: { type: 'home' } },
  { path: 'settings', component: ListComponent, data: { type: 'settings' } },
  { path: 'about', component: ListComponent, data: { type: 'about' } },
  { path: 'themes', component: ListComponent, data: { type: 'themes' } },
  { path: 'artists', component: GridComponent, data: { type: 'artists' } },
  { path: 'artists/:id/albums', component: GridComponent, data: { type: 'albums' } },
  { path: 'albums', component: GridComponent, data: { type: 'albums' } },
  { path: 'albums/:id/tracks', component: ListComponent, data: { type: 'tracks' }  },
  { path: 'player', component: PlayerComponent },
  { path: 'auth', component: AuthComponent },
  { path: '',   redirectTo: '/home', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
