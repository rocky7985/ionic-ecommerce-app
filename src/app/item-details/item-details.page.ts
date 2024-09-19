import { Component, OnInit } from '@angular/core';
import { Animation, AnimationController } from '@ionic/angular';
import { UtilService } from '../util.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-item-details',
  templateUrl: './item-details.page.html',
  styleUrls: ['./item-details.page.scss'],
})
export class ItemDetailsPage implements OnInit {
  selectedSize: any;
  selectedColor: any;
  activeVariation: string;
  itemId: number;
  itemDetails: any;
  availableSizes = ['S', 'M', 'L', 'XL'];
  loginUser: any = [];
  isAddedtoCart = false;
  dataLoaded: boolean = false;  // Track if the data has been loaded


  constructor(
    private animatioCntrl: AnimationController,
    private util: UtilService,
    private route: ActivatedRoute,
    private router: Router,

  ) { }

  ionViewWillEnter() {
    this.util.showLoading();
    this.getLoginUser();
    this.getpost();

  }

  ngOnInit() {
    this.activeVariation = 'size';
    this.itemId = +this.route.snapshot.paramMap.get('id'); // Get the item ID from the route
    // this.getpost();
  }


  getLoginUser() {
    let user = JSON.parse(localStorage.getItem('login'))
    if (user != null) {
      this.loginUser = user;
    }
  }

  getpost() {
    const login = JSON.parse(localStorage.getItem('login'));
    const logindata = login.token;
    this.util.sendData('getShopData', { post_id: this.itemId }, logindata).subscribe({
      next: (res: any) => {
        if (res.status == 'success') {
          this.itemDetails = res.data.find((i: any) => i.Id == this.itemId);
          console.log('specific post', this.itemDetails);
        }
      }, error: (err: any) => {
        console.log('Error', err);
      }, complete: () => {
        this.dataLoaded = true; // Set dataLoaded to true when data is fully loaded
        this.checkIfItemInCart();
        this.util.hideLoader(); // Hide the loader when data is loaded
      }
    });
  }

  checkIfItemInCart() {
    const login = JSON.parse(localStorage.getItem('login'));
    const logindata = login.token;

    const data = {
      post_id: this.itemId,
      user_id: this.loginUser.id,
    };

    this.util.sendData('checkItemInCart', data, logindata).subscribe({
      next: (res: any) => {
        // if (res.status == 'success') {
        this.isAddedtoCart = res.data;
        // }
        // else{
        //   this.isAddedtoCart = false;
        // }
      },
      error: (err: any) => {
        console.log('Error', err);
      }
    });
  }

  segmentChanged(e: any) {
    this.activeVariation = e.detail.value;

    if (this.activeVariation == 'color') {
      this.animatioCntrl.create()
        .addElement(document.querySelector('.sizes'))
        .duration(500)
        .iterations(1)
        .fromTo('transform', 'translateX(0px)', 'translateX(100%)')
        .fromTo('opacity', '1', '0.2')
        .play();

      this.animatioCntrl.create()
        .addElement(document.querySelector('.colors'))
        .duration(500)
        .iterations(1)
        .fromTo('transform', 'translateX(-100%)', 'translateX(0)')
        .fromTo('opacity', '0.2', '1')
        .play();
    } else {
      this.animatioCntrl.create()
        .addElement(document.querySelector('.sizes'))
        .duration(500)
        .iterations(1)
        .fromTo('transform', 'translateX(100%)', 'translateX(0)')
        .fromTo('opacity', '0.2', '1')
        .play();

      this.animatioCntrl.create()
        .addElement(document.querySelector('.colors'))
        .duration(500)
        .iterations(1)
        .fromTo('transform', 'translateX(0px)', 'translateX(-100%)')
        .fromTo('opacity', '1', '0.2')
        .play();
    }
  }

  changeSize(size: any) {
    if (this.isSizeAvailable(size)) {
      this.selectedSize = size;
    }
  }

  changeColor(color: any) {
    this.selectedColor = color;
  }

  isSizeAvailable(size: any) {
    return this.itemDetails && this.itemDetails.size.includes(size);
    // return this.itemDetails && this.itemDetails.size && this.itemDetails.size.includes(size);

  }

  addtocart() {
    const login = JSON.parse(localStorage.getItem('login'));
    const logindata = login.token;
    if (this.selectedSize && this.selectedColor) {
      const data = {
        post_id: this.itemId,
        size: this.selectedSize,
        color: this.selectedColor
      };

      console.log('data', data);

      this.util.sendData('addcartData', data, logindata).subscribe({
        next: (res: any) => {
          if (res.status == 'success') {
            console.log('cartitem', res);
            this.isAddedtoCart = true;
          }
          // else{
          //   this.isAddedtoCart = false;

          // }
        }, error: (err: any) => {
          console.log('Error', err);
        }
      });
    }
    else {
      this.util.presentToast('Please select both size and color');

    }
  }

  goToCart() {
    this.router.navigate(['/my-cart']); // Redirect to cart page
  }

  buy() {
    if (this.selectedColor && this.selectedSize) {
      this.router.navigate(["/checkout"], {
        queryParams: {
          selected: 'buynow',
          itemId: this.itemId,
          size: this.selectedSize,
          color: this.selectedColor
        }
      });
    }
    else {
      console.log("Please select both size and color");
    }
  }

}


