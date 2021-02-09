import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InvoicePageComponent } from "./invoice/invoice-page.component";
import {UsersEditComponent} from "./users-edit/users-edit.component";

const routes: Routes = [
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
        path: 'user-edit',
        component: UsersEditComponent,
        data: {
          title: 'User Edit'
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
