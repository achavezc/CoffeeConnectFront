import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MateriaPrimaListComponent } from './operaciones/materiaprima/materiaprima-list/materiaprima-list.component';
import { MateriaPrimaEditComponent } from './operaciones/materiaprima/materiaprima-edit/materiaprima-edit.component';

const routes: Routes = [
  {
    path: 'operaciones',
    children: [
      {
        path: 'guiarecepcionmateriaprima-list',
        component: MateriaPrimaListComponent,
        data: {
          title: 'List'
        }
      },
      {
        path: 'guiarecepcionmateriaprima-edit',
        component: MateriaPrimaEditComponent,
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
export class AcopioRoutingModule { }
