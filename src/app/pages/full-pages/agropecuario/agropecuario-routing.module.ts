import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SocioComponent } from './operaciones/socio/socio.component';
import { SocioEditComponent } from './operaciones/socio/socio-edit/socio-edit.component';
import { FincaComponent } from './operaciones/socio/finca/finca.component';
import { FincaEditComponent } from './operaciones/socio/finca/fincaedit/finca-edit.component';

const routes: Routes = [
    {
        path: 'operaciones',
        children: [
            {
                path: '',
                redirectTo: 'socio/list',
                pathMatch: 'full',
                data: {
                    title: 'Maestro de Socios'
                }
            },
            {
                path: 'socio/list',
                component: SocioComponent,
                data: {
                    title: 'Maestro de Socios'
                }
            },
            {
                path: 'socio/create',
                component: SocioEditComponent,
                data: {
                    title: 'Socio'
                }
            },
            {
                path: 'socio/update/:id',
                component: SocioEditComponent,
                data: {
                    title: 'Socio'
                }
            },
            {
                path: 'socio/finca/list/:id',
                component: FincaComponent,
                data: {
                    title: 'Socio'
                }
            },
            {
                path: 'socio/finca/create',
                component: FincaEditComponent,
                data: {
                    title: 'Socio'
                }
            },
            {
                path: 'socio/finca/update/:id',
                component: FincaEditComponent,
                data: {
                    title: 'Socio'
                }
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class AgropecuarioRoutingModule { }
