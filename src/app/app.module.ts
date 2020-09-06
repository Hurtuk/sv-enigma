import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule }   from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AnswerComponent } from './answer/answer.component';
import { HomeComponent } from './home/home.component';
import { EnigmaComponent } from './enigma/enigma.component';
import { ScenarioComponent } from './scenario/scenario.component';

@NgModule({
  declarations: [
    AppComponent,
    AnswerComponent,
    HomeComponent,
    EnigmaComponent,
    ScenarioComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
