import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CiudadesListComponent } from './operaciones/ciudades/list/ciudades-list.component';
import { MateriaPrimaListComponent } from './operaciones/materiaprima/materiaprima-list/materiaprima-list.component';
import { DetalleCatalogoEditComponent }from './operaciones/detallecatalogo/edit/detallecatalogo-edit.component';
import { DetalleCatalogoComponent } from './operaciones/detallecatalogo/list/detallecatalogo-list.component';
import { EmpresaTransporteListComponent } from './operaciones/empresatransporte/list/empresatransporte-list.component';
import { TransporteListComponent } from './operaciones/transporte/list/transporte-list.component';
import { TransporteEditComponent } from './operaciones/transporte/edit/transporte-edit.component';
import { EmpresaProveedoraListComponent } from './operaciones/empresaproveedora/list/empresaproveedora-list.component';
import { EmpresaTransporteEditComponent } from './operaciones/empresatransporte/edit/empresatransporte-edit.component';
import { EmpresaProveedoraEditComponent } from './operaciones/empresaproveedora/edit/empresaproveedora-edit.component';
import { MateriaPrimaEditComponent } from './operaciones/materiaprima/materiaprima-edit/materiaprima-edit.component';
import { NotaSalidaEditComponent } from "./operaciones/notasalida/notasalida-edit/notaSalida-edit.component";
import { NotacompraListComponent } from './operaciones/notacompra/notacompra-list.component';
import { IngresoAlmacenComponent } from './operaciones/ingresoalmacen/ingreso-almacen.component';
import { IngresoAlmacenEditComponent } from './operaciones/ingresoalmacen/ingresoalmacen-edit/ingresoalmacen-edit.component';
import { LotesComponent } from './operaciones/lotes/lotes.component';
import { NotaSalidaComponent } from './operaciones/notasalida/nota-salida.component';
import { OrdenServicioComponent } from './operaciones/ordenservicio/orden-servicio.component';
import { OrdenServicioEditComponent } from './operaciones/ordenservicio/ordenservicio-edit/ordenservicio-edit.component';
import { NotaCompraEditComponent } from './operaciones/notacompra/notacompra-edit/nota-compra-edit.component';
import { LoteEditComponent } from './operaciones/lotes/lote-edit/lote-edit.component';
import{ZonaListComponent} from './operaciones/zona/list/zona-list.component';
import {ZonaEditComponent} from './operaciones/zona/edit/zona-edit.component';

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
        path: 'ingresoalmacen-edit',
        component: IngresoAlmacenEditComponent,
        data: {
          title: 'Edit'
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
      },
      {
        path: 'ordenservicio-controlcalidadexterna-edit',
        component: OrdenServicioEditComponent,
        data: {
          title: 'Ordenes de Servicio Edit- Control de Calidad Externa'
        }
      },
      {
        path: 'empresatransporte-list',
        component: EmpresaTransporteListComponent,
        data: {
          title: 'List'
        }
      },
      {
        path: 'empresatransporte-edit',
        component: EmpresaTransporteEditComponent,
        data: {
          title: 'Edit'
        }
      },
      {
        path: 'empresaproveedora-list',
        component: EmpresaProveedoraListComponent,
        data: {
          title: 'List'
        }
      },
      {
        path: 'empresaproveedora-edit',
        component: EmpresaProveedoraEditComponent,
        data: {
          title: 'Edit'
        }
      },
      {
        path: 'transporte-list',
        component: TransporteListComponent,
        data: {
          title: 'List'
        }
      },
      {
        path: 'transporte-edit',
        component: TransporteEditComponent,
        data: {
          title: 'Edit'
        }
      },
      {
        path: 'zona-list',
        component: ZonaListComponent,
        data: {
          title: 'List'
        }
      },
      {
        path: 'detallecatalogo-list',
        component: DetalleCatalogoComponent,

        data: {
          title: 'List'
        }
      },
      {
        path: 'zona-edit',
        component: ZonaEditComponent,
        data: {
          title: 'Edit'
        }
      },
      {
        path: 'detallecatalogo-edit',
        component: DetalleCatalogoEditComponent,
        data: {
          title: 'Edit'
        }
      },
      {
        path: 'ciudades-list',
        component: CiudadesListComponent,

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
export class AcopioRoutingModule { }

