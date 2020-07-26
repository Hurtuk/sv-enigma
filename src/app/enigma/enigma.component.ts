import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'sv-enigma',
  templateUrl: './enigma.component.html',
  styleUrls: ['./enigma.component.scss']
})
export class EnigmaComponent implements OnInit {

  public answer: string;

  constructor() { }

  ngOnInit(): void {
  }

}
