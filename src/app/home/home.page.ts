import { Component, ViewChild } from '@angular/core';
import { UtilService } from '../util.service';
import { Router } from '@angular/router'; // Import Router
import { forkJoin } from 'rxjs'; // Import forkJoin from RxJS
import { tap } from 'rxjs/operators'; // Import tap from RxJS operators

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  @ViewChild('popover') popover;
  // @ViewChild('popover', { static: false }) popover: IonPopover; // Ensure correct popover reference


  isOpen: boolean = false;
  public categories = [];
  public featuredProducts = [];
  public bestSellProducts = [];
  searchPost: string = '';

  originalFeatured: any[] = [];
  originalCategories: any[] = [];
  originalBestsell: any[] = [];


  public loadingCategories = true;  // Added for loading state
  public loadingFeatured = true;    // Added for loading state
  public loadingBestSell = true;    // Added for loading state
  selectedFilter: string = '';  // Default filter
  listProducts: any = [];
  loginUser: any = [];
  // favouritepost: any = [];

  constructor(
    private util: UtilService,
    private router: Router // Inject Router
  ) { }

  ionViewWillEnter() {
    this.getLoginUser();
    this.getCategories();
    this.getpost();
    this.getBestSell();
  }

  getLoginUser() {
    let user = JSON.parse(localStorage.getItem('login'))
    if (user != null) {
      this.loginUser = user;
    }
  }

  // getpost() {
  //   const login = JSON.parse(localStorage.getItem('login'));
  //   const logindata = login.token;
  //   this.util.sendData('getShopData', {}, logindata).subscribe({
  //     next: (p: any) => {
  //       if (p.status == 'success') {
  //         this.featuredProducts = p.data.slice(0, 3);  // Assuming 'p.data' contains the products
  //         // Check if products are in favourites and update the UI accordingly
  //         this.featuredProducts.forEach((product: any) => {
  //           const data = {
  //             user_id: this.loginUser.id,
  //             post_id: product.Id
  //           }
  //           this.util.sendData('checkFavourite', data, logindata).subscribe({
  //             next: (response: any) => {
  //               product.isFavourite = response.message == 'Product is in favourites';
  //             }
  //           });
  //         });
  //         console.log('FeaturedProducts', this.featuredProducts);
  //       }
  //       this.loadingFeatured = false;  // Turn off loading spinner

  //     }, error: () => {
  //       this.loadingFeatured = false;  // Turn off loading spinner on error
  //     }
  //   });
  // }

  getpost() {
    this.loadingFeatured = true;  // Turn on loading spinner
    const login = JSON.parse(localStorage.getItem('login'));
    const logindata = login.token;
    this.util.sendData('getShopData', {}, logindata).subscribe({
      next: (p: any) => {
        if (p.status == 'success') {
          this.featuredProducts = p.data.slice(0, 3);  // Assuming 'p.data' contains the products
          this.originalFeatured = this.featuredProducts;

          // Array to hold the observable checks for favourites
          const favouriteChecks = this.featuredProducts.map((product: any) => {
            const data = {
              user_id: this.loginUser.id,
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
              this.loadingFeatured = false;  // Turn off loading spinner after all checks are done
              console.log('FeaturedProducts', this.featuredProducts);
            },
            error: () => {
              this.loadingFeatured = false;  // Turn off loading spinner on error
            }
          });
        } else {
          this.loadingFeatured = false;  // Turn off loading spinner if fetching products fails
        }
      },
      error: () => {
        this.loadingFeatured = false;  // Turn off loading spinner on error
      }
    });
  }

  navigateToItemDetails(id: number) {
    this.router.navigate(['/item-details', id]);
  }

  getCategories() {
    this.loadingCategories = true;  // Turn on loading spinner
    const login = JSON.parse(localStorage.getItem('login'));
    const logindata = login.token;
    this.util.sendData('getCategory', {}, logindata).subscribe({
      next: (p: any) => {
        if (p.data.categories) {
          this.categories = [];
          this.originalCategories = this.categories;
          p.data.categories.forEach((category: string) => {

            // Initialize categories array
            if (category == 'Womens') {
              this.categories.push({
                name: 'Womens',
                image: '../../assets/categories/category-1.png',
                action: () => this.navigateToCategory('Womens')
              });
            }
            else if (category == 'Mens') {
              this.categories.push({
                name: 'Mens',
                image: '../../assets/categories/category-2.png',
                action: () => this.navigateToCategory('Mens')
              });

            }
          });
          console.log('Categories', this.categories);
        }
        this.loadingCategories = false;  // Turn off loading spinner

      }, error: () => {
        this.loadingCategories = false;  // Turn off loading spinner
      }
    });
  }

  getBestSell() {
    this.loadingBestSell = true;  // Turn on loading spinner
    const login = JSON.parse(localStorage.getItem('login'));
    const logindata = login.token;
    this.util.sendData('getBestSell', {}, logindata).subscribe({
      next: (p: any) => {
        if (p.status == 'success' && p.data) {
          this.bestSellProducts = p.data.slice(0, 3);
          this.originalBestsell = this.bestSellProducts;
          // Array to hold the observable checks for favourites
          const favouriteChecks = this.bestSellProducts.map((product: any) => {
            const data = {
              user_id: this.loginUser.id,
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
              this.loadingBestSell = false;  // Turn off loading spinner after all checks are done
              console.log('BestSell', this.bestSellProducts);
            }, error: () => {
              this.loadingBestSell = false;
            },
          });
        } else {
          this.loadingBestSell = false;
        }
      },
      error: () => {
        this.loadingBestSell = false;
      },
    });
  }

  navigateToCategory(category: string) {
    this.router.navigate(['/post-category', { category }]); // Pass the category as a parameter
  }

  navigateToSeeAll(context: string) {
    this.router.navigate(['/see-all-posts', { context }]);
  }


  // search() {
  //   let filterTask = [];
  //   if (this.selectedFilter) {
  //     if ('Featured') // checks all whitespaces and occurrences in the string
  //     {
  //       filterTask = this.featuredProducts;
  //     }
  //     else if ('Categories') // checks all whitespaces and occurrences in the string
  //     {
  //       filterTask = this.categories;
  //     }
  //     else if ('Best Sell') // checks all whitespaces and occurrences in the string
  //     {
  //       filterTask = this.bestSellProducts;
  //     }
  //   }
  //   if (this.searchPost.trim() !== '') {
  //     const filterResults = filterTask.filter((item: any) =>
  //       (item.title && item.title.toLowerCase().includes(this.searchPost.toLowerCase())) ||
  //       (item.name && item.name.toLowerCase().includes(this.searchPost.toLowerCase()))
  //     );
  //     if (this.selectedFilter == 'Featured') {
  //       this.featuredProducts = filterResults;
  //     } else if (this.selectedFilter == 'Categories') {
  //       this.categories = filterResults;
  //     } else if (this.selectedFilter == 'Best Sell') {
  //       this.bestSellProducts = filterResults;
  //     }

  //     console.log('Search Results:', filterResults);

  //   }
  //   else {
  //     if (this.selectedFilter == 'Featured') {
  //       this.featuredProducts = this.originalFeatured;
  //     } else if (this.selectedFilter == 'Categories') {
  //       this.categories = this.originalCategories;
  //     } else if (this.selectedFilter == 'Best Sell') {
  //       this.bestSellProducts = this.originalBestsell;
  //     }
  //   }
  // }

  search() {
    let filterTask: any = [];

    switch (this.selectedFilter) {
      case 'Featured':
        filterTask = this.featuredProducts;
        break;
      case 'Categories':
        filterTask = this.categories;
        break;
      case 'Best Sell':
        filterTask = this.bestSellProducts;
        break;
      default:
        filterTask = [];
    }

    if (this.searchPost.trim() !== '') {
      const filterResults = filterTask.filter((item: any) =>
        (item.title && item.title.toLowerCase().includes(this.searchPost.toLowerCase())) ||
        (item.name && item.name.toLowerCase().includes(this.searchPost.toLowerCase()))
      );

      if (this.selectedFilter == 'Featured') {
        this.featuredProducts = filterResults;
      } else if (this.selectedFilter == 'Categories') {
        this.categories = filterResults;
      } else if (this.selectedFilter == 'Best Sell') {
        this.bestSellProducts = filterResults;
      }

      console.log('Search Results:', filterResults);

    } else {
      if (this.selectedFilter == 'Featured') {
        this.featuredProducts = this.originalFeatured;
      } else if (this.selectedFilter == 'Categories') {
        this.categories = this.originalCategories;
      } else if (this.selectedFilter == 'Best Sell') {
        this.bestSellProducts = this.originalBestsell;
      }
    }
  }

  onFilterChange(filter: string) {
    this.selectedFilter = filter;
    this.isOpen = false; // Close the popover after selection
    // this.search();  // Trigger search with new filter
  }

  presentPopover(e: Event) {
    // console.log('Popver', e.target);
    this.popover.event = e; // Set the event for the popover
    this.isOpen = true;
  }

  onClearSearch() {
    this.searchPost = '';
    // this.featuredProducts = [...this.originalFeatured];
    // this.categories = [...this.originalCategories];
    // this.bestSellProducts = [...this.originalBestsell];
  }

  getPlaceholder(): string {
    return this.selectedFilter ? `Search your ${this.selectedFilter}` : 'Search Your Product';
  }

  addToFavourites(postid: number) {
    const token = this.loginUser.token;
    const productIndex = this.featuredProducts.findIndex((product: any) => product.Id == postid);

    if (productIndex !== -1) {
      const product = this.featuredProducts[productIndex];
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

