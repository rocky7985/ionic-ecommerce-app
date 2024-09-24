import { Component } from '@angular/core';
import { UtilService } from '../util.service';
import { Router } from '@angular/router'; // Import Router
import { ModalController } from '@ionic/angular'; // Import ModalController
import { AddressModalComponent } from '../address-modal/address-modal.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
})
export class CheckoutPage {

  checkoutItems: any[] = [];
  totalPrice: number = 0; // Add totalPrice
  loginUser: any = [];
  public loadCheckoutData = true;
  addressData: any = [];
  selectedAddress: any = null;

  constructor(
    private util: UtilService,
    private router: Router,
    private modalController: ModalController,
    private route: ActivatedRoute
  ) { }

  ionViewWillEnter() {
    this.getLoginUser();
    this.savedAddress();

    this.route.queryParams.subscribe((params: any) => {
      const selected = params['selected'];

      if (selected == 'buynow') {

        const itemId = params['itemId'];
        const size = params['size'];
        const color = params['color'];
        if (itemId && size && color) {
          this.addItemToCheckout(itemId, size, color);
        }
        else {
          this.util.presentToast('Missing item data for Buy Now');
          console.log('Missing Item data');
        }
      }
      else if (selected == 'checkout') {
        this.getcheckoutData();
      }
    });
  }

  addItemToCheckout(itemId: number, size: string, color: string) {
    const token = this.loginUser.token;
    const data = {
      post_id: itemId,
      size: size,
      color: color,
      quantity: 1
    };
    console.log('d:', data);
    this.util.sendData('doCheckout', data, token).subscribe({
      next: (p: any) => {
        if (p.status = "success") {
          const item = p.data.cart_items[0]; // Assuming only one item is returned for Buy Now
          // const itemPrice = Number(item.price);
          // const itemTotalPrice = Number(item.item_total_price);

          // if (!isNaN(itemPrice) && !isNaN(itemTotalPrice)) {
            this.checkoutItems = [item],
              // price: itemPrice,
            // }];
            this.totalPrice = item.item_total_price;
          } else {
            // console.error('Invalid price data for the item:', item);
            this.util.presentToast('Invalid price data for the selected item');
            this.totalPrice = 0; // Set totalPrice to 0 in case of invalid data
          }
          this.loadCheckoutData = false;
          console.log('Buynow:', this.checkoutItems);
        // }
      }, error: (err: any) => {
        console.log('Problem Occurred. Try Again', err);
        this.loadCheckoutData = false;
      }
    });
  }

  getLoginUser() {
    let user = JSON.parse(localStorage.getItem('login'))
    if (user != null) {
      this.loginUser = user;
    }
  }

  getcheckoutData() {

    const login = JSON.parse(localStorage.getItem('login'));
    const logindata = login.token;
    this.util.sendData('doCheckout', {}, logindata).subscribe({
      next: (p: any) => {
        if (p.status == 'success') {
          console.log('p.data', p.data);
          this.checkoutItems = p.data.cart_items.map((item: any) => ({
            ...item,
            unitPrice: item.price,// Calculate and store the price per unit
          }));
          this.totalPrice = p.data.totalPrice;
          console.log('CheckoutItems', this.checkoutItems);
          console.log('Total Price:', this.totalPrice);
        }
        this.loadCheckoutData = false;  // Turn off loading spinner
      }, error: () => {
        this.loadCheckoutData = false;  // Turn off loading spinner on error
      }
    });

  }

  updateTotalPrice() {
    this.totalPrice = this.checkoutItems.reduce((acc, item) => acc + item.item_total_price, 0);
  }

  // deleteCartItem(itemId: number) {
  //   const login = JSON.parse(localStorage.getItem('login'));
  //   const logindata = login.token;

  //   const index = this.checkoutItems.findIndex(item => item.Id === itemId);

  //   if (index !== -1) {
  //     this.checkoutItems[index].isLoading = true;

  //     // Call the API to delete the item from the cart
  //     this.util.sendData('deleteCartItem', { post_id: itemId }, logindata).subscribe({
  //       next: (response: any) => {
  //         if (response.status === 'success') {
  //           this.checkoutItems.splice(index, 1); // Remove the item from the array
  //           this.updateTotalPrice(); // Recalculate the total price
  //         }
  //         else {
  //           console.log('Failed to delete item:', response.message);

  //         }
  //         this.checkoutItems[index].isLoading = false;

  //       },
  //       error: (err: any) => {
  //         console.log('Error', err);
  //         this.checkoutItems[index].isLoading = false;

  //       }
  //     });
  //   }
  // }



  increaseQuantity(itemId: number, index: number) {
    const login = JSON.parse(localStorage.getItem('login'));
    const logindata = login.token;

    this.checkoutItems[index].isLoading = true;

    // Prepare the data to be sent to the API
    const requestData = {
      post_id: itemId,
      quantity: 1,
      size: this.checkoutItems[index].size,
      color: this.checkoutItems[index].color
    };

    this.util.sendData('addcartData', requestData, logindata).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.checkoutItems[index].quantity++;

          console.log('unitPrice', this.checkoutItems[index].price);
          console.log('quantity', this.checkoutItems[index].quantity);
          console.log('TotalPrice:', this.totalPrice);

          this.checkoutItems[index].item_total_price = this.checkoutItems[index].price * this.checkoutItems[index].quantity;
          this.totalPrice += Number(this.checkoutItems[index].price);

          console.log('Updated quantity:', this.checkoutItems[index].quantity);
          console.log('Updated price:', this.checkoutItems[index].item_total_price);
          console.log('Updated totalPrice:', this.totalPrice);

        }
        this.checkoutItems[index].isLoading = false;
      },
      error: () => {
        this.checkoutItems[index].isLoading = false;
      }
    });
  }

  decreaseQuantity(itemId: number, index: number) {
    if (this.checkoutItems[index].quantity > 1) {
      const login = JSON.parse(localStorage.getItem('login'));
      const logindata = login.token;

      this.checkoutItems[index].isLoading = true;


      const requestData = {
        post_id: itemId,
        quantity: -1,
        size: this.checkoutItems[index].size,
        color: this.checkoutItems[index].color
      };

      this.util.sendData('addcartData', requestData, logindata).subscribe({
        next: (response: any) => {
          if (response.status === 'success') {
            this.checkoutItems[index].quantity--;

            console.log('unitPrice', this.checkoutItems[index].price);
            console.log('quantity', this.checkoutItems[index].quantity);

            this.checkoutItems[index].item_total_price = this.checkoutItems[index].price * this.checkoutItems[index].quantity;
            this.totalPrice -= Number(this.checkoutItems[index].price);

            console.log('Updated quantity:', this.checkoutItems[index].quantity);
            console.log('Updated price:', this.checkoutItems[index].item_total_price);
            console.log('Updated totalPrice:', this.totalPrice);

          }
          this.checkoutItems[index].isLoading = false;
        },
        error: () => {
          this.checkoutItems[index].isLoading = false;
        }
      });
    }
  }

  savedAddress() {
    const token = this.loginUser.token;
    const userId = this.loginUser.id;
    this.util.sendData('savedaddress', userId, token).subscribe({
      next: (p: any) => {
        if (p.status == 'success') {
          this.addressData = p.data;
          console.log('p.data', this.addressData);
        }
      }
    });
  }

  // toggleCardSelection(card: any) {
  //   this.selectedAddress = this.selectedAddress == card ? null : card;
  //   console.log('Selected Card:', this.selectedAddress);
  // }

  async openAddressModal() {
    const modal = await this.modalController.create({
      component: AddressModalComponent,
      cssClass: 'address-modal',
      componentProps: {
        addressList: this.addressData,
        selectedAddress: this.selectedAddress
      },
      backdropDismiss: true,
    });

    modal.onDidDismiss().then((result: any) => {
      if (result && result.data) {
        this.selectedAddress = result.data.selectedAddress;
      }
    });

    await modal.present();
  }

  selectAddressModal() {
    this.openAddressModal();
  }

  buy() {
    if (this.selectedAddress) {
      const productIds = this.checkoutItems.map((item:any) => item.Id);
      const sizes = this.checkoutItems.map((item:any) => item.size || 'NA');
      const colors = this.checkoutItems.map((item:any) => item.color || 'NA');
      const quantity = this.checkoutItems.map((item:any) => item.quantity);

      this.router.navigate(["/savedcards"], {
        queryParams: {
          selectedAddressId: this.selectedAddress.id,
          totalPrice: this.totalPrice, 
          productIds: productIds.join(','),
          sizes: sizes.join(','),
          colors: colors.join(','),
          quantity: quantity.join(',')
        }
      });
    } else {
      console.log('No Address Selected');
    }
  }
}
