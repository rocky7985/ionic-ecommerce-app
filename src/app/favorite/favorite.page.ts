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
  page: number = 1;
  loadMoreProducts: boolean = true;

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

  favorite(event?: any) {
    const token = this.loginUser.token;
    const postData = { user_id: this.loginUser.id, paged: this.page };

    this.util.sendData('favouriteData', postData, token).subscribe({
      next: (p: any) => {
        if (p.status == 'success') {
          const favourite = p.data;
          console.log('Favourite Data:', this.favouriteData);
          if (favourite.length == 0) {
            this.loadMoreProducts = false;
            event?.target.complete(); // Complete infinite scroll event
            return;
          }

          this.favouriteData = [...this.favouriteData, ...favourite];
          if (favourite.length < 6) {
            this.loadMoreProducts = false;
          }
          else {
            this.page++;
          }
          this.loadFavourites = false;
          event?.target.complete(); // Complete infinite scroll event
          console.log('Favourite Data:', this.favouriteData);
        }
        else {
          console.log('An error occurred. Try Again.')
          this.loadFavourites = false;
          event?.target.complete(); // Complete infinite scroll in case of error
        }
      }, error: (err) => {
        console.log('Error loading favourites:', err);
        this.loadFavourites = false;
        event?.target.complete(); // Complete infinite scroll in case of error
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


  deleteFavourites(event: Event, postid: number) {
    event.stopPropagation();
    const token = this.loginUser.token;
    const postData = {
      user_id: this.loginUser.id,
      post_id: postid
    };
    this.loadFavourites = true;

    this.util.sendData('favourites', postData, token).subscribe({
      next: (p: any) => {
        if (p.status == 'success') {
          console.log('Item Removed from Favourites', postid);
          this.favouriteData = this.favouriteData.filter((item: any) => item.Id !== postid);
          this.loadFavourites = false;
        }
        else {
          console.log('Failed to remove favourite.');
          this.loadFavourites = false;
        }
      },
      error: (err) => {
        console.log('Error deleting favourite:', err);
        this.loadFavourites = false; // Hide spinner in case of error
      }
    });
  }

  navigateToItemDetails(id: number) {
    this.router.navigate(['/item-details', id]);
  }
}
