import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  Injector,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ZXingScannerModule } from '@zxing/ngx-scanner';

import { Question } from '../model/question';
import { SafeHtmlPipe } from '../safe-html.pipe';
import { ToolsService } from '../tools.service';

/** Durée d'affichage d'un message d'erreur ordinaire. */
const ERROR_DURATION = 2000;

/**
 * Une réponse d'un seul caractère se trouve trop vite en essayant tout :
 * une erreur bloque alors la saisie le temps que ça refroidisse.
 */
const PENALTY_DURATION = 30000;

@Component({
  selector: 'sv-scenario',
  imports: [FormsModule, SafeHtmlPipe, ZXingScannerModule],
  templateUrl: './scenario.component.html',
  styleUrl: './scenario.component.scss',
})
export class ScenarioComponent implements OnInit {
  private readonly tools = inject(ToolsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  private readonly sendButton = viewChild<ElementRef<HTMLButtonElement>>('sendButton');
  private readonly wrapper = viewChild<ElementRef<HTMLElement>>('enigmaWrapper');

  private errorTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    this.destroyRef.onDestroy(() => clearTimeout(this.errorTimer));
  }

  protected readonly enigma = signal<Question | null>(null);

  /** Vrai tant que l'équipe cherche la salle ; faux une fois sur place, devant l'énigme. */
  protected readonly guessingPlace = signal(true);

  /** La caméra n'est allumée qu'au premier appui, pour ne pas demander l'autorisation trop tôt. */
  protected readonly scanning = signal(false);

  protected readonly answer = signal('');

  /** Vrai entre la bonne réponse et l'arrivée du chapitre suivant. */
  protected readonly loadingNext = signal(false);

  protected readonly errorMessage = signal('');
  protected readonly errorOpen = signal(false);

  protected readonly expectedLength = computed(() => this.enigma()?.answer?.length ?? 0);

  protected readonly remaining = computed(() => this.expectedLength() - this.answer().length);

  protected readonly remainingLabel = computed(() => {
    const numeric = /^[0-9]+$/.test(this.enigma()?.answer ?? '');
    if (this.remaining() > 1) {
      return numeric ? 'chiffres restants' : 'lettres restantes';
    }
    return numeric ? 'chiffre restant' : 'lettre restante';
  });

  ngOnInit(): void {
    // Passer au chapitre suivant ne recrée pas le composant, seul le paramètre change :
    // c'est donc ici, et pas dans ngOnInit seul, que se fait le chargement.
    const subscription = this.route.paramMap.subscribe((params) => {
      const code = params.get('code') ?? '';
      this.answer.set('');
      this.tools.getEnigma(code).subscribe((question) => {
        if (!question) {
          this.router.navigate(['/']);
          return;
        }
        // Le chapitre précédent reste affiché jusqu'ici : pas de clignotement entre les deux.
        this.enigma.set(question);
        this.guessingPlace.set(true);
        this.scanning.set(false);
        this.loadingNext.set(false);
        this.scrollToTop();
      });
    });
    this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }

  /** Chaque salle affiche un QR code par équipe, qui vaut le code de l'étape en cours. */
  protected onRoomScanned(value: string): void {
    if (this.enigma()?.code === value) {
      this.guessingPlace.set(false);
      this.scrollToTop();
    } else {
      this.showError('QR Code erroné. Êtes-vous dans la bonne salle ?');
    }
  }

  protected onScanError(): void {
    this.showError(
      "Impossible de trouver l'appareil photo... Faites-vous ça avec un appareil du XXIème siècle ?",
    );
  }

  protected validateAnswer(): void {
    const enigma = this.enigma();
    if (!enigma?.answer) {
      return;
    }

    const expected = ScenarioComponent.normalize(enigma.answer);
    if (ScenarioComponent.normalize(this.answer()) !== expected) {
      if (expected.length === 1) {
        this.showError(
          `Ce n'est pas la bonne réponse ! Malheureusement, vous avez fait surchauffer le PC central et devez attendre ${PENALTY_DURATION / 1000} secondes avant de pouvoir réessayer.`,
          PENALTY_DURATION,
        );
      } else {
        this.showError("Ce n'est pas la bonne réponse !");
      }
      return;
    }

    this.loadingNext.set(true);
    this.router.navigate(['/scenario', this.tools.getEnigmaCode(enigma.color, enigma.number + 1)]);
  }

  /** Donner le focus au bouton referme le clavier virtuel. */
  protected closeKeyboard(): void {
    this.sendButton()?.nativeElement.focus();
  }

  private showError(message: string, duration = ERROR_DURATION): void {
    clearTimeout(this.errorTimer);
    this.errorMessage.set(message);
    this.errorOpen.set(true);
    this.errorTimer = setTimeout(() => this.errorOpen.set(false), duration);
  }

  /** Le conteneur n'est pas recréé d'un chapitre à l'autre : il faut le remonter à la main. */
  private scrollToTop(): void {
    afterNextRender(() => this.wrapper()?.nativeElement.scrollTo({ top: 0 }), {
      injector: this.injector,
    });
  }

  /** Les accents, la casse et les traits d'union ne doivent pas faire échouer une bonne réponse. */
  private static normalize(str: string): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/-/g, ' ')
      .toUpperCase();
  }
}
