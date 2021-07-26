import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ClienteComponent } from './operaciones/cliente/cliente.component';
import { ClienteEditComponent } from './operaciones/cliente/cliente-edit/cliente-edit.component';
import { ContratoComponent } from './operaciones/contrato/contrato.component';
import { ContratoEditComponent } from './operaciones/contrato/contrato-edit/contrato-edit.component';
import { OrdenProcesoEditComponent } from './operaciones/ordenproceso/ordenproceso-edit/orden-proceso-edit.component';
import { OrdenProcesoComponent } from './operaciones/ordenproceso/orden-proceso.component';
import { PreciosDiaComponent } from './operaciones/preciosdia/preciosdia-list/preciosdia-list.component';
import { PrecioDiaEditComponent } from './operaciones/preciosdia/preciosdia-edit/preciosdia-edit.component';
import { AduanasComponent } from './operaciones/aduanas/list/aduanas.component';
import { AduanasEditComponent } from './operaciones/aduanas/edit/aduanas-edit.component';
import { PreciodiaRendimientoComponent } from './operaciones/preciodia-rendimiento/preciodia-rendimiento.component';

const routes: Routes = [
  {
    path: 'operaciones',
    children: [
      {
        path: 'cliente/list',
        component: ClienteComponent,
        data: {
          title: 'Clientes'
        }
      },
      {
        path: 'cliente/create',
        component: ClienteEditComponent,
        data: {
          title: 'Clientes'
        }
      },
      {
        path: 'cliente/update/:id',
        component: ClienteEditComponent,
        data: {
          title: 'Clientes'
        }
      },
      {
        path: 'contrato/list',
        component: ContratoComponent,
        data: {
          title: 'Contratos'
        }
      },
      {
        path: 'contrato/create',
        component: ContratoEditComponent,
        data: {
          title: 'Contratos'
        }
      },
      {
        path: 'contrato/update/:id',
        component: ContratoEditComponent,
        data: {
          title: 'Contratos'
        }
      },
      {
        path: 'ordenproceso/list',
        component: OrdenProcesoComponent,
        data: {
          title: 'Contratos'
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
        path: 'preciosdia/list',
        component: PreciosDiaComponent,
        data: {
          title: 'Precios del día'
        }
      },
      {
        path: 'preciosdia/create',
        component: PrecioDiaEditComponent,
        data: {
          title: 'Precios del día'
        }
      }
      ,
      {
        path: 'aduanas/list',
        component: AduanasComponent,
        data: {
          title: 'Aduanas'
        }
      },
      {
        path: 'aduanas/edit',
        component: AduanasEditComponent,
        data: {
          title: 'Aduanas'
        }
      },
      {
        path: 'preciodiarendimiento/list',
        component: PreciodiaRendimientoComponent,
        data: {
          title: 'Precio Día Rendimiento'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExportadorRoutingModule { }