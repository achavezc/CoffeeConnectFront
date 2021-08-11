import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ChartistModule } from "ng-chartist";
import { AgmCoreModule } from "@agm/core";
import { NgbActiveModal, NgbModule } from "@ng-bootstrap/ng-bootstrap";
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
import { MConsultarLotesComponent } from '../modals/consultarLotes/consultar-lotes.component'
import { MConsultarEmpresaComponent } from '../modals/consultarEmpresa/consultar-empresa.component';
import { MConsultarClienteComponent } from '../modals/consultarcliente/consultar-cliente.component';
import { MConsultarContratoComponent } from './consultarcontrato/consultar-contrato.component'
import { MapasFincaComponent } from '../modals/mapasfinca/mapas-finca.component';
import { MListaDocumentosComponent } from './listadocumentos/lista-documentos.component';
import { MAgregarArchivoComponent } from './agregararchivo/agregar-archivo.component';
import { MConsultarOrganizacionComponent } from '../modals/consultarOrganizacion/consultar-organizacion.component';
import { MAsignacionContratoAcopioComponent } from '../modals/asignacioncontratoacopio/asignacion-contrato-acopio.component';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
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
    MConsultarLotesComponent,
    MConsultarEmpresaComponent,
    MapasFincaComponent,
    MListaDocumentosComponent,
    MConsultarClienteComponent,
    MConsultarContratoComponent,
    MAgregarArchivoComponent,
    MConsultarOrganizacionComponent,
    MAsignacionContratoAcopioComponent
  ],
  exports: [
    MConsultarLotesComponent,
    MConsultarEmpresaComponent,
    MapasFincaComponent,
    MListaDocumentosComponent,
    MConsultarClienteComponent,
    MConsultarContratoComponent,
    MAgregarArchivoComponent,
    MConsultarOrganizacionComponent,
    MAsignacionContratoAcopioComponent
  ],
  providers: [
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter }
  ]
})
export class ModalModule { }
