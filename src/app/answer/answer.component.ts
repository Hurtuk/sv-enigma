import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'sv-answer',
  templateUrl: './answer.component.html',
  styleUrls: ['./answer.component.scss']
})
export class AnswerComponent implements OnInit {

  public answer: string;
  public error = false;

  constructor() { }

  ngOnInit(): void {
  }

  public validAnswer() {
    this.error = true;
    setTimeout(() => this.error = false, 3000);
  }

}
