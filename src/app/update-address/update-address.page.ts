import { Component } from '@angular/core';
import { UtilService } from '../util.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-update-address',
  templateUrl: './update-address.page.html',
  styleUrls: ['./update-address.page.scss'],
})
export class UpdateAddressPage {

  updateForm: FormGroup;
  loginUser: any = [];
  updatedData: any = [];
  public loadData = true;

  constructor(
    private util: UtilService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.updateForm = new FormGroup({
      address: new FormControl('', Validators.required),
      location: new FormControl('', Validators.required),
    });
  }

  ionViewWillEnter() {
    this.getLoginUser();
    this.getAddressData();
  }

  getLoginUser() {
    const user = JSON.parse(localStorage.getItem('login'));
    if (user !== null) {
      this.loginUser = user;
    }
  }

  getAddressData() {
    const addressId = this.route.snapshot.queryParamMap.get('id'); // Get address ID from query params
    const token = this.loginUser.token;
    if (addressId) {
      this.util.sendData('savedaddress', { id: addressId }, token).subscribe({
        next: (p: any) => {
          if (p.status == 'success') {
            const data = p.data;
            this.updateForm.patchValue({
              address: data.address,
              location: data.location,
            });
            console.log('Address Data:', data);
          }
          this.loadData = false;
        },
        error: () => {
          console.log('Error loading address');
          this.loadData = false;
        }
      });
    }
  }

  updatedAddress() {
    if (this.updateForm.valid) {
      this.loadData = true;
      const data = { ...this.updateForm.value, id: this.route.snapshot.queryParamMap.get('id') };
      const token = this.loginUser.token;
      this.util.sendData('update_address', data, token).subscribe({
        next: (p: any) => {
          if (p.status == 'success') {
            console.log('Updated Address Data:', p.data);
            this.util.presentToast('Address Updated');
            // this.router.navigate(['/checkout']);
          }
          this.loadData = false;
        }, error: () => {
          this.loadData = false;
          console.log('Failed to update data');
        }
      });
    }
    else {
      console.log('Error:', this.updateForm.invalid);
    }
  }
}



