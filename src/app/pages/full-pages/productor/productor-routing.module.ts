import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProductorComponent } from './administracion/maestroproductor/productor.component';

const routes: Routes = [
  {
    path: 'administracion',
    children: [
      {
        path: 'productor-list',
        component: ProductorComponent,
        data: {
          title: 'Maestro de Productores'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductorRoutingModule { }
