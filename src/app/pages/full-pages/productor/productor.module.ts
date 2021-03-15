import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { ProductorRoutingModule } from './productor-routing.module';
import { PipeModule } from "../../../shared/pipes/pipe.module";
import { MatchHeightModule } from "../../../shared/directives/match-height.directive";
import { NgbDateCustomParserFormatter } from "../../../shared/util/NgbDateCustomParserFormatter";

import { ProductorComponent } from './administracion/maestroproductor/productor.component';
import { ProductorEditComponent } from './administracion/maestroproductor/productor-edit/productor-edit.component';
import { FincaComponent } from './administracion/maestroproductor/finca/finca.component';
import { FincaEditComponent } from './administracion/maestroproductor/finca/fincaedit/finca-edit.component';

@NgModule({
  declarations: [ProductorComponent, ProductorEditComponent, FincaComponent, FincaEditComponent],
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
    ProductorRoutingModule
  ],
  providers: [
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter }
  ]
})
export class ProductorModule { }
