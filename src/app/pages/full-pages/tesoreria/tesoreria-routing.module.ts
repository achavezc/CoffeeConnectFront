import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdelantoComponent } from '../tesoreria/adelanto/list/adelanto.component';

import { AdelantoEditComponent } from '../tesoreria/adelanto/edit/adelanto-edit.component';

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
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class TesoreriaRoutingModule { }

