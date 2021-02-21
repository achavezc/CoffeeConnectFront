import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MateriaPrimaListComponent } from './operaciones/materiaprima/materiaprima-list/materiaprima-list.component';
import { MateriaPrimaEditComponent } from './operaciones/materiaprima/materiaprima-edit/materiaprima-edit.component';
import { NotacompraListComponent } from './operaciones/notacompra/notacompra-list/notacompra-list.component';
import { IngresoAlmacenComponent } from './operaciones/ingresoalmacen/ingreso-almacen.component';
import { LotesComponent } from './operaciones/lotes/lotes.component';
import { NotaSalidaComponent } from './operaciones/notasalida/nota-salida.component';

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
      },
      {
        path: 'notasdecompra-list',
        component: NotacompraListComponent,
        data: {
          title: 'Liquidación de compra'
        }
      },
      {
        path: 'ingresoalmacen-list',
        component: IngresoAlmacenComponent,
        data: {
          title: 'Ingreso a almacen'
        }
      },
      {
        path: 'lotes-list',
        component: LotesComponent,
        data: {
          title: 'Lotes'
        }
      },
      {
        path: 'notasalida-list',
        component: NotaSalidaComponent,
        data: {
          title: 'Nota de salida'
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
