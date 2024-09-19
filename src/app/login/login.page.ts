import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { UtilService } from '../util.service';
import { FormGroup, Validators, FormControl } from '@angular/forms';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {

  loginForm: FormGroup;
  showPassword = false;
  public loadLoginData = true;
  public loadProfileData = false; // Add this line


  constructor(
    private util: UtilService,
    private navCtrl: NavController,
  ) {

    this.loginForm = new FormGroup({
      email: new FormControl('', Validators.compose([Validators.required, Validators.email])),
      password: new FormControl('', Validators.compose([Validators.required,])),
      rememberMe: new FormControl(false),

    })
  }

  ionViewWillEnter() {
    this.rememberMe();
    this.loadProfileData = false;
  }

  login() {
    // this.util.showLoading();
    this.loadProfileData = true; // Show spinner when login starts

    const loginData = {
      username: this.loginForm.value.email,
      password: this.loginForm.value.password,
    };

    this.util.loginUrl(loginData).subscribe({
      next: (response: any) => {

        if (response.status == 'success') {

          this.util.presentToast('Success');
          console.log('response', response);
          localStorage.setItem('login', JSON.stringify(response.data));
          if (this.loginForm.value.rememberMe) {
            localStorage.setItem('remember', JSON.stringify(this.loginForm.value));
          }else {
            localStorage.removeItem('remember');
          }
          this.loginForm.reset();
          this.util.setMenuState(true);
          this.navCtrl.navigateRoot('/home', { animationDirection: 'forward' });
        }
        },          
      
        error:(error: any) => {
          console.log('LoginFailed', error);
          this.util.presentToast('Login Failed');
        }, complete: () => {
          this.loadProfileData = false; // Hide spinner when login completes
        }
        // this.loadLoginData=false;
    
    });
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  rememberMe() {
    const rememberUser = JSON.parse(localStorage.getItem('remember') || '[]');
    if (rememberUser) {
      this.loginForm.patchValue({
        email: rememberUser.email,
        password: rememberUser.password,
        rememberMe: true,
      });
    }
  }

}
// // {
//   email: this.loginForm.value.email,
//   password: this.loginForm.value.password
// }