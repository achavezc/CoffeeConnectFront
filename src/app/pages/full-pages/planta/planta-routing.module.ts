import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotaIngresoListComponent } from './operaciones/notaingreso/list/notaingreso-list.component';
import { OrdenProcesoListComponent } from './operaciones/ordenproceso/list/ordenproceso-list.component';
import { OrdenProcesoEditComponent } from './operaciones/ordenproceso/edit/ordenproceso-edit.component';
import { NotaIngresoEditComponent } from './operaciones/notaingreso/edit/notaingreso-edit.component';
import { NotaIngresoAlmacenListComponent } from './operaciones/notaingresoalmacen/list/notaingresoalmacen-list.component';
import { NotaIngresoAlmacenEditComponent } from './operaciones/notaingresoalmacen/edit/notaingresoalmacen-edit.component';
import { NotaSalidaAlmacenComponent } from './operaciones/notasalidaalmacen/list/notasalidaplanta-list.component';
import { NotaSalidaPlantaEditComponent } from './operaciones/notasalidaalmacen/edit/notasalidaplanta-edit.component';
import { LiquidacionProcesoComponent } from './operaciones/liquidacionproceso/list/liquidacionproceso-list.component';
import { LiquidacionProcesoEditComponent } from './operaciones/liquidacionproceso/edit/liquidacionproceso-edit.component';

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
        path: 'notasalidaplanta-list',
        component: NotaSalidaAlmacenComponent,
        data: {
          title: 'List'
        }
      },
      {
        path: 'notasalidaplanta-edit',
        component: NotaSalidaPlantaEditComponent,
        data: {
          title: 'Edit'
        }
      },
      {
        path: 'liquidacionproceso-list',
        component: LiquidacionProcesoComponent,
        data:
        {
          title: 'list'
        }
      },
      {
        path: 'liquidacionproceso-edit',
        component: LiquidacionProcesoEditComponent,
        data: {
          title: 'Edit'
        }
      },
      {
        path: 'ordenproceso-list',
        component: OrdenProcesoListComponent,
        data: {
          title: 'List'
        }
      },
      {
        path: 'ordenproceso-edit',
        component: OrdenProcesoEditComponent,
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
