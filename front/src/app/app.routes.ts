import { Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { ScenarioComponent } from './scenario/scenario.component';

// Les deux écrans sont chargés en même temps que l'application, volontairement :
// le jeu se joue en déplacement dans l'établissement, où le réseau est capricieux.
// Mieux vaut tout télécharger au démarrage que risquer un chunk manquant en pleine partie.
export const routes: Routes = [
  { path: 'scenario/:code', component: ScenarioComponent },
  { path: '**', component: HomeComponent },
];
