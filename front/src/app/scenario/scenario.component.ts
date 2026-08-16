import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Question } from '../model/question';
import { ToolsService } from '../tools.service';

@Component({
  selector: 'sv-scenario',
  templateUrl: './scenario.component.html',
  styleUrls: ['./scenario.component.scss']
})
export class ScenarioComponent implements OnInit {

  private static ERROR_DURATION = 2000;
  private static PENALTY_DURATION = 30000;

  public chars: string;
  public char: string;

  @ViewChild('sendButton')
  public sendButton: ElementRef;

  @ViewChild('enigmaWrapper')
  public wrapper: ElementRef;

  public errorMessage?: string;
  public errorOpen = false;

  public guessingPlace: boolean;

  public enigma: Question;

  public scanOpen: boolean;

  public answer?: string;

  public routerLoading: boolean;

  constructor(
    private tools: ToolsService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Code en argument de l'URL
    this.route.paramMap.subscribe(params => {
        const code = params.get('code')!;
        this.guessingPlace = true;
        this.scanOpen = false;
        this.routerLoading = false;
        delete this.answer;
        this.tools.getEnigma(code)
          .subscribe(question => {
            if (!question) {
              this.router.navigate(['/']);
            }
            setTimeout(() => this.wrapper.nativeElement.scrollTop = 0, 0);
            // Afficher l'énigme du lieu et le scanner
            this.enigma = question;
            if (this.enigma.answer?.match(/^[0-9]+$/)) {
              this.chars = "chiffres restants";
              this.char = "chiffre restant";
            } else {
              this.chars = "lettres restantes";
              this.char = "lettre restante";
            }
          });
      }
    );

  }

  public scanSuccessHandler($event: any) {
    if (this.enigma?.code === $event) {
      this.guessingPlace = false;
      setTimeout(() => this.wrapper.nativeElement.scrollTop = 0, 0);
    } else {
      this.error("QR Code erroné. Êtes-vous dans la bonne salle ?");
    }
  }

  public scanErrorHandler() {
    this.error('Impossible de trouver l\'appareil photo... Faites-vous ça avec un appareil du XXIème siècle ?');
  }

  public validateAnswer() {
    if (this.answer) {
      const a =  ScenarioComponent.normalize(this.answer);
      const toFind = ScenarioComponent.normalize(this.enigma.answer);
      if (a !== toFind) {
        if (toFind.length === 1) {
          this.error(`Ce n'est pas la bonne réponse ! Malheureusement, vous avez fait surchauffer le PC central et devez attendre ${ScenarioComponent.PENALTY_DURATION / 1000} secondes avant de pouvoir réessayer.`, ScenarioComponent.PENALTY_DURATION);
        } else {
          this.error('Ce n\'est pas la bonne réponse !');
        }
      } else {
        this.routerLoading = true;
        setTimeout(() => {
          this.router.navigate(['/scenario/' + this.tools.getNextEnigmaCode(this.enigma?.color!, this.enigma?.number!)]);
        }, 0);
      }
    }
  }

  public closeKeyboard() {
    this.sendButton.nativeElement.focus();
  }

  private error(message: string, duration = ScenarioComponent.ERROR_DURATION) {
    this.errorMessage = message;
    this.errorOpen = true;
    setTimeout(() => this.errorOpen = false, duration);
  }

  private static normalize(str: string): string {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/-/g, ' ').toUpperCase();
  }

}
