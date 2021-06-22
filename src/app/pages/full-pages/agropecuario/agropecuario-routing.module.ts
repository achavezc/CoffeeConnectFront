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
import { DiagnosticoComponent } from './operaciones/socio/finca/diagnostico/diagnostico.component';
import { DiagnosticoEditComponent } from './operaciones/socio/finca/diagnostico/diagnostico-edit/diagnostico-edit.component';

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
                path: 'socio/finca/list/:partner/:producer',
                component: FincaComponent,
                data: {
                    title: 'Listar Socio - Finca'
                }
            },
            {
                path: 'socio/finca/create/:partner/:producer',
                component: FincaEditComponent,
                data: {
                    title: 'Crear Socio - Finca'
                }
            },
            {
                path: 'socio/finca/update/:partner/:producer/:fincapartner',
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
                path: 'socio/proyectos/create/:partner',
                component: ProyectosEditComponent,
                data: {
                    title: 'Nuevo Proyecto'
                }
            },
            {
                path: 'socio/proyectos/update/:partner/:project',
                component: ProyectosEditComponent,
                data: {
                    title: 'Actualizar Proyecto'
                }
            },
            {
                path: 'socio/finca/inspeccion/list/:partner/:producer/:fincapartner',
                component: InspeccionComponent,
                data: {
                    title: 'Socio Finca - Inspecciones'
                }
            },
            {
                path: 'socio/finca/inspeccion/create/:partner/:producer/:fincapartner',
                component: InspeccionEditComponent,
                data: {
                    title: 'Socio Finca - Inspecciones'
                }
            },
            {
                path: 'socio/finca/inspeccion/update/:partner/:producer/:fincapartner/:internalinspection',
                component: InspeccionEditComponent,
                data: {
                    title: 'Socio Finca - Inspecciones'
                }
            },
            {
                path: 'socio/finca/diagnostico/list/:partner/:producer/:fincapartner',
                component: DiagnosticoComponent,
                data: {
                    title: 'Socio Finca - Diagnostico'
                }
            },
            {
                path: 'socio/finca/diagnostico/create/:partner/:producer/:fincapartner',
                component: DiagnosticoEditComponent,
                data: {
                    title: 'Socio Finca - Diagnostico'
                }
            },
            {
                path: 'socio/finca/diagnostico/update/:partner/:producer/:fincapartner/:diagnostic',
                component: DiagnosticoEditComponent,
                data: {
                    title: 'Socio Finca - Diagnostico'
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
