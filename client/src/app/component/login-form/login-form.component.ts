import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ModalService } from '../../service/modal.service';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent {

  loginForm;

  constructor(
    private formBuilder: FormBuilder,
    private modalService: ModalService
  ) {
    // Apply sync and async validations
    this.loginForm = this.formBuilder.group({
      'username': '',
      'password': ''
    });
  }

  onSubmit() {
    // @TODO: Replace with toast
    window.alert('Your form has been submitted!');
    this.loginForm.reset();
    this.modalService.close('login-modal');
    // @TODO: Create a service for hitting the backend API and call the method of that service here
  }

}
