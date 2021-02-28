import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProductorComponent } from './administracion/maestroproductor/productor.component';
import { ProductorEditComponent } from './administracion/maestroproductor/productor-edit/productor-edit.component';

const routes: Routes = [
  {
    path: 'administracion',
    children: [
      {
        path: '',
        redirectTo: 'productor-list',
        pathMatch: 'full',
        data: {
          title: 'Maestro de Productores'
        }
      },
      {
        path: 'productor-list',
        component: ProductorComponent,
        data: {
          title: 'Maestro de Productores'
        }
      },
      {
        path: 'productor-new',
        component: ProductorEditComponent,
        data: {
          title: 'Nuevo productor'
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
