import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ChartistModule } from "ng-chartist";
import { AgmCoreModule } from "@agm/core";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgSelectModule } from "@ng-select/ng-select";
import { SwiperModule } from "ngx-swiper-wrapper";
import { CustomFormsModule } from 'ngx-custom-validators';
import { ArchwizardModule } from 'angular-archwizard';
import { UiSwitchModule } from 'ngx-ui-switch';
import { TagInputModule } from 'ngx-chips';
import { QuillModule } from 'ngx-quill'
import { NgxDatatableModule } from "@swimlane/ngx-datatable";
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ExportadorRoutingModule } from "./exportador-routing.module";
import { PipeModule } from "../../../shared/pipes/pipe.module";
import { MatchHeightModule } from "../../../shared/directives/match-height.directive";
import { NgbDateCustomParserFormatter } from "../../../shared/util/NgbDateCustomParserFormatter";

import { ClienteComponent } from './operaciones/cliente/cliente.component';
import { ContratoComponent } from './operaciones/contrato/contrato.component';
import { ClienteEditComponent } from './operaciones/cliente/cliente-edit/cliente-edit.component';
import { ContratoEditComponent } from './operaciones/contrato/contrato-edit/contrato-edit.component';
import { OrdenProcesoComponent } from './operaciones/ordenproceso/orden-proceso.component';
import { OrdenProcesoEditComponent } from './operaciones/ordenproceso/ordenproceso-edit/orden-proceso-edit.component';
import {PreciosDiaComponent} from './operaciones/preciosdia/preciosdia-list/preciosdia-list.component';
import { ModalModule } from '../modals/modal.module'


@NgModule({
  declarations: [
    ClienteComponent,
    ContratoComponent,
    ClienteEditComponent,
    ContratoEditComponent,
    OrdenProcesoComponent,
    OrdenProcesoEditComponent,
    PreciosDiaComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
    NgxDatatableModule,
    ChartistModule,
    AgmCoreModule,
    NgSelectModule,
    NgbModule,
    SwiperModule,
    CustomFormsModule,
    ArchwizardModule,
    UiSwitchModule,
    TagInputModule,
    QuillModule,
    PipeModule,
    MatchHeightModule,
    ExportadorRoutingModule,
    ModalModule
  ],
  exports: [
    ContratoEditComponent,
    OrdenProcesoEditComponent,
    PreciosDiaComponent
  ],
  providers: [
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter }
  ]
})
export class ExportadorModule { }
