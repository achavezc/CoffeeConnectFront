import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { DatatableComponent } from "@swimlane/ngx-datatable";
import swal from 'sweetalert2';
import { DateUtil } from '../../../../../services/util/date-util';
import { ClienteService } from '../../../../../services/cliente.service';
import { MaestroService } from '../../../../../services/maestro.service';
import { ExcelService } from '../../../../../shared/util/excel.service';
import { HeaderExcel } from '../../../../../services/models/headerexcel.model';
import { MaestroUtil } from '../../../../../services/util/maestro-util';
import { ILogin } from '../../../../../services/models/login';
import { AlertUtil } from '../../../../../services/util/alert-util';
import {AuthService} from './../../../../../services/auth.service';

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
    private maestroService: MaestroService,
    private router: Router,
    private excelService: ExcelService,
    private maestroUtil: MaestroUtil,
    private alertUtil: AlertUtil,
    private authService : AuthService) { }

  clienteForm: FormGroup;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  listTipoCliente: [] = [];
  listPais: [] = [];
  listEstados: [] = [];
  selectedTipoCliente: any;
  selectedPais: any;
  selectedEstado: any;
  selected = [];
  limitRef: number = 10;
  rows = [];
  tempData = [];
  errorGeneral = { isError: false, msgError: '' };
  msgErrorGenerico = 'Ocurrio un error interno.';
  login: ILogin;
  userSession: any;
  readonly: boolean;
  tipoEmpresaId = '';

  ngOnInit(): void {
    this.userSession = JSON.parse(localStorage.getItem('user'));
    
    this.tipoEmpresaId = this.userSession.Result.Data.TipoEmpresaid;
    this.LoadForm();
    this.LoadCombos();
    this.login = JSON.parse(localStorage.getItem("user"));
    this.clienteForm.controls['fechaInicial'].setValue(this.dateUtil.currentMonthAgo());
    this.clienteForm.controls['fechaFinal'].setValue(this.dateUtil.currentDate());
    this.readonly= this.authService.esReadOnly(this.userSession.Result.Data.OpcionesEscritura);
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
    this.maestroUtil.GetPais((res: any) => {
      if (res.Result.Success) {
        this.listPais = res.Result.Data;
      }
    });
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

  getRequest(): any {
    return {
      Numero: this.clienteForm.value.codCliente ?? '',
      RazonSocial: this.clienteForm.value.descCliente ?? '',
      TipoClienteId: this.clienteForm.value.tipoCliente ?? '',
      Ruc: this.clienteForm.value.ruc ?? '',
      EstadoId: this.clienteForm.value.estado ?? '',
      PaisId: this.clienteForm.value.pais ?? 0,
      FechaInicio: this.clienteForm.value.fechaInicial ?? '',
      FechaFin: this.clienteForm.value.fechaFinal ?? '',
      EmpresaId: this.login.Result.Data.EmpresaId
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
            const vArrHeaderExcel = [
              new HeaderExcel("Código Cliente", "center"),
              new HeaderExcel("Tipo Cliente"),
              new HeaderExcel("RUC", "center"),
              new HeaderExcel("Razón Social"),
              new HeaderExcel("Dirección"),
              new HeaderExcel("País"),
              new HeaderExcel("Departamento"),
              new HeaderExcel("Provincia"),
              new HeaderExcel("Distrito"),
              new HeaderExcel("Código Interno"),
              new HeaderExcel("Estado", "center")
            ];

            let vArrData: any[] = [];
            this.tempData.forEach((x: any) => vArrData.push([x.Numero, x.TipoCliente, x.Ruc, x.RazonSocial, x.Direccion, x.Pais,x.Departamento,x.Provincia,x.Distrito,x.CodigoInterno,x.Estado]));
            this.excelService.ExportJSONAsExcel(vArrHeaderExcel, vArrData, 'Clientes');
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
    this.spinner.show();
    const form = this;
    swal.fire({
      title: 'Confirmación',
      text: `¿Está seguro de exportar la información mostrada?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2F8BE6',
      cancelButtonColor: '#F55252',
      confirmButtonText: 'Si',
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger ml-1'
      },
      buttonsStyling: false,
    }).then(function (result) {
      if (result.value) {
        form.Search(true);
        form.spinner.hide();
      }
    });
  }

  Anular(): void {
    if (this.selected.length > 0) {
      const form = this;
      swal.fire({
        title: 'Confirmación',
        text: `¿Está seguro de anular el cliente "${form.selected[0].RazonSocial}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#2F8BE6',
        cancelButtonColor: '#F55252',
        confirmButtonText: 'Si',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-danger ml-1'
        },
        buttonsStyling: false,
      }).then(function (result) {
        if (result.value) {
          form.CancelClient();
        }
      });
    }
  }

  Nuevo(): void {
    this.router.navigate(['/exportador/operaciones/cliente/create']);
  }

  CancelClient(): void {
    this.spinner.show();
    this.errorGeneral = { isError: false, msgError: '' };
    this.clienteService.Cancel({ ClienteId: this.selected[0].ClienteId, Usuario: this.userSession.Result.Data.NombreUsuario })
      .subscribe((res: any) => {
        this.spinner.hide();
        if (res.Result.Success) {
          this.alertUtil.alertOkCallback('CONFIRMACIÓN', 'Cliente anulado correctamente.', () => {
            this.Buscar();
          });
        } else {
          this.errorGeneral = { isError: true, msgError: res.Result.Message };
        }
      }, (err: any) => {
        this.errorGeneral = { isError: true, msgError: this.msgErrorGenerico };
        console.log(err);
        this.spinner.hide();
      })
  }
}
