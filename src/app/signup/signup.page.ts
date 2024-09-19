import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
// import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { UtilService } from '../util.service';
import { Router } from '@angular/router';

export const StrongPasswordRegx: RegExp =
  /^(?=[^A-Z]*[A-Z])(?=[^a-z]*[a-z])(?=\D*\d).{8,}$/;

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage {

  signupForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  isSubmitting = false; // Add this flag

  constructor(private util: UtilService,
    public router: Router) {
    this.signupForm = new FormGroup({
      role: new FormControl('', Validators.required),
      name: new FormControl('', Validators.required),
      phone: new FormControl('', Validators.required),
      address: new FormControl('', Validators.required),
      email: new FormControl('', Validators.compose([Validators.required, Validators.email, this.lowercaseEmailValidator
      ])),
      password: new FormControl('', Validators.required),
      confirmPassword: new FormControl('', Validators.required),
    }, { validators: this.passwordMatchValidator });

  }

  lowercaseEmailValidator(control: FormControl) {
    const email = control.value;
    const startsWithLowercase = /^[a-z]/.test(email); // Check if the first character is lowercase
    return startsWithLowercase ? null : { lowercaseEmail: true };
  }

  signup(form: any) {
    if (this.signupForm.valid) {
      this.isSubmitting = true; // Show spinner when submitting
      this.util.post('register', form).subscribe({
        next: (res: any) => {
          if (res.status == 'success') {
            console.log('signin', res)
            this.util.presentToast('Success');
            this.signupForm.reset();
            this.router.navigate(['/login']);


          }
        }, error: (err: any) => {
          // this.util.showLoading();
          this.util.presentToast('Error Detected');
          console.log('SignupFailed', err);
        }, complete: () => {
          this.isSubmitting = false; // Hide spinner when request completes
        }
      });
    }
  }


  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  toggleShowConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password == confirmPassword ? null : { passwordNotMatch: true };
  }
}