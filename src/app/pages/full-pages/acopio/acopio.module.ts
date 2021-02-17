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

import { NgxDatatableModule } from "@swimlane/ngx-datatable";

import { NgbDateCustomParserFormatter } from "../../../shared/util/NgbDateCustomParserFormatter";
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NotacompraListComponent } from './operaciones/notacompra/notacompra-list/notacompra-list.component';
import { IngresoAlmacenComponent } from './operaciones/ingresoalmacen/ingreso-almacen.component';

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
    IngresoAlmacenComponent

  ],
  providers: [
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter }
  ]
})
export class AcopioModule { }
