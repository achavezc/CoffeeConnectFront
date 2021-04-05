import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ClienteComponent } from './operaciones/cliente/cliente.component';
import { ClienteEditComponent } from './operaciones/cliente/cliente-edit/cliente-edit.component';
import { ContratoComponent } from './operaciones/contrato/contrato.component';
import { ContratoEditComponent } from './operaciones/contrato/contrato-edit/contrato-edit.component';

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
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExportadorRoutingModule { }