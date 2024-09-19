import { Component } from '@angular/core';
import { UtilService } from '../util.service';
import { Router } from '@angular/router'; // Import Router
import { ActivatedRoute } from '@angular/router'; // Import ActivatedRoute
import { forkJoin } from 'rxjs'; // Import forkJoin from RxJS
import { tap } from 'rxjs/operators'; // Import tap from RxJS operators

@Component({
  selector: 'app-post-category',
  templateUrl: './post-category.page.html',
  styleUrls: ['./post-category.page.scss'],
})
export class PostCategoryPage {

  public posts = [];
  public category: string;
  dataLoaded: boolean = false;  // Track if the data has been loaded

  constructor(
    private route: ActivatedRoute, // Inject ActivatedRoute
    private util: UtilService,
    private router: Router // Inject Router
  ) { }

  ionViewWillEnter() {
    this.category = this.route.snapshot.paramMap.get('category'); // Get the category from route parameters
    this.getCategoryPosts();
  }

  getCategoryPosts() {
    this.dataLoaded = false; // Set dataLoaded to true when data is fully loaded
    const login = JSON.parse(localStorage.getItem('login'));
    const logindata = login.token;
    const payload = { category: this.category }; // Include the category in the payload

    this.util.sendData('getPostByCategory', payload, logindata).subscribe({
      next: (p: any) => {
        if (p.status == 'success') {
          this.posts = p.data;
          console.log('CategoryPosts', this.posts);

          // Array to hold the observable checks for favourites
          const favouriteChecks = this.posts.map((product: any) => {
            const data = {
              user_id: login.id,
              post_id: product.Id
            };
            return this.util.sendData('checkFavourite', data, logindata).pipe(
              tap((response: any) => {
                product.isFavourite = response.message == 'Product is in favourites';
              })
            );
          });

          // Wait for all favourite checks to complete
          forkJoin(favouriteChecks).subscribe({
            next: () => {
              console.log('CategoryPosts Products after Favourite Check:', this.posts);
            },
            error: () => {
              console.log('Error checking favourites');
            },
            complete: () => {
              // Hide the spinner after the favourite checks and posts are loaded
              this.dataLoaded = true;
            }
          });
        } else {
          this.dataLoaded = true;  // Turn off loading spinner if fetching products fails
        }
      },
      error: (err: any) => {
        console.log('No Posts Found', err);
        this.dataLoaded = true;
      }
    });
  }

  navigateToItemDetails(id: number) {
    this.router.navigate(['/item-details', id]);
  }

}
