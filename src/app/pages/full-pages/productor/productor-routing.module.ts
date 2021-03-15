import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProductorComponent } from './administracion/maestroproductor/productor.component';
import { ProductorEditComponent } from './administracion/maestroproductor/productor-edit/productor-edit.component';
import { FincaComponent } from './administracion/maestroproductor/finca/finca.component';
import { FincaEditComponent } from './administracion/maestroproductor/finca/fincaedit/finca-edit.component';

const routes: Routes = [
  {
    path: 'administracion',
    children: [
      {
        path: '',
        redirectTo: 'productor/list',
        pathMatch: 'full',
        data: {
          title: 'Maestro de Productores'
        }
      },
      {
        path: 'productor/list',
        component: ProductorComponent,
        data: {
          title: 'Maestro de Productores'
        }
      },
      {
        path: 'productor/create',
        component: ProductorEditComponent,
        data: {
          title: 'Nuevo productor'
        }
      },
      {
        path: 'productor/update/:id',
        component: ProductorEditComponent,
        data: {
          title: 'Actualizar productor'
        }
      },
      {
        path: 'productor/finca/:id',
        component: FincaComponent,
        data: {
          title: 'Lista de fincas'
        }
      },
      {
        path: 'productor/finca/create',
        component: FincaEditComponent,
        data: {
          title: 'Nueva Finca'
        }
      },
      {
        path: 'productor/finca/update/:id',
        component: FincaEditComponent,
        data: {
          title: 'Actualizar Finca'
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
