import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SavedcardsPage } from './savedcards.page';

const routes: Routes = [
  {
    path: '',
    component: SavedcardsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SavedcardsPageRoutingModule {}
