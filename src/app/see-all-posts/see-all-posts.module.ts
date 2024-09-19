import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SeeAllPostsPageRoutingModule } from './see-all-posts-routing.module';

import { SeeAllPostsPage } from './see-all-posts.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SeeAllPostsPageRoutingModule
  ],
  declarations: [SeeAllPostsPage]
})
export class SeeAllPostsPageModule {}
