import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PostCategoryPageRoutingModule } from './post-category-routing.module';

import { PostCategoryPage } from './post-category.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PostCategoryPageRoutingModule
  ],
  declarations: [PostCategoryPage]
})
export class PostCategoryPageModule {}
