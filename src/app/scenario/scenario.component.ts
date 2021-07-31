import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Question } from '../model/question';
import { ToolsService } from '../tools.service';

@Component({
  selector: 'sv-scenario',
  templateUrl: './scenario.component.html',
  styleUrls: ['./scenario.component.scss']
})
export class ScenarioComponent implements OnInit {

  public errorMessage?: string;
  public errorOpen = false;

  public guessingPlace = true;

  public enigma?: Question;

  public scanOpen = false;

  public currentToken!: string;

  public answer: string;

  constructor(
    private tools: ToolsService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Code en argument de l'URL
    this.route.paramMap
      .subscribe(params => {
        const code = params.get('code')!;

        this.tools.getEnigma(code)
          .subscribe(question => {
            // Afficher l'énigme du lieu et le scanner
            this.enigma = question;
          });
      }
    );

  }

  public scanSuccessHandler($event: any) {
    console.log('success', $event);
    if (this.enigma?.code === $event) {
      this.guessingPlace = false;

      // Si bonne valeur scannée, on masque les composants actuels et on affiche l'énigme avec le formulaire pour répondre

    } else {
      this.error("QR Code erroné. Êtes-vous dans la bonne salle ?");
    }
  }

  public scanErrorHandler($event: any) {
    console.log('error', $event);
    this.error('Impossible de trouver l\'appareil photo... Faites-vous ça avec un appareil du XXIème siècle ?');
  }

  public validateAnswer() {
    this.error('Mauvaise réponse');


    // Si réponse OK, on redirige vers la suivante
  }

  private error(message: string) {
    this.errorMessage = message;
    this.errorOpen = true;
    setTimeout(() => this.errorOpen = false, 3000);
  }

}
