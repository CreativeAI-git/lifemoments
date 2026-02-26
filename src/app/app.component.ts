import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { FacebookPixelService } from './services/facebook-pixel.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'familytree';

  constructor(
    private router: Router,
    private fbPixel: FacebookPixelService
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.fbPixel.trackPageView();
      }
    });
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        window.gtag('event', 'page_view', {
          page_path: event.urlAfterRedirects
        });
      });
  }
}
