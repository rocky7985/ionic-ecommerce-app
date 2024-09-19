import { Component } from '@angular/core';
import { UtilService } from '../util.service';
import { Router } from '@angular/router'; // Import Router

@Component({
  selector: 'app-my-orders',
  templateUrl: './my-orders.page.html',
  styleUrls: ['./my-orders.page.scss'],
})
export class MyOrdersPage {

  orderdata: any = [];
  loginUser: any = [];
  loadOrders: boolean = true;
  noOrders: boolean = false; // Add this property

  constructor(private util: UtilService, private router: Router) { }

  ionViewWillEnter() {
    this.getLoginUser();
    this.orders();
  }
  getLoginUser() {
    let user = JSON.parse(localStorage.getItem('login'))
    if (user != null) {
      this.loginUser = user;
    }
  }
  orders() {
    const token = this.loginUser.token;
    this.util.sendData('orders', {}, token).subscribe({
      next: (p: any) => {
        this.loadOrders = false;  // Turn off loading spinner
        if (p.status == 'success' && p.data && Array.isArray(p.data.ordered_post_details)) {
          this.orderdata = p.data.ordered_post_details;
          this.noOrders = this.orderdata.length == 0;
          console.log('Order Data:', this.orderdata);
        }
        else {
          console.log(' Problem Caused. Try Again.');
          this.noOrders = true;  // Show "No Orders" in case of error         
        }
      },
      error: () => {
        this.loadOrders = false;  // Turn off loading spinner
        this.noOrders = true;     // Show "No Orders" in case of error
        console.log('An error occurred. Try Again.');
      }
    });
  }

  navigateToItemDetails(id: number) {
    this.router.navigate(['/item-details', id]);
  }

}
