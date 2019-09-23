import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { TopBarComponent } from './component/top-bar/top-bar.component';
import { ModalComponent } from './component/modal/modal.component';
import { HomeTileComponent } from './component/home-tile/home-tile.component';
import { FooterComponent } from './component/footer/footer.component';
import { AboutusComponent } from './component/aboutus/aboutus.component';
import { TermsAndConditionsComponent } from './component/terms-and-conditions/terms-and-conditions.component';
import { LoginFormComponent } from './component/login-form/login-form.component';
import { SignupFormComponent } from './component/signup-form/signup-form.component';

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    RouterModule.forRoot([
      { path: '', component: HomeTileComponent },
      { path: 'aboutus', component: AboutusComponent },
      { path: 'terms-and-conditions', component: TermsAndConditionsComponent },
      { path: '**', redirectTo: '/' },
    ])
  ],
  declarations: [
    AppComponent,
    TopBarComponent,
    ModalComponent,
    HomeTileComponent,
    AboutusComponent,
    TermsAndConditionsComponent,
    FooterComponent,
    LoginFormComponent,
    SignupFormComponent
  ],
  bootstrap: [ AppComponent ],
})
export class AppModule { }
