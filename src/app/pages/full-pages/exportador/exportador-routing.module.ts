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
import { TipoCambioDiaComponent } from './operaciones/tipocambiodia/tipocambiodia-list/tipocambiodia-list.component';
import { TipoCambioDiaEditComponent } from './operaciones/tipocambiodia/tipocambiodia-edit/tipocambiodia-edit.component';


import { AduanasComponent } from './operaciones/aduanas/list/aduanas.component';
import { AduanasEditComponent } from './operaciones/aduanas/edit/aduanas-edit.component';
import { PreciodiaRendimientoComponent } from './operaciones/preciodia-rendimiento/preciodia-rendimiento.component';
import { PrecioDiaRendimientoEditComponent } from './operaciones/preciodia-rendimiento/edit/precio-dia-rendimiento-edit.component';
import {KardexProcesoComponent} from './operaciones/kardexproceso/kardex-proceso.component';
import {KardexPergaminoComponent} from './operaciones/kardexpergamino/kardex-pergamino.component';
import {KardexProcesoEditComponent} from './operaciones/kardexproceso/edit/kardex-proceso-edit.component';
import {ContratoCompraComponent} from './operaciones/contratocompra/contratocompra.component';
import {ContratoCompraEditComponent} from './operaciones/contratocompra/contrato-edit/contratocompra-edit.component';

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
        path: 'tipocambiodia/list',
        component: TipoCambioDiaComponent,
        data: {
          title: 'Precios del día'
        }
      },
      {
        path: 'tipocambiodia/create',
        component: TipoCambioDiaEditComponent,
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
        path: 'contratocompra/list',
        component: ContratoCompraComponent,
        data: {
          title: 'Contrato Venta'
        }
      },
      {
        path: 'contratocompra/edit',
        component: ContratoCompraEditComponent,
        data: {
          title: 'Contrato Venta'
        }
      },
      {
        path: 'preciodiarendimiento/list',
        component: PreciodiaRendimientoComponent,
        data: {
          title: 'Precio Día Rendimiento'
        }
      },
      {
        path: 'preciodiarendimiento/create',
        component: PrecioDiaRendimientoEditComponent,
        data: {
          title: 'Precio Día Rendimiento'
        }
      },
      {
        path: 'preciodiarendimiento/update/:id',
        component: PrecioDiaRendimientoEditComponent,
        data: {
          title: 'Precio Día Rendimiento'
        }
      },
      {
        path: 'kardexProceso',
        component:  KardexProcesoComponent,
        data: {
          title: 'Kardex'
        }
       
      },
      {
        path: 'kardexPergamino',
        component:  KardexPergaminoComponent,
        data: {
          title: 'Kardex'
        }
       
      },
      {
        path: 'kardexProcesoEdit',
        component:  KardexProcesoEditComponent,
        data: {
          title: 'Kardex'
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