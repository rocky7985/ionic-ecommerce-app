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
  public loader = false;  // Added for loading state
  public page = 1;
  public limit = 6;
  public loadMoreProducts = true;


  constructor(
    private route: ActivatedRoute,
    private util: UtilService,
    private router: Router,
  ) { }

  ionViewWillEnter() {
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

  getCategories(event?: any) {
    this.loader = true;

    const login = JSON.parse(localStorage.getItem('login'));
    const logindata = login.token;
    this.util.sendData('getCategory', { page: this.page, limit: this.limit }, logindata).subscribe({
      next: (p: any) => {
        const newItems = p.data.categories.map((category: string) => {
          return {
            name: category,
            image: category === 'Womens' ? '../../assets/categories/category-1.png' : '../../assets/categories/category-2.png',
            action: () => this.navigateToCategory(category)
          };
        });

        this.items = [...this.items, ...newItems];
        if (newItems.length < this.limit) {
          this.loadMoreProducts = false;
        }

        this.page++;
        this.loader = false;
        event?.target.complete();
      },
      error: (err: any) => {
        console.log('Error', err);
        this.loader = false;
        event?.target.complete();
      }
    });
  }

  getFeaturedProducts(event?: any) {

    this.loader = true;
    const login = JSON.parse(localStorage.getItem('login'));
    const logindata = login.token;
    this.util.sendData('getShopData', { page: this.page, limit: this.limit }, logindata).subscribe({
      next: (p: any) => {
        const newItems = p.data;  // Assuming 'p.data' contains the products

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
            if (newItems.length < this.limit) {
              this.loadMoreProducts = false;
            }
            this.page++;
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
    this.util.sendData('getBestSell', { page: this.page, limit: this.limit }, logindata).subscribe({
      next: (p: any) => {
        // if (p.status == 'success' && p.data) {
        const newItems = p.data;

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
            if (newItems.length < this.limit) {
              this.loadMoreProducts = false;
            }
            this.page++;
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

}
