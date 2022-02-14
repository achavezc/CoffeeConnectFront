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
import { PreciosDiaComponent } from './operaciones/preciosdia/preciosdia-list/preciosdia-list.component';
import { PrecioDiaEditComponent } from './operaciones/preciosdia/preciosdia-edit/preciosdia-edit.component';
import { TipoCambioDiaComponent } from './operaciones/tipocambiodia/tipocambiodia-list/tipocambiodia-list.component';
import { TipoCambioDiaEditComponent } from './operaciones/tipocambiodia/tipocambiodia-edit/tipocambiodia-edit.component';
import { ModalModule } from '../modals/modal.module'
import { AduanasComponent } from './operaciones/aduanas/list/aduanas.component';
import { AduanasEditComponent } from './operaciones/aduanas/edit/aduanas-edit.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { PreciodiaRendimientoComponent } from './operaciones/preciodia-rendimiento/preciodia-rendimiento.component';
import { PrecioDiaRendimientoEditComponent } from './operaciones/preciodia-rendimiento/edit/precio-dia-rendimiento-edit.component';
import {KardexProcesoComponent} from './operaciones/kardexproceso/kardex-proceso.component';
import {KardexProcesoEditComponent} from './operaciones/kardexproceso/edit/kardex-proceso-edit.component';
import { ContratoCompraComponent } from './operaciones/contratocompra/contratocompra.component';
import { ContratoCompraEditComponent } from './operaciones/contratocompra/contrato-edit/contratocompra-edit.component';


@NgModule({
  declarations: [
    ClienteComponent,
    ContratoComponent,
    ClienteEditComponent,
    ContratoEditComponent,
    OrdenProcesoComponent,
    OrdenProcesoEditComponent,
    PreciosDiaComponent,
    PrecioDiaEditComponent,
    TipoCambioDiaComponent,
    TipoCambioDiaEditComponent,
    AduanasComponent,
    AduanasEditComponent,
    PreciodiaRendimientoComponent,
    PrecioDiaRendimientoEditComponent,
    KardexProcesoComponent,
    KardexProcesoEditComponent,
    ContratoCompraComponent,
    ContratoCompraEditComponent
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
    ModalModule,
    NgMultiSelectDropDownModule.forRoot()
  ],
  exports: [
    ContratoEditComponent,
    OrdenProcesoComponent,
    OrdenProcesoEditComponent,
    PreciosDiaComponent,
    PrecioDiaEditComponent,
    TipoCambioDiaComponent,
    TipoCambioDiaEditComponent,
    AduanasComponent,
    AduanasEditComponent,
    ContratoComponent
  ],
  providers: [
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter }
  ]
})
export class ExportadorModule { }
