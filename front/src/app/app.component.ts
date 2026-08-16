import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'sv-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  ngOnInit(): void {
    // Le jeu est conçu pour un téléphone tenu à la verticale. Le verrouillage
    // n'est autorisé qu'en plein écran : ailleurs il échoue, et ce n'est pas grave.
    screen.orientation.lock('portrait').catch(() => {
      // Rien à faire : on reste simplement libre de tourner l'écran.
    });
  }
}
