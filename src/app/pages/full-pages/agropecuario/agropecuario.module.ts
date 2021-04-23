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
import { AgropecuarioRoutingModule } from './agropecuario-routing.module';
import { PipeModule } from "../../../shared/pipes/pipe.module";
import { MatchHeightModule } from "../../../shared/directives/match-height.directive";
import { NgbDateCustomParserFormatter } from "../../../shared/util/NgbDateCustomParserFormatter";
import { FileUploadModule } from 'ng2-file-upload';
import { SocioComponent } from './operaciones/socio/socio.component';
import { SocioEditComponent } from './operaciones/socio/socio-edit/socio-edit.component';
import { FincaComponent } from './operaciones/socio/finca/finca.component';
import { FincaEditComponent } from './operaciones/socio/finca/fincaedit/finca-edit.component';
import { CertificacionListComponent } from './operaciones/socio/finca/certificaciones/list/certificacion-list.component';
import { CertificacionEditComponent } from './operaciones/socio/finca/certificaciones/edit/certificacion-edit.component';
import { ProyectosComponent } from './operaciones/socio/proyectos/proyectos.component';
import { ProyectosEditComponent } from './operaciones/socio/proyectos/proyectos-edit/proyectos-edit.component';
@NgModule({
  declarations: [SocioComponent, SocioEditComponent, FincaComponent, FincaEditComponent, CertificacionListComponent,CertificacionEditComponent, ProyectosComponent, ProyectosEditComponent],
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
    AgropecuarioRoutingModule,
    FileUploadModule
  ],
  providers: [
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter }
  ]
})
export class AgropecuarioModule { }
