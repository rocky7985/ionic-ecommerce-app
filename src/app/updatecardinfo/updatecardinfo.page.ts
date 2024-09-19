import { Component, ElementRef, ViewChild } from '@angular/core';
import { UtilService } from '../util.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router'; // Import Router
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-updatecardinfo',
  templateUrl: './updatecardinfo.page.html',
  styleUrls: ['./updatecardinfo.page.scss'],
})
export class UpdatecardinfoPage {

  @ViewChild('profileFormElement', { static: true }) profileFormElement: ElementRef;

  updateCard: FormGroup;
  loginUser: any = [];
  updatedData: any = [];
  public loadProfileData = true;
  private cardId: number;

  constructor(private util: UtilService,
    private router: Router, private route: ActivatedRoute
  ) {

    this.updateCard = new FormGroup({
      card_num: new FormControl('', [Validators.required, Validators.pattern(/^(\d{4} ?){3}\d{4}$/)]),
      exp_date: new FormControl('', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]),
      cvv: new FormControl('', [Validators.required, Validators.pattern(/^\d{3}$/)]),
      card_name: new FormControl('', Validators.required),
    });
  }

  ionViewWillEnter() {
    this.getLoginUser();
    this.route.queryParams.subscribe(params => {
      const cardId = params['card_id'];
      if (cardId) {
        this.getCardData(cardId); // Pass the card ID to the method
      }
    });
    this.profileFormElement.nativeElement.addEventListener('touchstart', this.handleTouchStart, { passive: true });

  }

  getLoginUser() {
    let user = JSON.parse(localStorage.getItem('login'))
    if (user != null) {
      this.loginUser = user;
    }
  }

  handleTouchStart(event: Event) {
    console.log('Touch start event:', event);
  }

  formatCardNumber(event: any) {
    let input = event.target.value.replace(/\D/g, '').substring(0, 16); // Remove non-digits and limit to 16 digits
    if (input.length > 0) {
      input = input.match(/.{1,4}/g)?.join(' ') || ''; // Add space every 4 digits
    }
    this.updateCard.controls['card_num'].setValue(input);
  }

  formatExpiryDate(event: any) {
    let input = event.target.value.replace(/\D/g, '').substring(0, 4); // Remove non-digits and limit to 6 digits
    if (input.length >= 2) {
      input = input.substring(0, 2) + '/' + input.substring(2, 4); // Add slash after MM
    }
    this.updateCard.controls['exp_date'].setValue(input);
  }

  getCardData(cardId: number) {
    const login = JSON.parse(localStorage.getItem('login'));
    const logindata = login.token;
    this.util.sendData('savedcards', { card_id: cardId }, logindata).subscribe({
      next: (p: any) => {
        if (p.status == 'success') {
          const card = p.data.find((c: any) => c.id == cardId);  // Find the specific card by ID
          console.log('p.data:', card);

          if (card) {
            this.cardId = card.id; // Correctly assign cardId
            const formattedCardNum = card.card_num.replace(/\D/g, '').match(/.{1,4}/g)?.join(' ') || '';
            this.updateCard.patchValue({
              card_num: formattedCardNum,
              exp_date: card.exp_date || '',
              cvv: card.cvv || '',
              card_name: card.card_name || ''
            });
          } else {
            console.error('Card not found with the given ID');
          }
        } else {
          console.error('Failed to retrieve card data');
        }
        this.loadProfileData = false;

      }, error: () => {
        console.log('Error loading card');
        this.loadProfileData = false;

      }
    });
  }

  getUpdatedData() {

    if (this.updateCard.valid) {

      this.loadProfileData = true; // Start spinner

      // Construct the payload with necessary fields
      const updatedData = {
        id: this.cardId, // Ensure this is the correct card ID
        card_num: this.updateCard.value.card_num.replace(/\s+/g, ''), // Remove spaces
        exp_date: this.updateCard.value.exp_date,
        cvv: this.updateCard.value.cvv,
        card_name: this.updateCard.value.card_name
      };
      const login = JSON.parse(localStorage.getItem('login'));
      const logindata = login.token;
      this.util.sendData('updatecardinfo', updatedData, logindata).subscribe({
        next: (p: any) => {
          if (p.status == 'success') {
            this.updatedData = p.data;
            console.log('Card Updated Data:', p.data);
            this.util.presentToast('Carddata Updated');
            this.router.navigate(['/savedcards']);
          } else {
            console.error('Failed to update card:', p.message);
            this.util.presentToast('Failed to update card');
            this.router.navigate(['/savedcards']);
          }
          this.loadProfileData = false;

        }, error: (error: any) => {
          console.error('Error updating card:', error);
          this.util.presentToast('Error updating card');
          this.loadProfileData = false;
        }
      });
    }
    else {
      console.log('Form is invalid:', this.updateCard.invalid);
    }
  }


}
