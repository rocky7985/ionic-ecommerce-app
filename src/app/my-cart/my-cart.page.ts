import { Component } from '@angular/core';
import { UtilService } from '../util.service';
import { Router } from '@angular/router'; // Import Router



@Component({
  selector: 'app-my-cart',
  templateUrl: './my-cart.page.html',
  styleUrls: ['./my-cart.page.scss'],
})
export class MyCartPage {

  cartItems: any[] = [];
  loginUser: any = [];
  public loadCartData = true;
  isLoading: boolean = true;

  constructor(
    private util: UtilService,
    private router: Router // Inject Router

  ) { }

  ionViewWillEnter() {
    this.getLoginUser();
    this.getcartData();
  }

  getLoginUser() {
    let user = JSON.parse(localStorage.getItem('login'))
    if (user != null) {
      this.loginUser = user;
    }
  }
  getcartData() {
    const login = JSON.parse(localStorage.getItem('login'));
    const logindata = login.token;
    this.util.sendData('inCartData', {}, logindata).subscribe({
      next: (p: any) => {
        if (p.status == 'success') {
          this.cartItems = p.data.map((item: any) => ({
            ...item,
            unitPrice: item.price / item.quantity // Calculate and store the price per unit
          }));
          console.log('cartItems:', this.cartItems);
        }
        this.loadCartData = false;
      }, error: () => {
        this.loadCartData = false;
      }
    });
  }

  deleteAlert(itemId: number) {
    this.util.presentAlert(
      'Delete Item',
      'Are you sure you want to delete the item?',
      [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: () => {
            this.deleteCartItem(itemId);
          },
        },
      ]
    );
  }

  deleteCartItem(itemId: number) {
    const login = JSON.parse(localStorage.getItem('login'));
    const logindata = login.token;

    const index = this.cartItems.findIndex(item => item.Id == itemId);

    if (index !== -1) {
      this.cartItems[index].isLoading = true;

      // Call the API to delete the item from the cart
      this.util.sendData('deleteCartItem', { post_id: itemId }, logindata).subscribe({
        next: (response: any) => {
          if (response.status == 'success') {

            // Use slice to remove the item from the array
            this.cartItems = [
              ...this.cartItems.slice(0, index),
              ...this.cartItems.slice(index + 1)
            ];
          }
          else {
            console.log('Failed to delete item:', response.message);
            this.cartItems[index].isLoading = false;

          }
        },
        error: (err: any) => {
          console.log('Error', err);
          this.cartItems[index].isLoading = false;

        }
      });
    }

  }

  increaseQuantity(itemId: number, index: number) {
    const login = JSON.parse(localStorage.getItem('login'));
    const logindata = login.token;

    this.cartItems[index].isLoading = true;

    // Prepare the data to be sent to the API
    const requestData = {
      post_id: itemId,
      quantity: 1,
      size: this.cartItems[index].size,
      color: this.cartItems[index].color
    };

    this.util.sendData('addcartData', requestData, logindata).subscribe({
      next: (response: any) => {
        if (response.status === 'success') {
          this.cartItems[index].quantity++;
          this.cartItems[index].price = this.cartItems[index].unitPrice * this.cartItems[index].quantity;
          console.log('Updated quantity:', this.cartItems[index].quantity);
          console.log('Updated price:', this.cartItems[index].price);
        }
        this.cartItems[index].isLoading = false;
      },
      error: () => {
        this.cartItems[index].isLoading = false;
      }
    });
  }

  decreaseQuantity(itemId: number, index: number) {
    if (this.cartItems[index].quantity > 1) {
      const login = JSON.parse(localStorage.getItem('login'));
      const logindata = login.token;

      this.cartItems[index].isLoading = true;


      const requestData = {
        post_id: itemId,
        quantity: -1,
        size: this.cartItems[index].size,
        color: this.cartItems[index].color
      };

      this.util.sendData('addcartData', requestData, logindata).subscribe({
        next: (response: any) => {
          if (response.status === 'success') {
            this.cartItems[index].quantity--;
            this.cartItems[index].price = this.cartItems[index].unitPrice * this.cartItems[index].quantity;
            console.log('Updated quantity:', this.cartItems[index].quantity);
            console.log('Updated price:', this.cartItems[index].price);
          }
          this.cartItems[index].isLoading = false;
        },
        error: () => {
          this.cartItems[index].isLoading = false;
        }
      });
    }
  }

  goToCheckout() {
    this.router.navigate(["/checkout"], {
      queryParams: {
        selected: 'checkout'
      }
    });
  }
}