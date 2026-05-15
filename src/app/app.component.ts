import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AnalyticsService } from './services/analytics.service';
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
    private fbPixel: FacebookPixelService,
    private analytics: AnalyticsService
  ) {
    this.analytics.scheduleLoad();
    this.fbPixel.scheduleLoad();

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.fbPixel.trackPageView();
        this.analytics.trackPageView(event.urlAfterRedirects);
      });
  }
}
