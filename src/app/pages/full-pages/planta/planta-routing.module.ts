import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotaIngresoListComponent } from './operaciones/notaingreso/list/notaingreso-list.component';
import { NotaIngresoEditComponent } from './operaciones/notaingreso/edit/notaingreso-edit.component';
import { NotaIngresoAlmacenListComponent } from './operaciones/notaingresoalmacen/list/notaingresoalmacen-list.component';
import {NotaIngresoAlmacenEditComponent} from './operaciones/notaingresoalmacen/edit/notaingresoalmacen-edit.component';
import {NotaSalidaAlmacenComponent} from '../planta/operaciones/notasalidaalmacen/list/notasalidaalmacen-list.component';


const routes: Routes = [
  {
    path: 'operaciones',
    children: [
      {
        path: 'notaingreso-list',
        component: NotaIngresoListComponent,
        data: {
          title: 'List'
        }
      },
      {
        path: 'notaingreso-edit',
        component: NotaIngresoEditComponent,
        data: {
          title: 'Edit'
        },
      },
      {
        path: 'notaingresoalmacen-list',
        component: NotaIngresoAlmacenListComponent,
        data: {
          title: 'List'
        },
      },
      {
        path: 'notaingresoalmacen-edit',
        component: NotaIngresoAlmacenEditComponent,
        data: {
          title: 'Edit'
        }
      },
      {
        path: 'notasalidaalmacen-list',
        component: NotaSalidaAlmacenComponent,
        data: {
          title: 'List'
        }
      }

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlantaRoutingModule { }
