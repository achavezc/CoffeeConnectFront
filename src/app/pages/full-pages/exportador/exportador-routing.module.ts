import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OrdenServicioComponent } from './ordenservicio/orden-servicio.component';

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
        }
      ]
    }
  ];
  
  @NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
  })
  export class ExportadorRoutingModule { }