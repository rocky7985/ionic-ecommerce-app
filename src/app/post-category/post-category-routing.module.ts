import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PostCategoryPage } from './post-category.page';

const routes: Routes = [
  {
    path: '',
    component: PostCategoryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PostCategoryPageRoutingModule {}
