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
  isLoading: boolean = false;
  public loadWishlistData = true;
  wishlistData: any = [];
  selectedSegment: string = 'cart';

  constructor(
    private util: UtilService,
    private router: Router
  ) { }

  ionViewWillEnter() {
    this.getLoginUser();
    this.getcartData();
    this.getWishlist();
  }

  getLoginUser() {
    let user = JSON.parse(localStorage.getItem('login'))
    if (user != null) {
      this.loginUser = user;
    }
  }

  // Method to handle segment change
  segmentChanged(event: any) {
    const selectedValue = event.detail.value;
    if (selectedValue === 'cart') {
      this.getcartData();
    } else if (selectedValue === 'wishlist') {
      this.getWishlist();
    }
  }

  getcartData() {
    const login = JSON.parse(localStorage.getItem('login'));
    const logindata = login.token;
    this.loadCartData = true;
    this.util.sendData('inCartData', {}, logindata).subscribe({
      next: (p: any) => {
        if (p.status == 'success') {
          this.cartItems = p.data.map((item: any) => ({
            ...item,
            unitPrice: item.price / item.quantity, // Calculate and store the price per unit
            isAddedToWishlist: false,
            isLoading: false
          }));
          console.log('cartItems:', this.cartItems);
        }
        this.loadCartData = false;
      }, error: () => {
        this.loadCartData = false;
      }
    });
  }

  addToWishlist(item: any, event: Event) {
    event.stopPropagation();
    this.isLoading = true;
    const token = this.loginUser.token;
    const data = {
      user_id: this.loginUser.id,
      post_id: item.Id,
      color: item.color,
      size: item.size,
      quantity: item.quantity
    }
    console.log('Data:', data);
    this.util.sendData('wishlist', data, token).subscribe({
      next: (p: any) => {
        if (p.status == 'success') {
          // Remove the item from the cart after it's added to the wishlist
          const index = this.cartItems.findIndex(cartItem => cartItem.Id == item.Id);
          if (index !== -1) {
            this.cartItems.splice(index, 1);
          }
          this.getWishlist();
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.log('Error adding to wishlist:', err);
        this.isLoading = false;
      }
    });
  }

  getWishlist() {
    // const token = this.loginUser.token;
    const data = { user_id: this.loginUser.id };
    this.loadWishlistData = true;
    this.util.sendData('getWishlist', data, this.loginUser.token).subscribe({
      next: (p: any) => {
        if (p.status == 'success' && p.data) {
          this.wishlistData = p.data;
          console.log('WishlistData:', this.wishlistData);
        } else {
          this.wishlistData = [];
        }
        this.loadWishlistData = false;
      }, error: () => {
        console.error('Error fetching wishlist data');
        this.loadWishlistData = false;
      }
    });
  }

  moveToCart(item: any, event: Event) {
    event.stopPropagation();
    const token = this.loginUser.token;
    const data = {
      user_id: this.loginUser.id,
      post_id: item.post_id,
      color: item.color,
      size: item.size,
      quantity: item.quantity
    }
    console.log('Data:', data);
    this.util.sendData('move_to_cart', data, token).subscribe({
      next: (p: any) => {
        if (p.status == 'success') {
          // Remove the item from the cart after it's added to the wishlist
          const index = this.wishlistData.findIndex((wishlist: any) => wishlist.Id == item.Id);
          if (index !== -1) {
            this.wishlistData.splice(index, 1);
          }
          this.getcartData();
        }
        // this.isLoading = false;
      },
      error: (err) => {
        console.log('Error adding to wishlist:', err);
        // this.isLoading = false;
      }
    });
  }

  deleteWishlistAlert(item: any, event: Event) {
    event.stopPropagation();
    this.util.presentAlert(
      'Delete Item',
      'Are you sure you want to delete the item from wishlist?',
      [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: () => {
            this.removeWishlist(item);
          },
        },
      ]
    );
  }

  removeWishlist(item: any) {
    const token = this.loginUser.token;
    const data = {
      user_id: this.loginUser.id,
      post_id: item.post_id,
      color: item.color,
      size: item.size,
      quantity: item.quantity
    }
    console.log('Data:', data);
    this.util.sendData('delete_wishlist', data, token).subscribe({
      next: (p: any) => {
        if (p.status == 'success') {
          // Remove the item from the cart after it's added to the wishlist
          const index = this.wishlistData.findIndex((wishlist: any) => wishlist.post_id == item.Id);
          if (index !== -1) {
            this.wishlistData.splice(index, 1);
          }
          console.log('Item deleted from wishlist');
          this.getWishlist();
        }
      },
      error: (err) => {
        console.log('Error deleting wishlist:', err);
      }
    });
  }

  deleteAlert(itemId: number, event: Event) {
    event.stopPropagation();
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
            // this.cartItems = [
            //   ...this.cartItems.slice(0, index),
            //   ...this.cartItems.slice(index + 1)
            // ];
            this.cartItems.splice(index, 1); // Remove the item from the cart
            this.cartItems[index].isLoading = false;
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

  navigateToItemDetails(id: number) {
    this.router.navigate(['/item-details', id]);
  }

}