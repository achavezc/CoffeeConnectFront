import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {ContratoClienteComponent} from '../cliente/contrato/contrato-list/contrato.component';


const routes: Routes = [
    {
        path: '',
        children: [
           
            {
                path: 'contrato/list',
                component: ContratoClienteComponent,
                data: {
                    title: 'Maestro de Socios'
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
