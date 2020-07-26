import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EnigmaComponent } from './enigma/enigma.component';
import { HomeComponent } from './home/home.component';


const routes: Routes = [
  { path: 'enigma/:code', component: EnigmaComponent },
  { path: '**', component: HomeComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
