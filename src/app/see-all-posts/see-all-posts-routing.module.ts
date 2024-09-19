import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SeeAllPostsPage } from './see-all-posts.page';

const routes: Routes = [
  {
    path: '',
    component: SeeAllPostsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SeeAllPostsPageRoutingModule {}
