import { Component } from '@angular/core';
import { UtilService } from '../util.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.page.html',
  styleUrls: ['./confirm.page.scss'],
})
export class ConfirmPage {

  addcard: FormGroup;
  loginUser: any = [];
  cardData: any = [];

  public loadProfileData = true;

  constructor(private util: UtilService) {
    this.addcard = new FormGroup({
      cardnumber: new FormControl('', [Validators.required, Validators.pattern(/^(\d{4} ?){3}\d{4}$/)]),
      expiryDate: new FormControl('', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]),
      cvv: new FormControl('', [Validators.required, Validators.pattern(/^\d{3}$/)]),
      cardname: new FormControl('', Validators.required),

    });
  }

  ionViewWillEnter() {
    this.getLoginUser();
    // this.saveCardData();
  }

  getLoginUser() {
    let user = JSON.parse(localStorage.getItem('login'))
    if (user != null) {
      this.loginUser = user;
    }
  }

  formatCardNumber(event: any) {
    let input = event.target.value.replace(/\D/g, '').substring(0, 16); // Remove non-digits and limit to 16 digits
    if (input.length > 0) {
      input = input.match(/.{1,4}/g)?.join(' ') || ''; // Add space every 4 digits
    }
    this.addcard.controls['cardnumber'].setValue(input);
  }

  formatExpiryDate(event: any) {
    let input = event.target.value.replace(/\D/g, '').substring(0, 4); // Remove non-digits and limit to 6 digits
    if (input.length >= 2) {
      input = input.substring(0, 2) + '/' + input.substring(2,4); // Add slash after MM
    }
    this.addcard.controls['expiryDate'].setValue(input);
  }

  saveCardData() {
    if (this.addcard.valid) {

      this.loadProfileData = true; // Start spinner
      const token = this.loginUser.token;
      const userId = this.loginUser.id; // Ensure you have user_id

      const usercardData = {
        user_id: userId,
        card_num: this.addcard.get('cardnumber')?.value.replace(/\s+/g, ''), // Remove spaces before sending
        exp_date: this.addcard.get('expiryDate')?.value,
        cvv: this.addcard.get('cvv')?.value,
        card_name: this.addcard.get('cardname')?.value,

      };
      this.util.sendData('addcard', usercardData, token).subscribe({
        next: (p: any) => {
          if (p.status == 'success') {
            this.cardData = p.data;
            this.util.presentToast('Card Added Successfully');
            console.log('Usercard Data:', this.cardData);
            this.addcard.reset(); // Reset the form after successful submission
          } else {
            this.util.presentToast(p.message || 'Failed to add card details');
          }
          this.loadProfileData = false;

        },
        error: () => {
          this.loadProfileData = false;
          this.util.presentToast('An error occurred. Please try again.');
        }
      });
    }
    else {
      console.log('Error:', this.addcard.invalid);

    }
  }
}