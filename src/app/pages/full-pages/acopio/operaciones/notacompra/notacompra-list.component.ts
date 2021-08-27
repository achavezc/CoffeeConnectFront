import { Component, OnInit, ViewChild, ViewEncapsulation, Input, EventEmitter, Output } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable } from 'rxjs';
import { NgxSpinnerService } from "ngx-spinner";
import { DatatableComponent, ColumnMode } from "@swimlane/ngx-datatable";
import swal from 'sweetalert2';
import { Router } from '@angular/router';

import { MaestroUtil } from '../../../../../services/util/maestro-util';
import { DateUtil } from '../../../../../services/util/date-util';
import { NotaCompraService } from '../../../../../services/nota-compra.service';
import { ReqNotaCompraConsultar } from '../../../../../services/models/req-notacompra-consulta.model';
import { AlertUtil } from '../../../../../services/util/alert-util';
import { HeaderExcel } from '../../../../../services/models/headerexcel.model';
import { ExcelService } from '../../../../../shared/util/excel.service';

@Component({
  selector: 'app-notacompra-list',
  templateUrl: './notacompra-list.component.html',
  styleUrls: ['./notacompra-list.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NotacompraListComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private maestroUtil: MaestroUtil,
    private dateUtil: DateUtil,
    private spinner: NgxSpinnerService,
    private notaCompraService: NotaCompraService,
    private alertUtil: AlertUtil,
    private excelService: ExcelService,
    private router: Router) {
    // this.singleSelectCheck = this.singleSelectCheck.bind(this);
  }

  consultaNotaCompraForm: FormGroup;
  selectedTypeDocument: any;
  selectedState: any;
  selectedType: any;
  listStates: Observable<any[]>;
  listTypeDocuments: Observable<any[]>;
  listTypes: Observable<any[]>;
  submitted: boolean = false;
  error: any = { isError: false, errorMessage: '' };
  @ViewChild(DatatableComponent) table: DatatableComponent;
  limitRef = 10;
  rows = [];
  tempData = [];
  ColumnMode = ColumnMode;
  selected = [];
  errorGeneral: any = { isError: false, errorMessage: '' };
  mensajeErrorGenerico: string = "Ocurrio un error interno.";
  errorFecha: any = { isError: false, errorMessage: '' };
  vSessionUser: any;
  @Input() popUp = false;
  @Output() agregarEvent = new EventEmitter<any>();

  ngOnInit(): void {
    this.LoadForm();
    this.LoadCombos();
    this.vSessionUser = JSON.parse(localStorage.getItem('user'));
    this.consultaNotaCompraForm.controls['fechaFin'].setValue(this.dateUtil.currentDate());
    this.consultaNotaCompraForm.controls['fechaInicio'].setValue(this.dateUtil.currentMonthAgo());

  }

  LoadForm(): void {
    this.consultaNotaCompraForm = this.fb.group({
      nroGuiaRecepcion: ['', [Validators.minLength(5), Validators.maxLength(20), Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$')]],
      tipoDocumento: [],
      numeroDocumento: ['', [Validators.minLength(8), Validators.maxLength(20), Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$')]],
      nroNotaCompra: ['', [Validators.minLength(5), Validators.maxLength(20), Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$')]],
      fechaInicio: ['', [Validators.required]],
      fechaFin: ['', [Validators.required]],
      estado: ['', [Validators.required]],
      nombreRazonSocial: ['', [Validators.minLength(5), Validators.maxLength(100)]],
      codigoSocio: ['', [Validators.minLength(5), Validators.maxLength(20), Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$')]],
      tipo: []
    });
    this.consultaNotaCompraForm.setValidators(this.comparisonValidator());
  }

  LoadCombos(): void {
    let form = this;
    this.maestroUtil.obtenerMaestros("EstadoNotaCompra", function (res) {
      if (res.Result.Success) {
        form.listStates = res.Result.Data;
        form.consultaNotaCompraForm.controls['estado'].setValue("01");
        if (form.popUp) {
          form.consultaNotaCompraForm.controls['estado'].disable();
        }
      }
    });
    this.maestroUtil.obtenerMaestros("TipoDocumento", function (res) {
      if (res.Result.Success) {
        form.listTypeDocuments = res.Result.Data;
      }
    });
    this.maestroUtil.obtenerMaestros("TipoNotaCompra", function (res) {
      if (res.Result.Success) {
        form.listTypes = res.Result.Data;
      }
    });
  }

  get f() {
    return this.consultaNotaCompraForm.controls;
  }

  public comparisonValidator(): ValidatorFn {
    return (group: FormGroup): ValidationErrors => {
      if (!group.value.fechaInicio || !group.value.fechaFin) {
        this.errorGeneral = { isError: true, errorMessage: 'Por favor seleccionar ambas fechas.' };
      } else if (!group.value.estado) {
        this.errorGeneral = { isError: true, errorMessage: 'Por favor seleccionar un estado.' };
      } else {
        this.errorGeneral = { isError: false, errorMessage: '' };
      }
      return;
    };
  }

  compareTwoDates(): void {
    let vBeginDate = new Date(this.consultaNotaCompraForm.value.fechaInicio);
    let vEndDate = new Date(this.consultaNotaCompraForm.value.fechaFin);

    var anioFechaInicio = vBeginDate.getFullYear()
    var anioFechaFin = vEndDate.getFullYear()

    if (vEndDate < vBeginDate) {
      this.error = { isError: true, errorMessage: 'La fecha fin no puede ser anterior a la fecha inicio' };
      this.consultaNotaCompraForm.value.fechaInicio.setErrors({ isError: true });
    } else if (this.dateUtil.restarAnio(anioFechaInicio, anioFechaFin) > 2) {
      this.error = { isError: true, errorMessage: 'El Rango de fechas no puede ser mayor a 2 años' };
      this.consultaNotaCompraForm.value.fechaFin.setErrors({ isError: true });
    }
    else {
      this.error = { isError: false, errorMessage: '' };
    }
  }

  updateLimit(limit) {
    this.limitRef = limit.target.value;
  }

  filterUpdate(event) {
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

  Buscar(exportExcel?: boolean): void {
    if (this.consultaNotaCompraForm.invalid || this.errorGeneral.isError) {
      this.submitted = true;
      return;
    } else {
      this.submitted = false;
      let request = new ReqNotaCompraConsultar(this.consultaNotaCompraForm.value.nroNotaCompra,
        this.consultaNotaCompraForm.value.nroGuiaRecepcion,
        this.consultaNotaCompraForm.value.nombreRazonSocial,
        this.consultaNotaCompraForm.value.tipoDocumento,
        this.consultaNotaCompraForm.value.numeroDocumento,
        this.consultaNotaCompraForm.value.codigoSocio,
        this.consultaNotaCompraForm.value.estado,
        this.consultaNotaCompraForm.value.tipo,
        new Date(this.consultaNotaCompraForm.value.fechaInicio),
        new Date(this.consultaNotaCompraForm.value.fechaFin), 1);

      this.spinner.show(undefined,
        {
          type: 'ball-triangle-path',
          size: 'medium',
          bdColor: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          fullScreen: true
        });

      this.notaCompraService.Consultar(request)
        .subscribe(res => {
          this.spinner.hide();
          if (res.Result.Success) {
            if (!res.Result.ErrCode) {
              if (!exportExcel) {
                res.Result.Data.forEach((obj: any) => {
                  obj.FechaRegistroCadena = this.dateUtil.formatDate(new Date(obj.FechaRegistro));
                });
                this.tempData = res.Result.Data;
                this.rows = [...this.tempData];
              } else {
                let vArrHeaderExcel: HeaderExcel[] = [
                  new HeaderExcel("Número Guia de Recepción", "center"),
                  new HeaderExcel("Número Nota de Compra", "center"),
                  new HeaderExcel("Código Socio", "center"),
                  new HeaderExcel("Tipo Documento", "center"),
                  new HeaderExcel("Número Documento", "right", "#"),
                  new HeaderExcel("Nombre o Razón Social"),
                  new HeaderExcel("Fecha", "center", "dd/mm/yyyy"),
                  new HeaderExcel("Estado", "center"),
                  new HeaderExcel("Tipo", "center"),
                  new HeaderExcel("KG. Neto a Pagar", "right"),
                  new HeaderExcel("Importe", "right")
                ];

                let vArrData: any[] = [];
                for (let i = 0; i < res.Result.Data.length; i++) {
                  vArrData.push([
                    res.Result.Data[i].NumeroGuiaRecepcion,
                    res.Result.Data[i].Numero,
                    res.Result.Data[i].CodigoSocio,
                    res.Result.Data[i].TipoDocumento,
                    res.Result.Data[i].NumeroDocumento,
                    res.Result.Data[i].NombreRazonSocial,
                    new Date(res.Result.Data[i].FechaRegistro),
                    res.Result.Data[i].Estado,
                    res.Result.Data[i].Tipo,
                    res.Result.Data[i].KilosNetosPagar,
                    res.Result.Data[i].Importe
                  ]);
                }
                this.excelService.ExportJSONAsExcel(vArrHeaderExcel, vArrData, 'DatosNotaCompra');
              }
            } else if (res.Result.Message && res.Result.ErrCode) {
              this.errorGeneral = { isError: true, errorMessage: res.Result.Message };
            } else {
              this.errorGeneral = { isError: true, errorMessage: this.mensajeErrorGenerico };
            }
          } else {
            this.errorGeneral = { isError: true, errorMessage: this.mensajeErrorGenerico };
          }
        },
          err => {
            this.spinner.hide();
            console.error(err);
            this.errorGeneral = { isError: true, errorMessage: this.mensajeErrorGenerico };
          }
        );
    }
  }

  Anular(): void {
    if (this.selected.length > 0) {
      if (this.selected[0].EstadoId == "02") {
        let form = this;
        swal.fire({
          title: 'Confirmación',
          text: `¿Estas seguro de anular la nota de compra "${this.selected[0].Numero}"?`,
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
            form.AnularNCSeleccionada();
          }
        });
      } else {
        this.alertUtil.alertError("Error", "Solo se puede anular notas de compra con estado LIQUIDADO.")
      }
    }
  }

  AnularNCSeleccionada() {
    this.notaCompraService.Anular(this.selected[0].NotaCompraId, this.vSessionUser.Result.Data.NombreUsuario)
      .subscribe(res => {
        if (res.Result.Success) {
          if (!res.Result.ErrCode) {
            this.alertUtil.alertOk('Anulado!', 'Nota de compra Anulada.');
            this.Buscar();
          } else if (res.Result.Message && res.Result.ErrCode) {
            this.alertUtil.alertError('Error', res.Result.Message);
          } else {
            this.alertUtil.alertError('Error', this.mensajeErrorGenerico);
          }
        } else {
          this.alertUtil.alertError('Error', this.mensajeErrorGenerico);
        }
      },
        err => {
          console.log(err);
          this.alertUtil.alertError('Error', this.mensajeErrorGenerico);
        }
      );
  }

  Exportar() {
    this.Buscar(true);
  }


  Agregar(selected: any) {
    this.agregarEvent.emit(selected)
  }

}
