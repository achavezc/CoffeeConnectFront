import { Component, OnInit, ViewChild, ViewEncapsulation, Input, EventEmitter, Output } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatatableComponent } from "@swimlane/ngx-datatable";
import swal from 'sweetalert2';

import { OrdenProcesoService } from '../../../../../services/orden-proceso.service';
import { DateUtil } from '../../../../../services/util/date-util';
import { ExcelService } from '../../../../../shared/util/excel.service';
import { HeaderExcel } from '../../../../../services/models/headerexcel.model';
import { MaestroUtil } from '../../../../../services/util/maestro-util';
import { AlertUtil } from '../../../../../services/util/alert-util';
import { host } from '../../../../../shared/hosts/main.host';

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
    private spinner: NgxSpinnerService,
    private dateUtil: DateUtil,
    private maestroUtil: MaestroUtil,
    private alertUtil: AlertUtil) {
    this.singleSelectCheck = this.singleSelectCheck.bind(this);
  }

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
  userSession: any;
  @Input() popUp = false;
  @Output() agregarEvent = new EventEmitter<any>();

  ngOnInit(): void {
    this.userSession = JSON.parse(localStorage.getItem('user'));
    this.LoadForm();
    this.ordenProcesoForm.controls.fechaFinal.setValue(this.dateUtil.currentDate());
    this.ordenProcesoForm.controls.fechaInicial.setValue(this.dateUtil.currentMonthAgo());
    this.LoadCombos();
  }

  LoadForm(): void {
    this.ordenProcesoForm = this.fb.group({
      nroOrden: [],
      ruc: [],
      nroContrato: [],
      empProcesadora: [],
      fechaInicial: ['', Validators.required],
      fechaFinal: ['', Validators.required],
      codCliente: [],
      cliente: [],
      tipoProceso: [],
      estado: ['', Validators.required]
    });
  }

  get f() {
    return this.ordenProcesoForm.controls;
  }

  LoadCombos(): void {
    this.maestroUtil.obtenerMaestros('EstadoMaestro', (res: any) => {
      if (res.Result.Success) {
        this.listEstados = res.Result.Data;
      }
    });
  }

  singleSelectCheck(row: any) {
    return this.selected.indexOf(row) === -1;
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
      Numero: form.nroOrden ? form.nroOrden : '',
      RucEmpresaProcesadora: form.ruc ? form.ruc : '',
      NumeroContrato: form.nroContrato ? form.nroContrato : '',
      RazonSocialEmpresaProcesadora: form.empProcesadora ? form.empProcesadora : '',
      FechaInicio: form.fechaInicial ? form.fechaInicial : '',
      FechaFinal: form.fechaFinal ? form.fechaFinal : '',
      NumeroCliente: form.codCliente ? form.codCliente : '',
      RazonSocialCliente: form.cliente ? form.cliente : '',
      TipoProcesoId: form.tipoProceso ? form.tipoProceso : '',
      EstadoId: form.estado ? form.estado : '',
      EmpresaId: this.userSession.Result.Data.EmpresaId
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
            res.Result.Data.forEach((obj: any) => {
              obj.FechaRegistroString = this.dateUtil.formatDate(new Date(obj.FechaRegistro));
            });
            this.rows = res.Result.Data;
            this.tempData = this.rows;
          } else {
            const vArrHeaderExcel = [
              new HeaderExcel("N° ORDEN", "center"),
              new HeaderExcel("N° CONTRATO", 'center'),
              new HeaderExcel("CÓDIGO", "center"),
              new HeaderExcel("CLIENTE"),
              new HeaderExcel("RUC", "center"),
              new HeaderExcel("EMPRESA PROCESADORA"),
              new HeaderExcel("TIPO PROCESO"),
              new HeaderExcel("FECHA REGISTRO", "center", 'yyyy-MM-dd'),
              new HeaderExcel("Estado", "center")
            ];

            let vArrData: any[] = [];
            this.tempData.forEach((x: any) => vArrData.push([x.Numero, x.NumeroContrato,
            x.NumeroCliente, x.Cliente, x.Ruc, x.RazonSocialEmpresaProcesadora,
            x.TipoProceso, x.FechaRegistro, x.Estado]));
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
    this.router.navigate(['/exportador/operaciones/ordenproceso/create']);
  }

  Anular(): void {
    swal.fire({
      title: 'Confirmación',
      text: `¿Está seguro de continuar con la anulación?.`,
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
    }).then((result) => {
      if (result.value) {
        this.ordenProcesoService.Anular({
          OrdenProcesoId: this.selected[0].OrdenProcesoId,
          Usuario: this.userSession.Result.Data.NombreUsuario
        })
          .subscribe((res: any) => {
            if (res.Result.Success) {
              this.alertUtil.alertOkCallback('CONFIRMACIÓN!', 'Se anulo exitosamente.', () => {
                this.Buscar();
              });
            } else {

            }
          }, (err: any) => {
            console.log(err);
          });
      }
    });
  }

  Export(): void {
    this.Buscar(true);
  }

  Print(): void {
    const form = this;
    swal.fire({
      title: '¿Estas Seguro?',
      text: `¿Está seguro de realizar la impresión?`,
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
        let link = document.createElement('a');
        document.body.appendChild(link);
        link.href = `${host}OrdenProceso/Imprimir?id=${form.selected[0].OrdenProcesoId}`;
        link.target = "_blank";
        link.click();
        link.remove();
      }
    });
  }

  Agregar(selected: any) {
    this.agregarEvent.emit(selected)
  }
}
