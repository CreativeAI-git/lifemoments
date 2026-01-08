import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FamilyTreeComponent } from './family-tree/family-tree.component';
import { UrlLinkComponent } from './url-link/url-link.component';
import { SnapshotComponent } from './snapshot/snapshot.component';
import { GuestUserComponent } from './guest-user/guest-user.component';
import { ReverseSnapshotComponent } from './reverse-snapshot/reverse-snapshot.component';
import { DeleteAccountComponent } from './delete-account/delete-account.component';
import { DeeplinkComponent } from './deeplink/deeplink.component';
import { NoRedirectComponent } from './no-redirect/no-redirect.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { TermsofuseComponent } from './termsofuse/termsofuse.component';
import { PrivacypolicyComponent } from './privacypolicy/privacypolicy.component';
import { OurStoryComponent } from './our-story/our-story.component';

const routes: Routes = [
  { path: 'termsofuse', component: TermsofuseComponent },
  { path: 'ourstory', component: OurStoryComponent },
  { path: 'privacypolicy', component: PrivacypolicyComponent },
  { path: 'remove-account', component: DeleteAccountComponent },
  { path: 'deeplink', component: DeeplinkComponent },
  { path: 'give-haring-a-try', component: DeeplinkComponent },
  { path: 'handover-login', component: DeeplinkComponent },
  { path: 'handover', component: DeeplinkComponent },
  { path: 'sharing', component: DeeplinkComponent },
  { path: 'guest-login', component: DeeplinkComponent },
  { path: 'your-trial-about-to-end', component: DeeplinkComponent },
  { path: 'your-trial-has-ended', component: DeeplinkComponent },
  { path: 'start-interview', component: DeeplinkComponent },
  { path: 'start-interview-three', component: DeeplinkComponent },
  { path: 'profile-photo', component: DeeplinkComponent },
  { path: 'profile-photo-member', component: DeeplinkComponent },
  { path: 'profile-photo-pet', component: DeeplinkComponent },
  { path: 'give_it_try', component: DeeplinkComponent },
  { path: 'free-trial', component: DeeplinkComponent },
  { path: 'trial-scree', component: DeeplinkComponent },
  { path: 'snapshot/:family_id', component: SnapshotComponent },
  { path: 'no-redirect/:family_id', component: NoRedirectComponent },
  { path: 'reverse-snapshot/:family_id', component: ReverseSnapshotComponent },
  { path: 'urlLink/:id/:is_pet', component: UrlLinkComponent },
  { path: 'guest-user/:family_id', component: GuestUserComponent },
  { path: '', component: LandingPageComponent, pathMatch: 'full' },
  { path: ':family_id', component: FamilyTreeComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
