import { Component } from '@angular/core';
import { UtilService } from '../util.service';
import { Router } from '@angular/router'; // Import Router
// import { AlertController } from '@ionic/angular';  // Import AlertController

@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.page.html',
  styleUrls: ['./favorite.page.scss'],
})
export class FavoritePage {

  favouriteData: any = [];
  loginUser: any = [];
  loadFavourites: boolean = true;
  // postid: number;

  constructor(private util: UtilService, private router: Router) { }

  ionViewWillEnter() {
    this.getLoginUser();
    this.favorite();
  }
  getLoginUser() {
    let user = JSON.parse(localStorage.getItem('login'))
    if (user != null) {
      this.loginUser = user;
    }
  }

  favorite() {
    this.favouriteData = [];
    const token = this.loginUser.token;
    const postData = { user_id: this.loginUser.id }; // Ensure user ID is sent

    this.util.sendData('favouriteData', postData, token).subscribe({
      next: (p: any) => {
        if (p.status == 'success') {
          this.favouriteData = p.data;
          console.log('Favourite Data:', this.favouriteData);
          this.loadFavourites = false;  // Turn off loading spinner
        }
        else {
          console.log('An error occurred. Try Again.')
          this.loadFavourites = false;  // Turn off loading spinner
        }
      }
    });
  }

  // async confirmDelete(postId: number) {
  //   const alert = await this.alertController.create({
  //     header: 'Confirm Delete',
  //     message: 'Are you sure you want to delete this item from your favourites?',
  //     buttons: [
  //       {
  //         text: 'Cancel',
  //         role: 'cancel',
  //         cssClass: 'secondary',
  //         handler: () => {
  //           console.log('Delete cancelled');
  //         }
  //       }, {
  //         text: 'Delete',
  //         handler: () => {
  //           this.deleteFavourites(postId);
  //         }
  //       }
  //     ]
  //   });

  //   await alert.present();
  // }


  deleteFavourites(postid: number) {
    const token = this.loginUser.token;
    const postData = {
      user_id: this.loginUser.id,
      post_id: postid
    }; // Ensure user ID is sent
    this.loadFavourites = true; // Show spinner while deleting

    this.util.sendData('favourites', postData, token).subscribe({
      next: (p: any) => {
        if (p.status == 'success') {
          console.log('Item Removed from Favourites', postid);
          this.favorite();
          this.loadFavourites = false; // Hide spinner after reloading data
        }
        else {
          console.log('Failed to remove favourite.');
        }
      },
    });
  }

  navigateToItemDetails(id: number) {
    this.router.navigate(['/item-details', id]);
  }
}
