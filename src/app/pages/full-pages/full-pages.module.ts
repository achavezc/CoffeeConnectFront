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
import {UsersEditComponent} from "./users-edit/users-edit.component";
import { NgxDatatableModule } from "@swimlane/ngx-datatable";
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
  ],
  declarations: [
    InvoicePageComponent,
    UsersEditComponent
  ],
})
export class FullPagesModule {}
