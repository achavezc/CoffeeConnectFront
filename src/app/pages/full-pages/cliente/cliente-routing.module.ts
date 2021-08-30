import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ContratoClienteComponent} from '../cliente/contrato/contrato-list/contrato.component';

import {ContratoEditComponent} from '../cliente/contrato/contrato-edit/contrato-edit.component';

const routes: Routes = [
    {
        path: '',
        children: [
           
            {
                path: 'contrato/list',
                component: ContratoClienteComponent,
                data: {
                    title: 'Contrato Cliente List'
                }
            },
            {
                path: 'contrato/edit',
                component: ContratoEditComponent,
                data: {
                    title: 'Contrato Cliente Edit'
                }
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ContratoRoutingModule { }

