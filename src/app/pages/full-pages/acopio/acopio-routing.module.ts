import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MateriaPrimaListComponent } from './operaciones/materiaprima/materiaprima-list/materiaprima-list.component';
import { MateriaPrimaEditComponent } from './operaciones/materiaprima/materiaprima-edit/materiaprima-edit.component';
import { NotaSalidaEditComponent } from "./operaciones/notasalida/notasalida-edit/notaSalida-edit.component";
import { NotacompraListComponent } from './operaciones/notacompra/notacompra-list.component';
import { IngresoAlmacenComponent } from './operaciones/ingresoalmacen/ingreso-almacen.component';
import { LotesComponent } from './operaciones/lotes/lotes.component';
import { NotaSalidaComponent } from './operaciones/notasalida/nota-salida.component';
import { OrdenServicioComponent } from './operaciones/ordenservicio/orden-servicio.component';
import { NotaCompraEditComponent } from './operaciones/notacompra/notacompra-edit/nota-compra-edit.component';
import { LoteEditComponent } from './operaciones/lotes/lote-edit/lote-edit.component';

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
        path: 'notasalida-edit',
        component: NotaSalidaEditComponent,
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
        path: 'notacompra/update/:id',
        component: NotaCompraEditComponent,
        data: {
          title: 'Actualizar Liquidación de compra'
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
        path: 'lote/update/:id',
        component: LoteEditComponent,
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
      },
      {
        path: 'orderservicio-controlcalidadexterna-list',
        component: OrdenServicioComponent,
        data: {
          title: 'Ordenes de Servicio - Control de Calidad Externa'
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
