import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";

import { SocioProyectoService } from '../../../../../../services/socio-proyecto.service';
import { DateUtil } from '../../../../../../services/util/date-util';

@Component({
  selector: 'app-proyectos',
  templateUrl: './proyectos.component.html',
  styleUrls: ['./proyectos.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProyectosComponent implements OnInit {

  limitRef = 10;
  rows = [];
  tempData = [];
  selected = [];
  @ViewChild(DatatableComponent) tblData: DatatableComponent;
  vCodePartner: number;
  errorGeneral = { isError: false, errorMessage: '' }
  vMsgErrorGeneric = 'Ocurrio un error interno';

  constructor(private router: Router,
    private route: ActivatedRoute,
    private socioProyectoService: SocioProyectoService,
    private spinner: NgxSpinnerService,
    private dateUtil: DateUtil) { }

  ngOnInit(): void {
    this.vCodePartner = this.route.snapshot.params["id"] ? Number(this.route.snapshot.params["id"]) : 0
    if (this.vCodePartner > 0) {
      this.SearchProjectsByPartner();
    } else {
      this.Cancel();
    }
  }

  New(): void {
    this.router.navigate([`/agropecuario/operaciones/socio/proyectos/create/${this.vCodePartner}`]);
  }

  updateLimit(event: any): void {
    this.limitRef = event.target.value;
  }

  filterUpdate(event: any): void {
    const val = event.target.value.toLowerCase();
    const temp = this.tempData.filter(function (d) {
      return d.Numero.toLowerCase().indexOf(val) !== -1 || !val;
    });
    this.rows = temp;
    this.tblData.offset = 0;
  }

  SearchProjectsByPartner(): void {
    this.spinner.show();
    this.socioProyectoService.SearchByPartnerId(this.vCodePartner)
      .subscribe((res: any) => {
        this.spinner.hide();
        if (res.Result.Success) {
          this.errorGeneral = { isError: false, errorMessage: '' };
          res.Result.Data.forEach((obj: any) => {
            obj.FechaRegistroString = this.dateUtil.formatDate(new Date(obj.FechaRegistro));
          });
          this.tempData = res.Result.Data;
          this.rows = [...this.tempData];
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
