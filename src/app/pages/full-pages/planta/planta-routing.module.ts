import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NotaIngresoListComponent } from './operaciones/notaingreso/list/notaingreso-list.component';
import { ControlCalidadListComponent } from './operaciones/controlcalidad/list/controlcalidad-list.component';
import { OrdenProcesoListComponent } from './operaciones/ordenproceso/list/ordenproceso-list.component';
import { OrdenProcesoEditComponent } from './operaciones/ordenproceso/edit/ordenproceso-edit.component';
import { ServiciosListComponent } from './operaciones/Servicios/list/servicios-list.component';
import { ServiciosEditComponent } from './operaciones/Servicios/edit/servicios-edit.component';
import{ServicioPlantaeditComponent}from './operaciones/Servicios/ServicioPlantaPopup/servicioPlanta-edit.component';

import { NotaIngresoEditComponent } from './operaciones/notaingreso/edit/notaingreso-edit.component';
import{ControlCalidadEditComponent} from './operaciones/controlcalidad/edit/controlcalidad-edit.component';
import { NotaIngresoAlmacenListComponent } from './operaciones/notaingresoalmacen/list/notaingresoalmacen-list.component';
import { NotaIngresoAlmacenEditComponent } from './operaciones/notaingresoalmacen/edit/notaingresoalmacen-edit.component';
import {NotaIngresoProductoTerminadoListComponent}from './operaciones/NotaIngresoProductoTerninadoAlmacen/list/notaingresoproducto-list.component';
import {NotaIngresoProductoTerminadoEditComponent}from './operaciones/NotaIngresoProductoTerninadoAlmacen/edit/notaingresoproducto-edit.component';


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
          title: 'NotaIngresoPlantaList'
        }
      },
      {
        path: 'notaingreso-edit',
        component: NotaIngresoEditComponent,
        data: {
          title: 'NotaIngresoPlantaEdit'
        },
      },
      //////////////////////agregando modulo controlcalidad///////////////////
       {
        path: 'controlcalidad-list',
        component: ControlCalidadListComponent,
        data: {
          title: 'ControlCalidadPlantaList'
        }
      },
      {
        path: 'controlcalidad-edit',
        component: ControlCalidadEditComponent,
        data: {
        title: 'ControlCalidadPlantaEdit'
        },
       },
      ///////////////////
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
      ////////////////agregando modulo nota ingreso producto almancen/////
      {
        path: 'notaingresoproducto-list',
        component: NotaIngresoProductoTerminadoListComponent,
        data: {
          title: 'List'
        },
      },
      {
       path: 'notaingresoproducto-edit',
       component: NotaIngresoProductoTerminadoEditComponent,
        data: {
          title: 'Edit'
        }
      },

    ////////////////////////////////////////77777
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
          title: 'LiquidacionProcesoList'
        }
      },
      {
        path: 'liquidacionproceso-edit',
        component: LiquidacionProcesoEditComponent,
        data: {
          title: 'LiquidacionProcesoEdit'
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
        path: 'ordenproceso/create',
        component: OrdenProcesoEditComponent,
        data: {
          title: 'Contratos'
        }
      },
      {
        path: 'ordenproceso/update/:id',
        component: OrdenProcesoEditComponent,
        data: {
          title: 'Contratos'
        }
      },
      {
        path: 'servicios-list',
        component: ServiciosListComponent,
        data:
        {
          title: 'ServiciosList'
        }
      },
      {
        path: 'servicios-edit',
        component: ServiciosEditComponent,
        data: {
          title: 'ServiciosEdit'
        }
      },
      {
        path: 'servicios-edit/:id',
        component: ServiciosEditComponent,
        data: {
          title: 'ServiciosEdit'
        }
      },
      {
        path: 'servicios-edit/:ServicioPlantaId',
        component: ServiciosEditComponent,
        data: {
          title: 'ServiciosEdit'
        }
      },

      {
        path: 'servicioPlanta-edit',
        component: ServicioPlantaeditComponent,
        data: {
          title: 'ServicioPlantaedit'
        }
      },
      {
        path: 'servicioPlanta-edit/:ServicioPlantaId/:Moneda',
        component: ServicioPlantaeditComponent,
        data: {
          title: 'ServicioPlantaedit'
        }
      },
      {
        path: 'servicioPlanta-edit/:ServicioPlantaId/:PagoServicioPlantaId/:Moneda',
        component: ServicioPlantaeditComponent,
        data: {
          title: 'ServicioPlantaedit'
        }
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlantaRoutingModule { }
