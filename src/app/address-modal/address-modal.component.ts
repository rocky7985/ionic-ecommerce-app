import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { UtilService } from '../util.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-address-modal',
  templateUrl: './address-modal.component.html',
  styleUrls: ['./address-modal.component.scss'],
})
export class AddressModalComponent {

  @Input() addressList: any = [];
  @Input() selectedAddress: any = null;
  loginUser: any = [];
  isLoading = true;


  constructor(
    private modalController: ModalController,
    private util: UtilService,
    private router: Router,
  ) { }

  ionViewWillEnter() {
    this.getLoginUser();
    this.loadAddressData();
  }

  selectAddress(address: any) {
    this.selectedAddress = address;
  }

  confirmSelection() {
    this.modalController.dismiss({ selectedAddress: this.selectedAddress });
  }

  closeModal() {
    this.modalController.dismiss();
  }

  getLoginUser() {
    let user = JSON.parse(localStorage.getItem('login'))
    if (user != null) {
      this.loginUser = user;
      console.log('login:', this.loginUser);
    }
  }

  loadAddressData() {
    this.isLoading = true;
    const token = this.loginUser.token;
    const userId = this.loginUser.id;

    this.util.sendData('savedaddress', userId, token).subscribe({
      next: (p: any) => {
        if (p.status == 'success') {
          this.addressList = p.data;
          console.log('Updated Address Data:', this.addressList);
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        console.error('Failed to load addresses');
      }
    });
  }

  deleteAlert(addressid: any) {
    this.util.presentAlert(
      'Delete Address',
      'Are you sure you want to delete the address?',
      [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: () => {
            this.delete(addressid)
          },
        },
      ]
    );
  }

  delete(address: any) {

    const data = {
      user_id: this.loginUser.id,
      id: address.id
    };

    this.isLoading = true;  // Start loading spinner
    const token = this.loginUser.token;
    this.util.sendData('delete_address', data, token).subscribe({
      next: (p: any) => {
        if (p.status == 'success') {
          console.log('Deleted response:', p.message);
          this.addressList = this.addressList.filter((item: any) => item.id !== address.id); // Remove the deleted address and update the address list
          this.isLoading = false;  // Hide loading spinner
        } else {
          console.error('Failed to delete address:', p.message);
          this.isLoading = false;  // Hide loading spinner
        }
      },
      error: (err: any) => {
        console.error('Error occurred while deleting address:', err);
        this.isLoading = false;  // Hide loading spinner
      }
    });
  }

  updateAndNavigate(event: Event, item: any) {
    event.stopPropagation();
    console.log('Item to update:', item);
    this.modalController.dismiss();
    setTimeout(() => {
      this.router.navigate(['/update-address'], {
        queryParams: { id: item.id },
      });
    }, 100);
  }

  goto() {
    this.modalController.dismiss();
    setTimeout(() => {
      this.router.navigate(["/add-address"]);
    }, 100);
  }
}
