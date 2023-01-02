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

import { ExportadorModule } from "../exportador/exportador.module";
import { NotaIngresoListComponent } from "./operaciones/notaingreso/list/notaingreso-list.component";
import { ControlCalidadListComponent } from "./operaciones/controlcalidad/list/controlcalidad-list.component";

import { OrdenProcesoListComponent } from './operaciones/ordenproceso/list/ordenproceso-list.component';
import { OrdenProcesoEditComponent } from './operaciones/ordenproceso/edit/ordenproceso-edit.component';


import { ServiciosListComponent } from './operaciones/Servicios/list/Servicios-list.component';
import { ServiciosEditComponent } from './operaciones/Servicios/edit/Servicios-edit.component';
import{ServicioPlantaeditComponent}from './operaciones/Servicios/ServicioPlantaPopup/ServicioPlanta-edit.component';


import { NotaIngresoEditComponent } from "./operaciones/notaingreso/edit/notaingreso-edit.component";
import{ControlCalidadEditComponent}from "./operaciones/controlcalidad/edit/controlcalidad-edit.component";
import { NotaIngresoAlmacenListComponent } from "./operaciones/notaingresoalmacen/list/notaingresoalmacen-list.component";
import { NotaIngresoAlmacenEditComponent } from './operaciones/notaingresoalmacen/edit/notaingresoalmacen-edit.component';
import{NotaIngresoProductoTerminadoListComponent}from './operaciones/NotaIngresoProductoTerninadoAlmacen/list/notaingresoproducto-list.component';
import{NotaIngresoProductoTerminadoEditComponent}from './operaciones/NotaIngresoProductoTerninadoAlmacen/edit/notaingresoproducto-edit.component';
import { PesadoCafePlantaComponent } from "./operaciones/notaingreso/edit/pesadocafe/pesadocafeplanta.component";
import { PesadoCafeCalidadPlantaComponent } from "./operaciones/controlcalidad/edit/pesadocafe/pesadocafecalidadplanta.component";
import { ModalModule } from '../modals/modal.module';
import { AcopioModule } from '../acopio/acopio.module';
import { NotaSalidaAlmacenComponent } from './operaciones/notasalidaalmacen/list/notasalidaplanta-list.component';
import { NotaSalidaPlantaEditComponent } from './operaciones/notasalidaalmacen/edit/notasalidaplanta-edit.component';
import { TagNotaSalidaPlantaEditComponent } from './operaciones/notasalidaalmacen/edit/tags/notasalidaplanta-tag.component';
import { LiquidacionProcesoComponent } from './operaciones/liquidacionproceso/list/liquidacionproceso-list.component';
import { LiquidacionProcesoEditComponent } from './operaciones/liquidacionproceso/edit/liquidacionproceso-edit.component';


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
    ModalModule,
    AcopioModule,
    ExportadorModule
  ],

  declarations: [
    OrdenProcesoListComponent,
    ServiciosListComponent,
    ServicioPlantaeditComponent,
    ServiciosEditComponent,
    OrdenProcesoEditComponent,
    NotaIngresoListComponent,
    ControlCalidadListComponent, 
    NotaIngresoEditComponent,
    ControlCalidadEditComponent,
    NotaIngresoAlmacenListComponent,
    NotaIngresoAlmacenEditComponent,
    NotaIngresoProductoTerminadoListComponent,
    NotaIngresoProductoTerminadoEditComponent,
    PesadoCafePlantaComponent,
    PesadoCafeCalidadPlantaComponent,

    NotaSalidaAlmacenComponent,
    NotaSalidaPlantaEditComponent,
    TagNotaSalidaPlantaEditComponent,
    LiquidacionProcesoComponent,
    LiquidacionProcesoEditComponent
  ],
  exports: [
    PesadoCafePlantaComponent,NotaIngresoListComponent
  ],
  providers: [
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter }
  ]
})
export class PlantaModule { }
