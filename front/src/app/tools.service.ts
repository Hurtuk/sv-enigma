import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Md5 } from 'ts-md5';

import { Question } from './model/question';

/**
 * Le front et l'API sont servis par le même domaine : une URL relative suffit,
 * et en développement `proxy.conf.json` la renvoie vers le PHP local.
 */
const API_URL = '/api/';

@Injectable({ providedIn: 'root' })
export class ToolsService {
  private readonly http = inject(HttpClient);

  /** Renvoie `null` si le code ne correspond à aucune étape. */
  public getEnigma(code: string): Observable<Question | null> {
    return this.http.get<Question | null>(`${API_URL}getEnigma.php`, { params: { code } });
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
