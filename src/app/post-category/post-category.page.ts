import { Component } from '@angular/core';
import { UtilService } from '../util.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-post-category',
  templateUrl: './post-category.page.html',
  styleUrls: ['./post-category.page.scss'],
})
export class PostCategoryPage {

  public posts = [];
  public category: string;
  dataLoaded: boolean = false;
  public page = 1;
  public loadMoreProducts = true;
  loginUser: any = [];

  constructor(
    private route: ActivatedRoute,
    private util: UtilService,
    private router: Router
  ) { }

  ionViewWillEnter() {
    this.getLoginUser();
    this.category = this.route.snapshot.paramMap.get('category');
    this.posts = [];
    this.page = 1;
    this.loadMoreProducts = true;
    this.getCategoryPosts();
  }

  getLoginUser() {
    let user = JSON.parse(localStorage.getItem('login'))
    if (user != null) {
      this.loginUser = user;
    }
  }

  getCategoryPosts(event?: any) {
    this.dataLoaded = true;
    const logindata = this.loginUser.token;
    const payload = { category: this.category, paged: this.page };

    this.util.sendData('getPostByCategory', payload, logindata).subscribe({
      next: (p: any) => {
        if (p.status == 'success') {
          const newposts = p.data;
          console.log('CategoryPosts', newposts);

          if (newposts.length == 0) {
            this.loadMoreProducts = false;
            event?.target.complete(); // Complete infinite scroll event
            return;
          }

          const favouriteChecks = newposts.map((product: any) => {
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

          forkJoin(favouriteChecks).subscribe({
            next: () => {
              this.posts = [...this.posts, ...newposts];
              if (newposts.length < 6) {
                this.loadMoreProducts = false;
              }
              else {
                this.page++;
              }
              this.dataLoaded = false;
              console.log('CategoryPosts Products after Favourite Check:', this.posts);
              event?.target.complete();
            },
            error: () => {
              this.dataLoaded = false;
              console.log('Error checking favourites');
              event?.target.complete();
            }
          });
        }
      },
      error: () => {
        console.log('No Posts Found');
        this.dataLoaded = false;
        event.target.complete();
      }
    });

  }

  navigateToItemDetails(id: number) {
    this.router.navigate(['/item-details', id]);
  }

  loadMore(event: any) {
    if (this.loadMoreProducts) {
      this.getCategoryPosts(event);
    } else {
      event.target.disabled = true;
    }
  }

  addToFavourites(event: Event, postid: number) {
    event.stopPropagation(); // Prevent navigation
    const token = this.loginUser.token;
    const productIndex = this.posts.findIndex((product: any) => product.Id == postid);

    if (productIndex !== -1) {
      const product = this.posts[productIndex];
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
