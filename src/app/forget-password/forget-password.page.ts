import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { UtilService } from '../util.service';
import { Router } from '@angular/router'; // Import Router

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.page.html',
  styleUrls: ['./forget-password.page.scss'],
})
export class ForgetPasswordPage {

  email: string = '';
  loadOTP: boolean = false;
  otp: string = '';
  showOtpInput: boolean = false;
  verifyingOtp: boolean = false;
  data: any = [];



  constructor(
    private util: UtilService,
    private navCtrl: NavController,
    private router: Router // Inject Router
  ) { }

  ionViewWillEnter() {
    this.email = '';
    this.loadOTP = false;
    this.otp = '';
    this.showOtpInput = false;
    this.verifyingOtp = false;
  }

  checkEmail() {

    if (this.email == '') {
      this.util.presentToast('Email is required.');
      return;
    }

    // const email = this.email
    const emaildata = { user_email: this.email };

    this.loadOTP = true;

    this.util.post('forgetPassword', emaildata).subscribe({
      next: (response: any) => {

        if (response.status == 'success') {
          this.loadOTP = false;
          this.showOtpInput = true;  // Show OTP input
          this.util.presentToast('OTP sent successfully.');
          this.data = response.data;
          console.log('Data:', this.data);
        }
        else {
          this.util.presentToast(response.message || 'Failed to send OTP. Try Again.');
        }
      }, error: (err: any) => {
        console.error('Error occurred:', err);
        this.util.presentToast('An error occurred while sending OTP. Try again.');
      }
    });
  }

  verifyOtp() {
    if (this.otp == '') {
      this.util.presentToast('OTP is required.');
      return;
    }
    this.verifyingOtp = true;

    const data = {
      user_id: this.data.user_id,  // Assuming user_id is represented by the email for now
      otp: this.otp
    };

    this.util.post('verifyOtp', data).subscribe({
      next: (response: any) => {

        // this.verifyingOtp = false;  // Hide the spinner on response

        if (response.status == 'success') {
          this.util.presentToast('OTP verified successfully.');
          this.verifyingOtp = false;  // Hide the spinner on response
          // Redirect to reset password or another page
          this.router.navigate(['/resetpassword'], { queryParams: { user_id: this.data.user_id } });
        } else {
          this.util.presentToast(response.message || 'Invalid OTP. Please try again.');
        }
      },
      error: (err: any) => {
        this.verifyingOtp = false;
        console.error('Error occurred:', err);
        this.util.presentToast('An error occurred while verifying OTP. Try again.');
      }
    });
  }
}

