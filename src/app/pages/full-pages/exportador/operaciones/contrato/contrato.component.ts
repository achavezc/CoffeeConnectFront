import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { Router } from '@angular/router';

import { DateUtil } from '../../../../../services/util/date-util';
import { ExcelService } from '../../../../../shared/util/excel.service';
import { HeaderExcel } from '../../../../../services/models/headerexcel.model';
import { MaestroUtil } from '../../../../../services/util/maestro-util';
import { ContratoService } from '../../../../../services/contrato.service';

@Component({
  selector: 'app-contrato',
  templateUrl: './contrato.component.html',
  styleUrls: ['./contrato.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ContratoComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private dateUtil: DateUtil,
    private spinner: NgxSpinnerService,
    private excelService: ExcelService,
    private maestroUtil: MaestroUtil,
    private contratoService: ContratoService,
    private router: Router) { }

  contratoForm: FormGroup;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  listProductos: any[];
  listTipoProduccion: any[];
  listCalidad: any[];
  listEstados: any[];
  selectedProducto: any;
  selectedTipoProduccion: any;
  selectedCalidad: any;
  selectedEstado: any;
  selected = [];
  limitRef = 10;
  rows = [];
  tempData = [];
  errorGeneral = { isError: false, msgError: '' };
  msgErrorGenerico = 'Ocurrio un error interno.';
  userSession: any;

  ngOnInit(): void {
    this.userSession = JSON.parse(localStorage.getItem('user'));
    this.LoadForm();
    this.LoadCombos();
    this.contratoForm.controls['fechaInicial'].setValue(this.dateUtil.currentMonthAgo());
    this.contratoForm.controls['fechaFinal'].setValue(this.dateUtil.currentDate());
  }

  LoadForm(): void {
    this.contratoForm = this.fb.group({
      nroContrato: [],
      codCliente: [],
      fechaInicial: [, Validators.required],
      fechaFinal: [, Validators.required],
      descCliente: [],
      producto: [],
      tipoProduccion: [],
      calidad: [],
      estado: []
    });
  }

  get f() {
    return this.contratoForm.controls;
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
    this.table.offset = 0;
  }

  onSelectCheck(row: any) {
    return this.selected.indexOf(row) === -1;
  }

  LoadCombos(): void {
    const form = this;
    this.maestroUtil.obtenerMaestros('EstadoMaestro', (res: any) => {
      if (res.Result.Success) {
        form.listEstados = res.Result.Data;
      }
    });
    this.maestroUtil.obtenerMaestros('Producto', (res: any) => {
      if (res.Result.Success) {
        form.listProductos = res.Result.Data;
      }
    });
    this.maestroUtil.obtenerMaestros('TipoProduccion', (res: any) => {
      if (res.Result.Success) {
        form.listTipoProduccion = res.Result.Data;
      }
    });
    this.maestroUtil.obtenerMaestros('Calidad', (res: any) => {
      if (res.Result.Success) {
        form.listCalidad = res.Result.Data;
      }
    });
  }

  getRequest(): any {
    return {
      Numero: this.contratoForm.value.nroContrato ? this.contratoForm.value.nroContrato : '',
      NumeroCliente: this.contratoForm.value.codCliente ? this.contratoForm.value.codCliente : '',
      RazonSocial: this.contratoForm.value.descCliente ? this.contratoForm.value.descCliente : '',
      ProductoId: this.contratoForm.value.producto ? this.contratoForm.value.producto : '',
      TipoProduccionId: this.contratoForm.value.tipoProduccion ? this.contratoForm.value.tipoProduccion : '',
      CalidadId: this.contratoForm.value.calidad ? this.contratoForm.value.calidad : '',
      EstadoId: this.contratoForm.value.estado ? this.contratoForm.value.estado : '',
      EmpresaId: this.userSession.Result.Data.EmpresaId,
      FechaInicio: this.contratoForm.value.fechaInicial ? this.contratoForm.value.fechaInicial : '',
      FechaFin: this.contratoForm.value.fechaFinal ? this.contratoForm.value.fechaFinal : ''
    };
  }

  Buscar(): void {
    this.Search();
  }

  Search(xls = false): void {
    if (!this.contratoForm.invalid && !this.errorGeneral.isError) {
      this.spinner.show();
      const request = this.getRequest();
      this.contratoService.Search(request).subscribe((res: any) => {
        this.spinner.hide();
        if (res.Result.Success) {
          this.errorGeneral = { isError: false, msgError: '' };
          if (!xls) {
            res.Result.Data.forEach((obj: any) => {
              obj.FechaEmbarqueString = this.dateUtil.formatDate(new Date(obj.FechaEmbarque));
            });
            this.rows = res.Result.Data;
            this.tempData = this.rows;
          } else {
            const vArrHeaderExcel = [
              new HeaderExcel("Contrato", "center"),
              new HeaderExcel("Fecha de Contrato", 'center', 'yyyy-MM-dd'),
              new HeaderExcel("Id Cliente"),
              new HeaderExcel("Cliente"),
              new HeaderExcel("Producto"),
              new HeaderExcel("Tipo de Producción"),
              new HeaderExcel("Calidad"),
              new HeaderExcel("Estado", "center")
            ];

            let vArrData: any[] = [];
            this.tempData.forEach((x: any) => vArrData.push([x.Numero, x.FechaEmbarque, x.ClienteId, x.Cliente, x.Producto, x.TipoProduccion, x.Calidad, x.Estado]));
            this.excelService.ExportJSONAsExcel(vArrHeaderExcel, vArrData, 'Contratos');
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
    this.router.navigate(['/exportador/operaciones/contrato/create'])
  }
}
