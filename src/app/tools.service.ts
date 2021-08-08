import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Question } from './model/question';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ToolsService {

  constructor(
    private http: HttpClient
  ) { }

  public getEnigma(code: string): Observable<Question> {
    return this.http.get<Question>(environment.apiUrl + 'getEnigma.php', { params: { code } }).pipe(delay(1000)); // TODO
  }

  public getNextEnigmaCode(color: string, number: number): string {
    return 'b'; // TODO
  }
}
