import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SocioComponent } from './operaciones/socio/socio.component';
import { SocioEditComponent } from './operaciones/socio/socio-edit/socio-edit.component';
import { FincaComponent } from './operaciones/socio/finca/finca.component';
import { FincaEditComponent } from './operaciones/socio/finca/fincaedit/finca-edit.component';
import { CertificacionListComponent } from './operaciones/socio/finca/certificaciones/list/certificacion-list.component';
import { CertificacionEditComponent } from './operaciones/socio/finca/certificaciones/edit/certificacion-edit.component';
import { ProyectosComponent } from './operaciones/socio/proyectos/proyectos.component';
import { ProyectosEditComponent } from './operaciones/socio/proyectos/proyectosedit/proyectos-edit.component';
import { InspeccionComponent } from './operaciones/socio/finca/inspeccion/inspeccion.component';
import { InspeccionEditComponent } from './operaciones/socio/finca/inspeccion/inspeccion-edit/inspeccion-edit.component';

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
            },
            {
                path: 'socio/finca/certificaciones/create',
                component: CertificacionEditComponent,
                data: {
                    title: 'Certificaciones - Crear'
                }
            },
            {
                path: 'socio/proyectos/list/:id',
                component: ProyectosComponent,
                data: {
                    title: 'Lista de Proyectos'
                }
            },
            {
                path: 'socio/proyectos/create',
                component: ProyectosEditComponent,
                data: {
                    title: 'Nuevo Proyecto'
                }
            },
            {
                path: 'socio/proyectos/update/:id',
                component: ProyectosEditComponent,
                data: {
                    title: 'Actualizar Proyecto'
                }
            },
            {
                path: 'socio/finca/inspeccion/list',
                component: InspeccionComponent,
                data: {
                    title: 'Socio Finca - Inspecciones'
                }
            },
            {
                path: 'socio/finca/inspeccion/create',
                component: InspeccionEditComponent,
                data: {
                    title: 'Socio Finca - Inspecciones'
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
