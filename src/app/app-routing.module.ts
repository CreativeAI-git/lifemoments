import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'press-release',
    loadComponent: () => import('./press-release/press-release.component').then((m) => m.PressReleaseComponent)
  },
  {
    path: 'termsofuse',
    loadComponent: () => import('./termsofuse/termsofuse.component').then((m) => m.TermsofuseComponent)
  },
  {
    path: 'ourstory',
    loadComponent: () => import('./our-story/our-story.component').then((m) => m.OurStoryComponent)
  },
  {
    path: 'privacypolicy',
    loadComponent: () => import('./privacypolicy/privacypolicy.component').then((m) => m.PrivacypolicyComponent)
  },
  {
    path: 'remove-account',
    loadComponent: () => import('./delete-account/delete-account.component').then((m) => m.DeleteAccountComponent)
  },
  {
    path: 'deeplink',
    loadComponent: () => import('./deeplink/deeplink.component').then((m) => m.DeeplinkComponent)
  },
  {
    path: 'give-haring-a-try',
    loadComponent: () => import('./deeplink/deeplink.component').then((m) => m.DeeplinkComponent)
  },
  {
    path: 'handover-login',
    loadComponent: () => import('./deeplink/deeplink.component').then((m) => m.DeeplinkComponent)
  },
  {
    path: 'handover',
    loadComponent: () => import('./deeplink/deeplink.component').then((m) => m.DeeplinkComponent)
  },
  {
    path: 'sharing',
    loadComponent: () => import('./deeplink/deeplink.component').then((m) => m.DeeplinkComponent)
  },
  {
    path: 'guest-login',
    loadComponent: () => import('./deeplink/deeplink.component').then((m) => m.DeeplinkComponent)
  },
  {
    path: 'your-trial-about-to-end',
    loadComponent: () => import('./deeplink/deeplink.component').then((m) => m.DeeplinkComponent)
  },
  {
    path: 'your-trial-has-ended',
    loadComponent: () => import('./deeplink/deeplink.component').then((m) => m.DeeplinkComponent)
  },
  {
    path: 'start-interview',
    loadComponent: () => import('./deeplink/deeplink.component').then((m) => m.DeeplinkComponent)
  },
  {
    path: 'start-interview-three',
    loadComponent: () => import('./deeplink/deeplink.component').then((m) => m.DeeplinkComponent)
  },
  {
    path: 'profile-photo',
    loadComponent: () => import('./deeplink/deeplink.component').then((m) => m.DeeplinkComponent)
  },
  {
    path: 'profile-photo-member',
    loadComponent: () => import('./deeplink/deeplink.component').then((m) => m.DeeplinkComponent)
  },
  {
    path: 'profile-photo-pet',
    loadComponent: () => import('./deeplink/deeplink.component').then((m) => m.DeeplinkComponent)
  },
  {
    path: 'give_it_try',
    loadComponent: () => import('./deeplink/deeplink.component').then((m) => m.DeeplinkComponent)
  },
  {
    path: 'free-trial',
    loadComponent: () => import('./deeplink/deeplink.component').then((m) => m.DeeplinkComponent)
  },
  {
    path: 'trial-scree',
    loadComponent: () => import('./deeplink/deeplink.component').then((m) => m.DeeplinkComponent)
  },
  {
    path: 'snapshot/:family_id',
    loadComponent: () => import('./snapshot/snapshot.component').then((m) => m.SnapshotComponent)
  },
  {
    path: 'no-redirect/:family_id',
    loadComponent: () => import('./no-redirect/no-redirect.component').then((m) => m.NoRedirectComponent)
  },
  {
    path: 'reverse-snapshot/:family_id',
    loadComponent: () => import('./reverse-snapshot/reverse-snapshot.component').then((m) => m.ReverseSnapshotComponent)
  },
  {
    path: 'urlLink/:id/:is_pet',
    loadComponent: () => import('./url-link/url-link.component').then((m) => m.UrlLinkComponent)
  },
  {
    path: 'guest-user/:family_id',
    loadComponent: () => import('./guest-user/guest-user.component').then((m) => m.GuestUserComponent)
  },
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./landing-page/landing-page.component').then((m) => m.LandingPageComponent)
  },
  {
    path: ':family_id',
    loadComponent: () => import('./family-tree/family-tree.component').then((m) => m.FamilyTreeComponent)
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
