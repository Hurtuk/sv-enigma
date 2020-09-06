import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AnswerComponent } from './answer/answer.component';
import { HomeComponent } from './home/home.component';
import { ScenarioComponent } from './scenario/scenario.component';


const routes: Routes = [
  { path: 'answer/:code', component: AnswerComponent },
  { path: 'scenario/:code', component: ScenarioComponent },
  { path: '**', component: HomeComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
