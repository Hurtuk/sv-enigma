import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'sv-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  ngOnInit(): void {
    screen.orientation.lock("portrait")
      .catch(() => {
        // Nothing
      });
      //navigator.mediaDevices.getUserMedia({ video: true });
  }

}
