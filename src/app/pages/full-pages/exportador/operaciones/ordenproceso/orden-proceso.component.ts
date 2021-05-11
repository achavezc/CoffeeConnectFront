import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatatableComponent } from "@swimlane/ngx-datatable";

import { OrdenProcesoService } from '../../../../../services/orden-proceso.service';
import { DateUtil } from '../../../../../services/util/date-util';
import { ExcelService } from '../../../../../shared/util/excel.service';
import { HeaderExcel } from '../../../../../services/models/headerexcel.model';

@Component({
  selector: 'app-orden-proceso',
  templateUrl: './orden-proceso.component.html',
  styleUrls: ['./orden-proceso.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OrdenProcesoComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private router: Router,
    private ordenProcesoService: OrdenProcesoService,
    private excelService: ExcelService,
    private spinner: NgxSpinnerService) { }

  ordenProcesoForm: FormGroup;
  @ViewChild(DatatableComponent) tblOrdenProceso: DatatableComponent;
  listTiposProcesos = [];
  listEstados = [];
  selectedTipoProceso: any;
  selectedEstado: any;
  limitRef = 10;
  rows = [];
  selected = [];
  tempData = [];
  errorGeneral = { isError: false, msgError: '' };
  msgErrorGenerico = 'Ocurrio un error interno.';

  ngOnInit(): void {
    this.LoadForm();
  }

  LoadForm(): void {
    this.ordenProcesoForm = this.fb.group({
      nroOrden: [],
      ruc: [],
      nroContrato: [],
      empProcesadora: [],
      fechaInicial: [],
      fechaFinal: [],
      codCliente: [],
      cliente: [],
      tipoProceso: [],
      estado: []
    });
  }

  get f() {
    return this.ordenProcesoForm.controls;
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
    this.tblOrdenProceso.offset = 0;
  }

  getRequest(): any {
    const form = this.ordenProcesoForm.value;
    return {
      Numero: '',
      RucEmpresaProcesadora: '',
      NumeroContrato: '',
      RazonSocialEmpresaProcesadora: '',
      FechaInicio: '',
      FechaFinal: '',
      NumeroCliente: '',
      RazonSocialCliente: '',
      TipoProcesoId: '',
      EstadoId: '',
      EmpresaId: 0
    };
  }

  Buscar(xls?: any): void {
    if (!this.ordenProcesoForm.invalid && !this.errorGeneral.isError) {
      this.spinner.show();
      const request = this.getRequest();
      this.ordenProcesoService.Search(request).subscribe((res: any) => {
        this.spinner.hide();
        if (res.Result.Success) {
          this.errorGeneral = { isError: false, msgError: '' };
          if (!xls) {
            this.rows = res.Result.Data;
            this.tempData = this.rows;
          } else {
            // const vArrHeaderExcel = [
            //   new HeaderExcel("Contrato", "center"),
            //   new HeaderExcel("Fecha de Contrato", 'center', 'yyyy-MM-dd'),
            //   new HeaderExcel("Id Cliente"),
            //   new HeaderExcel("Cliente"),
            //   new HeaderExcel("Producto"),
            //   new HeaderExcel("Tipo de Producción"),
            //   new HeaderExcel("Calidad"),
            //   new HeaderExcel("Estado", "center")
            // ];

            // let vArrData: any[] = [];
            // this.tempData.forEach((x: any) => vArrData.push([x.Numero, x.FechaEmbarque, x.ClienteId, x.Cliente, x.Producto, x.TipoProduccion, x.Calidad, x.Estado]));
            // this.excelService.ExportJSONAsExcel(vArrHeaderExcel, vArrData, 'Contratos');
          }
        } else {
          this.errorGeneral = { isError: true, msgError: res.Result.Message };
        }
      }, (err: any) => {
        this.spinner.hide();
        console.log(err);
        this.errorGeneral = { isError: true, msgError: this.msgErrorGenerico };
      });
    } else {

    }
  }

  Nuevo(): void {
    this.router.navigate(['/exportador/operaciones/ordenproceso/create']);
  }

}
