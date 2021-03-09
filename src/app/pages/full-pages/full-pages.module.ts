import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { FullPagesRoutingModule } from "./full-pages-routing.module";
import { ChartistModule } from "ng-chartist";
import { AgmCoreModule } from "@agm/core";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { NgSelectModule } from "@ng-select/ng-select";
import { SwiperModule } from "ngx-swiper-wrapper";
import { InvoicePageComponent } from "./invoice/invoice-page.component";
import { NgxDatatableModule } from "@swimlane/ngx-datatable";
import { AcopioModule } from "./acopio/acopio.module";
import { ProductorModule } from './productor/productor.module';
import { AgropecuarioModule } from './agropecuario/agropecuario.module';
import { MConsultarProductorComponent } from './modals/consultarproductor/m-consultar-productor.component';
import { ListFilterPipe } from '../../shared/pipes/listFilter.pipe';

@NgModule({
  imports: [
    CommonModule,
    FullPagesRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    ChartistModule,
    AgmCoreModule,
    NgSelectModule,
    NgbModule,
    SwiperModule,
    NgxDatatableModule,
    AcopioModule,
    ProductorModule,
    AgropecuarioModule
  ],
  declarations: [
    InvoicePageComponent,
    MConsultarProductorComponent,
    ListFilterPipe
  ],
  // entryComponents: [
  //   MConsultarProductorComponent
  // ]
})
export class FullPagesModule { }
