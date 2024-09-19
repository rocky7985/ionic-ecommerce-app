import { Component } from '@angular/core';
import { UtilService } from '../util.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-address',
  templateUrl: './add-address.page.html',
  styleUrls: ['./add-address.page.scss'],
})
export class AddAddressPage {
  addaddress: FormGroup;
  loginUser: any = [];
  addressData: any = [];
  public loadData = true;
  public submittingAddress = false;  // Indicates form submission state

  constructor(private util: UtilService) {
    this.addaddress = new FormGroup({
      address: new FormControl('', Validators.required),
      location: new FormControl('', Validators.required)
    });
  }

  ionViewWillEnter() {
    this.getloginUser();
    setTimeout(() => {
      this.loadData = false; // Stop showing the spinner once the data is loaded
    }, 1000); // Simulated loading time
  }

  getloginUser() {
    let login = JSON.parse(localStorage.getItem('login'));
    if (login != null) {
      this.loginUser = login;
    }
  }


  setLocation(location: string) {
    this.addaddress.get('location')?.setValue(location);
  }

  address() {
    if (this.addaddress.valid) {

      this.submittingAddress = true;
      const token = this.loginUser.token;
      const userid = this.loginUser.id;

      const addressDetails = {
        user_id: userid,
        address: this.addaddress.get('address')?.value,
        location: this.addaddress.get('location')?.value,
      };

      this.util.sendData('addaddress', addressDetails, token).subscribe({
        next: (p: any) => {
          if (p.status = 'success') {
            this.addressData = p.data;
            this.util.presentToast('Address added successfully');
            console.log('Address Added:', this.addressData);
            this.addaddress.reset();
          } else {
            this.util.presentToast(p.message || 'Failed to add address');
          }
          this.submittingAddress = false;
        }, error: () => {
          this.submittingAddress = false;
          console.log('An Error Occurred. Please try again later');
        }
      });
    }
    else {
      console.log('Error', this.addaddress.invalid);
    }
  }
}
