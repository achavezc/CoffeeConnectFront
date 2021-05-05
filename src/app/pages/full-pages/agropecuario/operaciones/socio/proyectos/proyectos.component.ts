import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";

import { SocioProyectoService } from '../../../../../../services/socio-proyecto.service';

@Component({
  selector: 'app-proyectos',
  templateUrl: './proyectos.component.html',
  styleUrls: ['./proyectos.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProyectosComponent implements OnInit {

  limitRef = 10;
  rows = [];
  tempData: any[];
  selected: [];
  @ViewChild(DatatableComponent) tblData: DatatableComponent;
  vCodePartner: number;
  errorGeneral = { isError: false, errorMessage: '' }
  vMsgErrorGeneric = 'Ocurrio un error interno';

  constructor(private router: Router,
    private route: ActivatedRoute,
    private socioProyectoService: SocioProyectoService,
    private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.vCodePartner = this.route.snapshot.params["id"] ? Number(this.route.snapshot.params["id"]) : 0
    if (this.vCodePartner > 0) {
      this.SearchByPartnerId();
    } else {
      this.Cancel();
    }
  }

  New(): void {
    this.router.navigate([`/agropecuario/operaciones/socio/proyectos/create/${this.vCodePartner}`]);
  }

  updateLimit(event: any): void {

  }

  filterUpdate(event: any): void {

  }

  SearchByPartnerId(): void {
    this.spinner.show();
    this.socioProyectoService.SearchByPartnerId(this.vCodePartner).subscribe((res: any) => {
      this.spinner.hide();
      if (res.Result.Success) {
        this.errorGeneral = { isError: false, errorMessage: '' }
        this.rows = res.Result.Data;
        this.tempData = this.rows;
      } else {
        this.errorGeneral = { isError: true, errorMessage: res.Result.Message }
      }
    }, (err: any) => {
      this.spinner.hide();
      console.log(err);
      this.errorGeneral = { isError: true, errorMessage: this.vMsgErrorGeneric }
    });
  }

  Cancel(): void {
    this.router.navigate(['/agropecuario/operaciones/socio/list']);
  }
}
