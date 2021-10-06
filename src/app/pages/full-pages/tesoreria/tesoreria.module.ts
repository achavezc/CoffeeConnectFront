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
import { TesoreriaRoutingModule } from './tesoreria-routing.module';
import { PipeModule } from "../../../shared/pipes/pipe.module";
import { MatchHeightModule } from "../../../shared/directives/match-height.directive";
import { NgbDateCustomParserFormatter } from "../../../shared/util/NgbDateCustomParserFormatter";
import { FileUploadModule } from 'ng2-file-upload';
import { AdelantoComponent } from './adelanto/list/adelanto.component';
import { AdelantoEditComponent } from './adelanto/edit/adelanto-edit.component';
import { AcopioModule } from '../acopio/acopio.module';
import { AgropecuarioModule } from '../agropecuario/agropecuario.module';
import { NotaCompraEditComponent } from '../tesoreria/notacompra/notacompra-edit/nota-compra-edit.component';
import { NotacompraListComponent } from '../tesoreria/notacompra/notacompra-list.component';

@NgModule({
  declarations: [
    AdelantoComponent,
    AdelantoEditComponent,
    NotaCompraEditComponent,
    NotacompraListComponent
    //NotacompraListComponent
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
    TesoreriaRoutingModule,
    FileUploadModule,
    AcopioModule,
    AgropecuarioModule
  ],
  exports:
  [
    NotacompraListComponent
  ],
  providers: [
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter }
  ]
})
export class TesoreriaModule { }
