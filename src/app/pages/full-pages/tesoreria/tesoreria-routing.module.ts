import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdelantoComponent } from '../tesoreria/adelanto/list/adelanto.component';

import { AdelantoEditComponent } from '../tesoreria/adelanto/edit/adelanto-edit.component';
import {NotacompraListComponent} from '../tesoreria/notacompra/notacompra-list.component';
import{NotaCompraEditComponent} from '../tesoreria/notacompra/notacompra-edit/nota-compra-edit.component';

const routes: Routes = [
    {
        path: '',
        children: [

            {
                path: 'adelanto/list',
                component: AdelantoComponent,
                data: {
                    title: 'AdelantoList'
                }
            },
            {
                path: 'adelanto/edit',
                component: AdelantoEditComponent,
                data: {
                    title: 'AdelantoEdit'
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
              }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class TesoreriaRoutingModule { }

