import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UpdatecardinfoPage } from './updatecardinfo.page';

const routes: Routes = [
  {
    path: '',
    component: UpdatecardinfoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UpdatecardinfoPageRoutingModule {}
