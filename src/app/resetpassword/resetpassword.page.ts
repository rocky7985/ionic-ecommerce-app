import { Component } from '@angular/core';
import { UtilService } from '../util.service';
import { Router, ActivatedRoute } from '@angular/router'; // Import Router

@Component({
  selector: 'app-resetpassword',
  templateUrl: './resetpassword.page.html',
  styleUrls: ['./resetpassword.page.scss'],
})
export class ResetpasswordPage {

  userid: string = '';
  password: string = '';
  confirmNewPassword: string = '';
  public reset: boolean = false;
  showPassword: boolean = false;
  confirmPassword : boolean = false;

  data: any = [];

  constructor(
    private util: UtilService,
    private router: Router, // Inject Router
    private route: ActivatedRoute // To retrieve user_id passed from the OTP page
  ) { }

  ionViewWillEnter() {
    this.route.queryParams.subscribe(params => {
      this.userid = params['user_id'];
    });
  }

  resetpassword() {
    if (this.password == '' || this.confirmNewPassword == '') {
      this.util.presentToast('Password and Confirm Password is Required.');
      return;
    }
    else {
      this.reset = true;
      const data = {
        user_id: this.userid,
        new_password: this.password,
        confirm_new_password: this.confirmNewPassword
      }

      this.util.post('resetPassword', data).subscribe({
        next: (response: any) => {
          if (response.status == 'success') {
            this.reset = false;
            this.util.presentToast('Password reset successfully.');
            this.data = response.data;
            console.log('Data:', this.data);
            this.router.navigate(['/login']);
          }
          else {
            this.util.presentToast('An Error Occurred. Please try Again.');
          }
        },
        error: (err: any) => {
          this.reset = false;
          console.error('Error occurred:', err);
          this.util.presentToast('An error occurred while resetting the password. Try again.');
        }
      });
    }
  }

   togglePassword(){
    this.showPassword = !this.showPassword;
   }

   toggleConfirmPassword(){
    this.confirmPassword = !this.confirmPassword;
   }

}
