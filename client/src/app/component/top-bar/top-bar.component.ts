import { Component } from '@angular/core';
import { ModalService } from '../../service/modal.service';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css']
})
export class TopBarComponent {

  signupFrameType;
  signupFrameHeaderDoctor;
  signupFrameHeaderPatient;
  isUserLoggedIn = false;

  constructor(
    private modalService: ModalService
  ) {}

  ngOnInit() {
    this.signupFrameHeaderPatient = document.getElementsByClassName('signup-frame-header-patient')[0] as HTMLElement;
    this.signupFrameHeaderDoctor = document.getElementsByClassName('signup-frame-header-doctor')[0] as HTMLElement;
  }

  openModal(id: string) {
    this.signupFrameType = 'patient';
    this.signupFrameHeaderDoctor.style['border-bottom'] = 'none';
    this.signupFrameHeaderDoctor.style['background'] = 'none';
    this.signupFrameHeaderPatient.style['border-bottom'] = '4px solid #4B0082';
    this.signupFrameHeaderPatient.style['background'] = 'linear-gradient(to bottom, #D0C5D1, #FFFFFF, #D0C5D1)';
    this.modalService.open(id);
  }

  onPatientSignupFrameChosen() {
    this.signupFrameType = 'patient';
    this.signupFrameHeaderDoctor.style['border-bottom'] = 'none';
    this.signupFrameHeaderDoctor.style['background'] = 'none';
    this.signupFrameHeaderPatient.style['border-bottom'] = '4px solid #4B0082';
    this.signupFrameHeaderPatient.style['background'] = 'linear-gradient(to bottom, #D0C5D1, #FFFFFF, #D0C5D1)';
  }

  onDoctorSignupFrameChosen() {
    this.signupFrameType = 'doctor';
    this.signupFrameHeaderDoctor.style['border-bottom'] = '4px solid #4B0082';
    this.signupFrameHeaderDoctor.style['background'] = 'linear-gradient(to bottom, #D0C5D1, #FFFFFF, #D0C5D1)';
    this.signupFrameHeaderPatient.style['border-bottom'] = 'none';
    this.signupFrameHeaderPatient.style['background'] = 'none';
  }

  onUserLogin() {
    this.isUserLoggedIn = true;
  }

  onUserLogout() {
    this.isUserLoggedIn = false;
  }

}
