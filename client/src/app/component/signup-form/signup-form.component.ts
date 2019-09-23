import { Component, Input } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ModalService } from '../../service/modal.service';

@Component({
  selector: 'app-signup-form',
  templateUrl: './signup-form.component.html',
  styleUrls: ['./signup-form.component.css']
})
export class SignupFormComponent {

  @Input() signupFormType;
  signupForm;

  constructor(
    private formBuilder: FormBuilder,
    private modalService: ModalService
  ) {
    // Apply sync and async validations
    this.signupForm = this.formBuilder.group({
      'firstName' : '',
      'lastName' : '',
      'email' : '',
      'phone': '',
      'password' : '',
      'isDoctor' : '',
      'specialization' : '',
      'hospital' : ''
    });
  }

  onSubmit() {
    // @TODO: Replace with toast
    window.alert('Your form has been submitted!');
    this.signupForm.reset();
    this.modalService.close('signup-modal');
    // @TODO: Create a service for hitting the backend API and call the method of that service here
  }

}
