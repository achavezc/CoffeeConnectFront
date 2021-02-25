import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SocioComponent } from './socio/socio.component';

const routes: Routes = [
    {
        path: 'agropecuario',
        children: [
            {
                path: 'socio-list',
                component: SocioComponent,
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
export class AgropecuarioRoutingModule { }
