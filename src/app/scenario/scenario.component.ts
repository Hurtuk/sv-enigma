import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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

  public answer?: string;

  public routerLoading = false;

  constructor(
    private tools: ToolsService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Code en argument de l'URL
    this.route.paramMap
      .subscribe(params => {
        const code = params.get('code')!;
        this.tools.getEnigma(code)
          .subscribe(question => {
            if (!question) {
              this.router.navigate(['/']);
            }
            // Afficher l'énigme du lieu et le scanner
            this.enigma = question;
          });
      }
    );

  }

  public scanSuccessHandler($event: any) {
    if (this.enigma?.code === $event) {
      this.guessingPlace = false;
    } else {
      this.error("QR Code erroné. Êtes-vous dans la bonne salle ?");
    }
  }

  public scanErrorHandler($event: any) {
    this.error('Impossible de trouver l\'appareil photo... Faites-vous ça avec un appareil du XXIème siècle ?');
  }

  public validateAnswer() {
    if (this.answer?.toUpperCase() !== this.enigma?.answer.toUpperCase()) {
      this.error('Ce n\'est pas la bonne réponse !');
      delete this.answer;
    } else {
      this.routerLoading = true;
      setTimeout(() => {
        this.router.navigate(['/scenario/' + this.tools.getNextEnigmaCode(this.enigma?.color!, this.enigma?.number!)]);
      }, 0);
    }
  }

  private error(message: string) {
    this.errorMessage = message;
    this.errorOpen = true;
    setTimeout(() => this.errorOpen = false, 2000);
  }

}
