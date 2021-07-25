import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'sv-enigma',
  templateUrl: './enigma.component.html',
  styleUrls: ['./enigma.component.scss']
})
export class EnigmaComponent implements OnInit {

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
