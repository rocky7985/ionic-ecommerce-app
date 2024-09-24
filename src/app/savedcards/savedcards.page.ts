import { Component } from '@angular/core';
import { UtilService } from '../util.service';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-savedcards',
  templateUrl: './savedcards.page.html',
  styleUrls: ['./savedcards.page.scss'],
})
export class SavedcardsPage {
  loginUser: any = [];
  cardData: any = [];
  selectedCards: any = null;
  productIds: number[] = []; // Array for product IDs
  color: any[] = [];
  size: any[] = [];
  quantity:any[] = [];
  totaprice: any = 0;
  public loadCheckoutData = true;
  selectedAddressId: number;
  selectedAddress: any = [];

  constructor(
    private util: UtilService,
    private router: Router,
    private alertController: AlertController,
    private activatedRoute: ActivatedRoute
  ) { }

  ionViewWillEnter() {
    this.getLoginUser();
    this.usercarddata();

    this.activatedRoute.queryParams.subscribe((params: any) => {
      if (params['selectedAddressId']) {
        this.selectedAddressId = params['selectedAddressId'];
        this.fetchSelectedAddress(this.selectedAddressId);
      }
      if (params['totalPrice']) {
        this.totaprice = params['totalPrice']; // Retrieve the totalPrice
      }
      if (params['productIds']) {
        this.productIds = params['productIds'].split(',').map((id: any) => parseInt(id, 10));
      }
      if (params['quantity']) {
        this.quantity = params['quantity'].split(',').map((id: any) => parseInt(id, 10));
      }
      if (params['sizes']) {
        this.size = params['sizes'].split(',');
      }
      if (params['colors']) {
        this.color = params['colors'].split(',');
      }
      console.log('Selected Address ID:', this.selectedAddressId);
      console.log('Total Price:', this.totaprice); // Log the totalPrice for debugging
      console.log('Product IDs:', this.productIds);
      console.log('Product quantity:', this.quantity);
      console.log('Product Colors:', this.color);
      console.log('Product Size:', this.size);
    });
  }

  fetchSelectedAddress(addressId: number) {
    const token = this.loginUser.token;
    this.util.sendData('savedaddress', { id: addressId, user_id: this.loginUser.id }, token).subscribe({
      next: (p: any) => {
        if (p.status == 'success') {
          this.selectedAddress = p.data;
          console.log('Selected Address:', this.selectedAddress);
        } else {
          console.log('Error fetching address:', p.message);
        }
      }
    });
  }

  getLoginUser() {
    let user = JSON.parse(localStorage.getItem('login'))
    if (user != null) {
      this.loginUser = user;
    }
  }

  usercarddata() {
    this.cardData = [];
    const token = this.loginUser.token;
    this.util.sendData('savedcards', {}, token).subscribe({
      next: (p: any) => {
        if (p.status == 'success') {
          this.cardData = p.data;
          console.log('Usercard Data:', this.cardData);
          this.loadCheckoutData = false;  // Turn off loading spinner
        }
        else {
          console.log('An error occurred. Try Again.')
          this.loadCheckoutData = false;  // Turn off loading spinner
        }
      }
    });

  }

  toggleCardSelection(card: any) {
    this.selectedCards = this.selectedCards == card ? null : card;
    console.log('Selected Card:', this.selectedCards);

    // console.log('card', this.selectcard)
    // if(this.selectcard) {
    //   this.selectedCards = card;
    // } else {
    //   this.selectedCards = '';
    // }
  }

  payout() {
    if (!this.selectedCards) {
      console.log('No cards selected for payout.');
      return; // Early return if no cards are selected
    }

    if (!this.selectedAddressId) {
      console.log('No address selected for payout.');
      return;
    }

    const token = this.loginUser.token;

    const payload = {
      user_id: this.loginUser.user_id,
      card_id: this.selectedCards.card_num,
      post_ids: this.productIds,
      address_id: this.selectedAddressId,
      color: this.color,
      size: this.size,
      quantity:this.quantity
    };

    this.util.sendData('payout', payload, token).subscribe({
      next: (response: any) => {
        if (response.status == 'success') {
          console.log('Payout Successful:', response.data);
          this.loadCheckoutData = false;  // Turn off loading spinner
          this.router.navigate(["/payment-success"]);
        } else {
          console.log('Payout Failed:', response.message);
          this.loadCheckoutData = false;  // Turn off loading spinner
        }
      },
      error: (err: any) => {
        console.log('Payout Error:', err);
        this.loadCheckoutData = false;  // Turn off loading spinner
      }
    });
  }
  navigateToAddCard() {
    this.router.navigate(['/confirm']);
  }

  updateAndNavigate(event: Event, item: any) {
    event.preventDefault();
    console.log('Item to update:', item);
    this.router.navigate(['/updatecardinfo'], {
      queryParams: { card_id: item.id },
    });
  }

  async deleteCard(cardId: number) {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: 'Are you sure you want to delete this card?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'OK',
          handler: () => {
            this.loadCheckoutData = true;  // Turn on loading spinner
            const token = this.loginUser.token;
            const data = {
              id: cardId,
              user_id: this.loginUser.id
            }
            this.util.sendData('deletecard', data, token).subscribe({
              next: (p: any) => {
                if (p.status == 'success') {
                  console.log('Card deleted Successfully:', p.data);
                  this.loadCheckoutData = false;  // Turn off loading spinner
                  this.usercarddata();
                } else {
                  console.log('Deletion Failed:', p.message);
                  this.loadCheckoutData = false;  // Turn off loading spinner
                }
              },
              error: (err: any) => {
                console.log('Error:', err);
                this.loadCheckoutData = false;  // Turn off loading spinner
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  formatCardNumber(cardNumber: string): string {
    // Ensure cardNumber is a string and has at least 4 characters
    if (cardNumber && cardNumber.length >= 4) {
      // Replace all but the last 4 digits with 'X'
      const lastFourDigits = cardNumber.slice(-4);
      const maskedPart = 'X'.repeat(cardNumber.length - 4);
      return maskedPart + lastFourDigits;
    }
    return cardNumber;
  }
}




