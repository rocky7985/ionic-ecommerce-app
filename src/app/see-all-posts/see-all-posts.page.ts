import { Component } from '@angular/core';
import { UtilService } from '../util.service';
import { Router } from '@angular/router'; // Import Router
import { ActivatedRoute } from '@angular/router'; // Import ActivatedRoute
import { forkJoin } from 'rxjs'; // Import forkJoin from RxJS
import { tap } from 'rxjs/operators'; // Import tap from RxJS operators


@Component({
  selector: 'app-see-all-posts',
  templateUrl: './see-all-posts.page.html',
  styleUrls: ['./see-all-posts.page.scss'],
})
export class SeeAllPostsPage {

  public context: string;
  public items = [];
  public loader = false;
  public page = 1;
  public loadMoreProducts = true;
  loginUser: any = [];


  constructor(
    private route: ActivatedRoute,
    private util: UtilService,
    private router: Router,
  ) { }

  ionViewWillEnter() {
    this.getLoginUser();
    this.context = this.route.snapshot.paramMap.get('context');
    this.items = [];
    this.page = 1;
    this.loadMoreProducts = true;

    if (this.context == 'categories') {
      this.getCategories();
    } else if (this.context == 'featured') {
      this.getFeaturedProducts();
    } else if (this.context == 'bestSell') {
      this.getbestSell();

    }
  }

  getLoginUser() {
    let user = JSON.parse(localStorage.getItem('login'))
    if (user != null) {
      this.loginUser = user;
    }
  }

  getCategories(event?: any) {
    this.loader = true;

    const login = JSON.parse(localStorage.getItem('login'));
    const logindata = login.token;
    const search = ''; // Assuming you want to implement search later
    this.util.sendData('getCategory', { paged: this.page, search }, logindata).subscribe({
      next: (p: any) => {
        if (p.status == 'success' && p.data) {
          const newItems = p.data.categories.map((category: any) => ({
            name: category.name,
            image: category.image, // Fallback to a default image
            action: () => this.navigateToCategory(category.name)
          }));
          if (newItems.length == 0) {
            this.loadMoreProducts = false;
            event?.target.complete(); // Complete infinite scroll event
            return;
          }

          this.items = [...this.items, ...newItems];
          if (newItems.length < 6) {
            this.loadMoreProducts = false;
          }
          else {
            this.page++;
          }
          this.loader = false;
          event?.target.complete();
          console.log('Category:', this.items);
        }
        else {
          this.loadMoreProducts = false;
          this.loader = false;
          event?.target.complete();
          console.error('Error retrieving categories:', p.message);
        }
      },
      error: (err: any) => {
        console.log('Error', err);
        this.loader = false;
        this.loadMoreProducts = false;
        event?.target.complete();
      }
    });
  }

  getFeaturedProducts(event?: any) {

    this.loader = true;
    const login = JSON.parse(localStorage.getItem('login'));
    const logindata = login.token;
    this.util.sendData('getShopData', { paged: this.page }, logindata).subscribe({
      next: (p: any) => {
        const newItems = p.data;  // Assuming 'p.data' contains the products
        if (newItems.length == 0) {
          this.loadMoreProducts = false;
          event?.target.complete(); // Complete infinite scroll event
          return;
        }
        const favouriteChecks = newItems.map((product: any) => {
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
            this.items = [...this.items, ...newItems];
            if (newItems.length < 6) {
              this.loadMoreProducts = false;
            } else {
              this.page++;
            }
            this.loader = false;  // Turn off loading spinner after all checks are done
            console.log('FeaturedProducts', this.items);
            event?.target.complete();
          },
          error: () => {
            this.loader = false;  // Turn off loading spinner on error
            event?.target.complete();
          }
        });
      },
      error: () => {
        this.loader = false;  // Turn off loading spinner on error
        event?.target.complete();
      }
    });
  }

  getbestSell(event?: any) {
    this.loader = true;

    const login = JSON.parse(localStorage.getItem('login'));
    const logindata = login.token;
    this.util.sendData('getBestSell', { paged: this.page }, logindata).subscribe({
      next: (p: any) => {
        // if (p.status == 'success' && p.data) {
        const newItems = p.data;
        if (newItems.length == 0) {
          this.loadMoreProducts = false;
          event?.target.complete(); // Complete infinite scroll event
          return;
        }

        // Array to hold the observable checks for favourites
        const favouriteChecks = newItems.map((product: any) => {
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
            this.items = [...this.items, ...newItems];
            if (newItems.length < 6) {
              this.loadMoreProducts = false;
            }
            else {
              this.page++;
            }
            this.loader = false;  // Turn off loading spinner after all checks are done
            event?.target.complete();
            console.log('BestSell Products:', this.items);
          },
          error: () => {
            this.loader = false;  // Turn off loading spinner on error
            event?.target.complete();
          }
        });
      }, error: () => {
        this.loader = false;
        event?.target.complete();
      }
    });
  }

  navigateToCategory(category: string) {
    this.router.navigate(['/post-category', { category }]); // Pass the category as a parameter

  }

  navigateToItemDetails(id: number) {
    this.router.navigate(['/item-details', id]);


  }

  addToFavourites(event: Event, postid: number) {
    event.stopPropagation(); // Prevent navigation
    const token = this.loginUser.token;
    const productIndex = this.items.findIndex((product: any) => product.Id == postid);

    if (productIndex !== -1) {
      const product = this.items[productIndex];
      product.isFavourite = !product.isFavourite;

      const data = {
        user_id: this.loginUser.user_id,
        post_id: postid
      };

      this.util.sendData('favourites', data, token).subscribe({
        next: (response: any) => {
          if (response.status == 'success') {
            console.log(response.message);
          }
          else {
            product.isFavourite = !product.isFavourite;
            console.log('An Error Occurred. Try Again');
          }
        },
        error: (err) => {
          product.isFavourite = !product.isFavourite;
          console.log('Error Occurred:', err);
        }
      });
    }
  }
}
