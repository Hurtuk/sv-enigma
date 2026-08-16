import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ZXingScannerModule } from '@zxing/ngx-scanner';

import { ToolsService } from '../tools.service';

/** Les douze équipes, identifiées par la couleur inscrite dans leur QR code. */
const TEAM_COLORS = [
  'black',
  'blue',
  'brown',
  'cyan',
  'gray',
  'green',
  'lightgreen',
  'orange',
  'pink',
  'purple',
  'red',
  'yellow',
];

/** Délai avant l'affichage de l'accueil, le temps que la mise en scène se mette en place. */
const INTRO_DELAY = 5000;

@Component({
  selector: 'sv-home',
  imports: [ZXingScannerModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private readonly tools = inject(ToolsService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly ready = signal(false);

  /** La caméra n'est allumée qu'au premier appui, pour ne pas demander l'autorisation trop tôt. */
  protected readonly scanning = signal(false);

  ngOnInit(): void {
    const timer = setTimeout(() => this.ready.set(true), INTRO_DELAY);
    this.destroyRef.onDestroy(() => clearTimeout(timer));
  }

  /** Le QR code d'une équipe contient sa couleur : il ouvre le premier chapitre. */
  protected onTeamScanned(value: string): void {
    if (TEAM_COLORS.includes(value)) {
      this.router.navigate(['/scenario', this.tools.getEnigmaCode(value, 1)]);
    }
  }
}
