import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';

import { DateUtil } from '../../../../services/util/date-util';
import { ClienteService } from '../../../../services/cliente.service';
import { MaestroUtil } from '../../../../services/util/maestro-util';
import { MaestroService } from '../../../../services/maestro.service';
import { ExcelService } from '../../../../shared/util/excel.service';

@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.component.html',
  styleUrls: ['./cliente.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ClienteComponent implements OnInit {

  constructor(private fb: FormBuilder, private dateUtil: DateUtil,
    private clienteService: ClienteService,
    private spinner: NgxSpinnerService,
    private maestroUtil: MaestroUtil,
    private maestroService: MaestroService,
    private router: Router,
    private excelService: ExcelService) { }

  clienteForm: FormGroup;
  listTipoCliente: [] = [];
  listPais: [] = [];
  listEstados: [] = [];
  selectedTipoCliente: any;
  selectedPais: any;
  selectedEstado: any;
  selected: any;
  limitRef: number = 10;
  rows: [] = [];
  tempData: [] = [];
  errorGeneral = { isError: false, msgError: '' };
  msgErrorGenerico = 'Ocurrio un error interno.';

  ngOnInit(): void {
    this.LoadForm();
    this.LoadCombos();
    this.clienteForm.controls['fechaInicial'].setValue(this.dateUtil.currentDate());
    this.clienteForm.controls['fechaFinal'].setValue(this.dateUtil.currentMonthAgo());
  }

  LoadForm(): void {
    this.clienteForm = this.fb.group({
      codCliente: [''],
      ruc: [''],
      fechaInicial: ['', Validators.required],
      fechaFinal: ['', Validators.required],
      descCliente: [''],
      tipoCliente: [''],
      pais: [],
      estado: ['', Validators.required]
    });
  }

  get f() {
    return this.clienteForm.controls;
  }

  LoadCombos(): void {
    this.GetListEstados();
    this.GetListTiposClientes();
  }

  async GetListEstados() {
    let form = this;
    let res = await this.maestroService.obtenerMaestros('EstadoMaestro').toPromise();
    if (res.Result.Success) {
      form.listEstados = res.Result.Data;
    }
  }

  async GetListTiposClientes() {
    let res = await this.maestroService.obtenerMaestros('TipoCliente').toPromise();
    if (res.Result.Success) {
      this.listTipoCliente = res.Result.Data;
    }
  }

  updateLimit(event: any): void {

  }

  filterUpdate(event: any): void {

  }

  getRequest(): any {
    return {
      Numero: this.clienteForm.value.codCliente ?? '',
      RazonSocial: this.clienteForm.value.descCliente ?? '',
      TipoClienteId: this.clienteForm.value.tipoCliente ?? '',
      Ruc: this.clienteForm.value.ruc ?? '',
      EstadoId: this.clienteForm.value.estado ?? '',
      PaisId: this.clienteForm.value.pais ?? 0,
      FechaInicio: this.clienteForm.value.fechaInicial ?? '',
      FechaFin: this.clienteForm.value.fechaFinal ?? ''
    };
  }

  Search(xls = false): void {
    if (!this.clienteForm.invalid && !this.errorGeneral.isError) {
      this.spinner.show();
      const request = this.getRequest();
      this.clienteService.Search(request).subscribe((res: any) => {
        this.spinner.hide();
        if (res.Result.Success) {
          this.errorGeneral = { isError: false, msgError: '' };
          if (!xls) {
            this.rows = res.Result.Data;
            this.tempData = this.rows;
          } else {
            // vArrHeaderExcel = [
            //   new HeaderExcel("Número Guia", "center"),
            //   new HeaderExcel("Código Socio", "center"),
            //   new HeaderExcel("Tipo Documento", "center"),
            //   new HeaderExcel("Número Documento", "right", "#"),
            //   new HeaderExcel("Nombre o Razón Social"),
            //   new HeaderExcel("Fecha Registro", "center", "dd/mm/yyyy"),
            //   new HeaderExcel("Estado", "center")
            // ];

            let vArrData: any[] = [];
            this.tempData.forEach((x: any) => vArrData.push([x.Numero, x.Codigo]));
            this.excelService.ExportJSONAsExcel([], vArrData, 'Clientes');
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

  Buscar(): void {
    this.Search();
  }

  Exportar(): void {
    this.Search(true);
  }

  Anular(): void {

  }

  Nuevo(): void {
    this.router.navigate(['/exportador/cliente/create']);
  }

}
