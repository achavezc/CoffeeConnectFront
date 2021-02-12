import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InvoicePageComponent } from "./invoice/invoice-page.component";

const routes: Routes = [
  {
    path: 'acopio',
    loadChildren: () => import('../../pages/full-pages/acopio/acopio.module').then(m => m.AcopioModule)
},
  {
    path: '',
    children: [
      {
        path: 'invoice',
        component: InvoicePageComponent,
        data: {
          title: 'Invoice Page'
        }
      }
    ]
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FullPagesRoutingModule { }
