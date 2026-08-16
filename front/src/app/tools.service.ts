import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Md5 } from 'ts-md5';

import { Question } from './model/question';

@Injectable({ providedIn: 'root' })
export class ToolsService {
  private readonly http = inject(HttpClient);

  /**
   * Le front et l'API sont servis par le même domaine, mais pas forcément à sa
   * racine : en production le site vit sous `/sv/`. L'URL est donc résolue contre
   * le `<base href>` de la page, que le build renseigne.
   *
   * On ne peut pas se contenter d'un chemin relatif : HttpClient le résoudrait
   * contre l'URL courante, ce qui donnerait `/sv/scenario/<code>/api/` sur une
   * page de chapitre.
   */
  private readonly apiUrl = new URL('api/', inject(DOCUMENT).baseURI).href;

  /** Renvoie `null` si le code ne correspond à aucune étape. */
  public getEnigma(code: string): Observable<Question | null> {
    return this.http.get<Question | null>(`${this.apiUrl}getEnigma.php`, { params: { code } });
  }

  /**
   * Recalcule le code d'une étape à partir de la couleur de l'équipe et du chapitre.
   * C'est ainsi que la table `transitions` a été remplie, et c'est ce que contiennent
   * les QR codes affichés dans les salles.
   */
  public getEnigmaCode(color: string, chapter: number): string {
    return Md5.hashStr(`${color}${chapter}`).substring(0, 10);
  }
}
