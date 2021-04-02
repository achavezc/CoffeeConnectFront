import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OrdenServicioComponent } from './ordenservicio/orden-servicio.component';
import { ClienteComponent } from './cliente/cliente.component';
import { ClienteEditComponent } from './cliente/cliente-edit/cliente-edit.component';
import { ContratoComponent } from './contrato/contrato.component';
import { ContratoEditComponent } from './contrato/contrato-edit/contrato-edit.component';

const routes: Routes = [
    {
      path: '',
      children: [
        {
          path: 'orderservicio-controlcalidadexterna-list',
          component: OrdenServicioComponent,
          data: {
            title: 'Ordenes de Servicio - Control de Calidad Externa'
          }
        },
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