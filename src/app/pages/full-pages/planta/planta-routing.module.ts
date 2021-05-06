import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotaIngresoListComponent } from './operaciones/notaingreso/list/notaingreso-list.component';
import { NotaIngresoEditComponent } from './operaciones/notaingreso/edit/notaingreso-edit.component';


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
