import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SocioComponent } from './operaciones/socio/socio.component';
import { SocioEditComponent } from './operaciones/socio/socio-edit/socio-edit.component';
import { FincaComponent } from './operaciones/socio/finca/finca.component';
import { FincaEditComponent } from './operaciones/socio/finca/fincaedit/finca-edit.component';
import { CertificacionListComponent } from './operaciones/socio/finca/certificaciones/list/certificacion-list.component';
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
                    title: 'Listar Socio - Finca'
                }
            },
            {
                path: 'socio/finca/create',
                component: FincaEditComponent,
                data: {
                    title: 'Crear Socio - Finca'
                }
            },
            {
                path: 'socio/finca/update/:id',
                component: FincaEditComponent,
                data: {
                    title: 'Actualizar Socio - Finca'
                }
            },
            {
                path: 'socio/finca/certificaciones',
                component: CertificacionListComponent,
                data: {
                    title: 'Certificaciones - Lista'
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
