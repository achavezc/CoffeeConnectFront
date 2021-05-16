import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { PlantaRoutingModule } from "./planta-routing.module";
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
import { NgxDatatableModule } from "@swimlane/ngx-datatable";
import { NgbDateCustomParserFormatter } from "../../../shared/util/NgbDateCustomParserFormatter";
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerModule } from 'ngx-spinner';

import { NotaIngresoListComponent } from "./operaciones/notaingreso/list/notaingreso-list.component";
import { NotaIngresoEditComponent } from "./operaciones/notaingreso/edit/notaingreso-edit.component";
import { NotaIngresoAlmacenListComponent } from './operaciones/notaingresoalmacen/list/notaingresoalmacen-list.component';
import {NotaIngresoAlmacenEditComponent} from './operaciones/notaingresoalmacen/edit/notaingresoalmacen-edit.component';
import { PesadoCafePlantaComponent } from "./operaciones/notaingreso/edit/pesadocafe/pesadocafeplanta.component";
import { ModalModule } from '../modals/modal.module'


@NgModule({
  imports: [

    CommonModule,
    PlantaRoutingModule,
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
    NgxSpinnerModule,
    ModalModule
  ],
  declarations: [

    NotaIngresoListComponent,
    NotaIngresoEditComponent,
    NotaIngresoAlmacenListComponent,
    NotaIngresoAlmacenEditComponent,
    PesadoCafePlantaComponent
  ],
  exports: [
    PesadoCafePlantaComponent
  ],
  providers: [
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter }
  ]
})
export class PlantaModule { }
