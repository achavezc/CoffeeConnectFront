import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { AcopioRoutingModule } from "./acopio-routing.module";
import { ChartistModule } from "ng-chartist";
import { AgmCoreModule } from "@agm/core";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgSelectModule } from "@ng-select/ng-select";
import { SwiperModule } from "ngx-swiper-wrapper";
import { PipeModule } from "../../../shared/pipes/pipe.module";
import { CustomFormsModule } from 'ngx-custom-validators';
import { ArchwizardModule } from 'angular-archwizard';
import { UiSwitchModule } from 'ngx-ui-switch';
import { TagInputModule } from 'ngx-chips';
import { QuillModule } from 'ngx-quill'
import { MatchHeightModule } from "../../../shared/directives/match-height.directive";

import { MateriaPrimaListComponent } from "./operaciones/materiaprima/materiaprima-list/materiaprima-list.component";
import { MateriaPrimaEditComponent } from "./operaciones/materiaprima/materiaprima-edit/materiaprima-edit.component";
import { PesadoCafeComponent } from "./operaciones/materiaprima/materiaprima-edit/pesadoCafe/pesadoCafe.component";
import { ControlCalidadComponent } from "./operaciones/materiaprima/materiaprima-edit/controlCalidad/seco/controlCalidad.component";
import { ControlCalidadComponentHumedo } from "./operaciones/materiaprima/materiaprima-edit/controlCalidad/humedo/controlCalidadHumedo.component";

import { NgxDatatableModule } from "@swimlane/ngx-datatable";

import { NgbDateCustomParserFormatter } from "../../../shared/util/NgbDateCustomParserFormatter";
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NotacompraListComponent } from './operaciones/notacompra/notacompra-list.component';
import { IngresoAlmacenComponent } from './operaciones/ingresoalmacen/ingreso-almacen.component';
import { LotesComponent } from './operaciones/lotes/lotes.component';
import { NotaSalidaComponent } from './operaciones/notasalida/nota-salida.component';
import { OrdenServicioComponent } from './operaciones/ordenservicio/orden-servicio.component';
import { ProductorComponent } from './operaciones/productor/productor.component';

@NgModule({
  imports: [
    CommonModule,
    AcopioRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    ChartistModule,
    AgmCoreModule,
    NgSelectModule,
    NgbModule,
    SwiperModule,
    PipeModule,
    NgxDatatableModule,
    CustomFormsModule,
    ArchwizardModule,
    UiSwitchModule,
    TagInputModule,
    QuillModule,
    MatchHeightModule,
    NgxSpinnerModule
  ],
  declarations: [
    MateriaPrimaListComponent,
    MateriaPrimaEditComponent,
    NotacompraListComponent,
    PesadoCafeComponent,
    ControlCalidadComponent,
    ControlCalidadComponentHumedo,
    IngresoAlmacenComponent,
    LotesComponent,
    NotaSalidaComponent,
    OrdenServicioComponent,
    ProductorComponent
  ],
  exports: [
    PesadoCafeComponent,
    ControlCalidadComponent,
    ControlCalidadComponentHumedo
  ],
  providers: [
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter }
  ]
})
export class AcopioModule { }
