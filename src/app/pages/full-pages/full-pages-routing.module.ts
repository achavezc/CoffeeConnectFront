import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InvoicePageComponent } from "./invoice/invoice-page.component";
import { HomeComponent } from "./home/home.component";

const routes: Routes = [
  {
    path: 'acopio',
    loadChildren: () => import('../../pages/full-pages/acopio/acopio.module').then(m => m.AcopioModule)
  },
  {
    path: 'productor',
    loadChildren: () => import('./productor/productor.module').then(m => m.ProductorModule)
  },
  {
    path: 'agropecuario',
    loadChildren: () => import('./agropecuario/agropecuario.module').then(m => m.AgropecuarioModule)
  },
  {
    path: 'exportador',
    loadChildren: () => import('./exportador/exportador.module').then(m => m.ExportadorModule)
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
      },
      {
        path: 'home',
        component: HomeComponent,
        data: {
          title: 'Home Page'
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
