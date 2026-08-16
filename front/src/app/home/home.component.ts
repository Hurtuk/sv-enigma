import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ZXingScannerComponent } from '@zxing/ngx-scanner';
import { ToolsService } from '../tools.service';

@Component({
  selector: 'sv-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  private static COLORS = ['black', 'blue', 'brown', 'cyan', 'gray', 'green', 'lightgreen', 'orange', 'pink', 'purple', 'red', 'yellow'];

  public scanOpen: boolean;
  public ready: boolean;

  constructor(
    private tools: ToolsService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.scanOpen = false;
    setTimeout(() => {
      this.ready = true;
    }, 5000);
  }

  public scanSuccessHandler($event: any) {
    if (HomeComponent.COLORS.indexOf($event) !== -1) {
      this.router.navigate(['/scenario/' + this.tools.getNextEnigmaCode($event, 0)]);
    }
  }

}
