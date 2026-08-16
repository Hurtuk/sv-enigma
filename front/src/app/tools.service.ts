import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Question } from './model/question';
import { Md5 } from 'ts-md5';

@Injectable({
  providedIn: 'root'
})
export class ToolsService {

  constructor(
    private http: HttpClient
  ) { }

  public getEnigma(code: string): Observable<Question> {
    return this.http.get<Question>(environment.apiUrl + 'getEnigma.php', { params: { code } });
  }

  public getNextEnigmaCode(color: string, number: number): string {
    return (new Md5()).appendStr(color + (number + 1)).end()!.toString().substring(0, 10);
  }

}
