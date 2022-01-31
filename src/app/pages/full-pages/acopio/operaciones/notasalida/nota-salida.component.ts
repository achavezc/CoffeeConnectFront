import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ValidatorFn, ValidationErrors } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import swal from 'sweetalert2';
import { Router } from "@angular/router"
import { MaestroUtil } from '../../../../../services/util/maestro-util';
import { DateUtil } from '../../../../../services/util/date-util';
import { AlertUtil } from '../../../../../services/util/alert-util';
import { NotaSalidaAlmacenService } from '../../../../../services/nota-salida-almacen.service';
import { EmpresaService } from '../../../../../services/empresa.service';
import { EmpresaTransporteService } from '../../../../../services/empresa-transporte.service';
import { HeaderExcel } from '../../../../../services/models/headerexcel.model';
import { ExcelService } from '../../../../../shared/util/excel.service';
import {AuthService} from './../../../../../services/auth.service';

@Component({
  selector: 'app-nota-salida',
  templateUrl: './nota-salida.component.html',
  styleUrls: ['./nota-salida.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NotaSalidaComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private maestroUtil: MaestroUtil,
    private dateUtil: DateUtil,
    private spinner: NgxSpinnerService,
    private notaSalidaService: NotaSalidaAlmacenService,
    private alertUtil: AlertUtil,
    private empresaService: EmpresaService,
    private empTransporteService: EmpresaTransporteService,
    private router: Router,
    private excelService: ExcelService,
    private authService : AuthService) { }

  notaSalidaForm: any;
  listDestinatarios: [] = [];
  listTransportistas: [] = [];
  listAlmacenes: [] = [];
  listMotivos: [] = [];
  listEstados: [] = [];
  selectedDestinatario: any;
  selectedTransportista: any;
  selectedAlmacen: any;
  selectedMotivo: any;
  selectedEstado: any;
  error: any = { isError: false, errorMessage: '' };
  errorGeneral: any = { isError: false, errorMessage: '' };
  mensajeErrorGenerico: string = "Ocurrio un error interno.";
  errorFecha: any = { isError: false, errorMessage: '' };
  rows: any[] = [];
  tempData = [];
  submitted: boolean = false;
  limitRef = 10;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  selected = [];
  vSessionUser: any;
  readonly: boolean;

  ngOnInit(): void {
    this.LoadForm();
    this.LoadCombos();
    this.notaSalidaForm.controls['fechaFin'].setValue(this.dateUtil.currentDate());
    this.notaSalidaForm.controls['fechaInicio'].setValue(this.dateUtil.currentMonthAgo());
    this.vSessionUser = JSON.parse(localStorage.getItem('user'));
    this.readonly= this.authService.esReadOnly(this.vSessionUser.Result.Data.OpcionesEscritura);
  }

  get f() {
    return this.notaSalidaForm.value;
  }

  LoadForm(): void {
    this.notaSalidaForm = this.fb.group({
      nroNotaSalida: ['', [Validators.minLength(5), Validators.maxLength(20), Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$')]],
      destinatario: [],
      transportista: [],
      fechaInicio: [, [Validators.required]],
      fechaFin: [, [Validators.required]],
      almacen: [''],
      motivo: [''],
      estado: ['', [Validators.required]]
    });
    this.notaSalidaForm.setValidators(this.comparisonValidator());
  }

  comparisonValidator(): ValidatorFn {
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

  LoadCombos(): void {
    let form = this;
    this.empresaService.Consultar({ EmpresaId: 1 }).subscribe(res => {
      if (res.Result.Success) {
        form.listDestinatarios = res.Result.Data;
      }
    });
    this.empTransporteService.Consultar({ EmpresaId: 1 }).subscribe(res => {
      if (res.Result.Success) {
        form.listTransportistas = res.Result.Data;
      }
    })
    this.maestroUtil.obtenerMaestros("Almacen", function (res) {
      if (res.Result.Success) {
        form.listAlmacenes = res.Result.Data;
      }
    });
    this.maestroUtil.obtenerMaestros("MotivoSalida", function (res) {
      if (res.Result.Success) {
        form.listMotivos = res.Result.Data;
      }
    });
    this.maestroUtil.obtenerMaestros("EstadoNotaSalidaAlmacen", function (res) {
      if (res.Result.Success) {
        form.listEstados = res.Result.Data;
      }
    });
  }

  compareTwoDates(): void {
    let vBeginDate = new Date(this.notaSalidaForm.value.fechaInicio);
    let vEndDate = new Date(this.notaSalidaForm.value.fechaFin);

    var anioFechaInicio = vBeginDate.getFullYear()
    var anioFechaFin = vEndDate.getFullYear()

    if (vEndDate < vBeginDate) {
      this.error = { isError: true, errorMessage: 'La fecha fin no puede ser anterior a la fecha inicio.' };
      this.notaSalidaForm.value.fechaInicio.setErrors({ isError: true })
    } else if (this.dateUtil.restarAnio(anioFechaInicio, anioFechaFin) > 2) {
      this.error = { isError: true, errorMessage: 'Por favor el Rango de fechas no puede ser mayor a 2 años.' };
      this.notaSalidaForm.value.fechaFin.setErrors({ isError: true })
    } else {
      this.error = { isError: false, errorMessage: '' };
    }
  }

  updateLimit(limit: any) {
    this.limitRef = limit.target.value;
  }

  filterUpdate(event: any) {
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

  Buscar(): void {
    if (this.notaSalidaForm.invalid || this.errorGeneral.isError) {
      this.submitted = true;
      return;
    } else {
      this.selected = [];
      this.submitted = false;
      const request = {
        Numero: this.notaSalidaForm.value.nroNotaSalida,
        EmpresaIdDestino: this.notaSalidaForm.value.destinatario ?? null,
        EmpresaTransporteId: this.notaSalidaForm.value.transportista ?? null,
        AlmacenId: this.notaSalidaForm.value.almacen ?? '',
        MotivoTrasladoId: this.notaSalidaForm.value.motivo ?? '',
        FechaInicio: this.notaSalidaForm.value.fechaInicio,
        FechaFin: this.notaSalidaForm.value.fechaFin,
        EmpresaId: this.vSessionUser.Result.Data.EmpresaId,
        EstadoId: this.notaSalidaForm.value.estado
      }

      this.spinner.show();

      this.notaSalidaService.Consultar(request)
        .subscribe(res => {
          this.spinner.hide();
          if (res.Result.Success) {
            if (!res.Result.ErrCode) {
              this.tempData = res.Result.Data;
              this.rows = [...this.tempData];
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
      if (this.selected.length == 1) {
        if (this.selected[0].EstadoId === "01") {
          let form = this;
          swal.fire({
            title: '¿Estas seguro?',
            text: `¿Está seguro de ANULAR la nota de salida "${this.selected[0].Numero}"?`,
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
              form.AnularFila(form);
            }
          });
        } else {
          this.alertUtil.alertError("Validación", "Solo se puede anular los INGRESADOS.");
        }
      } else {
        this.alertUtil.alertError("Validación", "Solo se puede anular de UNO en UNO.");
      }
    } else {
      this.alertUtil.alertError("Validación", "No existen filas seleccionadas.");
    }
  }

  AnularFila(form: any): void {
    form.spinner.show();
    this.notaSalidaService.Anular({
      NotaSalidaAlmacenId: this.selected[0].NotaSalidaAlmacenId,
      Usuario: this.vSessionUser.Result.Data.NombreUsuario
    }).subscribe((res: any) => {
      if (res.Result.Success) {
        if (!res.Result.ErrCode) {
          form.spinner.hide();
          form.alertUtil.alertOk("Confirmación",
            `La nota de salida ${form.selected[0].Numero} fue ANULADO correctamente.`);
          form.Buscar();
        } else if (res.Result.Message && res.Result.ErrCode) {
          this.errorGeneral = { isError: true, errorMessage: res.Result.Message };
        } else {
          this.errorGeneral = { isError: true, errorMessage: this.mensajeErrorGenerico };
        }
      } else {
        this.errorGeneral = { isError: true, errorMessage: this.mensajeErrorGenerico };
      }
    }, (err: any) => {
      console.log(err);
      form.spinner.hide();
      this.errorGeneral = { isError: true, errorMessage: this.mensajeErrorGenerico };
    });
  }

  nuevo() {
    this.router.navigate(['/operaciones/notasalida-edit']);
  }

  Export(): void {
    this.spinner.show();
    const request = {
      Numero: this.notaSalidaForm.value.nroNotaSalida,
      EmpresaIdDestino: this.notaSalidaForm.value.destinatario ?? null,
      EmpresaTransporteId: this.notaSalidaForm.value.transportista ?? null,
      AlmacenId: this.notaSalidaForm.value.almacen ?? '',
      MotivoTrasladoId: this.notaSalidaForm.value.motivo ?? '',
      FechaInicio: this.notaSalidaForm.value.fechaInicio,
      FechaFin: this.notaSalidaForm.value.fechaFin,
      EmpresaId: this.vSessionUser.Result.Data.EmpresaId
    }

    this.notaSalidaService.Consultar(request)
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (!res.Result.ErrCode) {
            const vArrHeaderExcel: HeaderExcel[] = [
              new HeaderExcel("Nota Salida", "center"),
              new HeaderExcel("Almacén"),
              new HeaderExcel("Destinatario"),
              new HeaderExcel("Motivo"),
              new HeaderExcel("Transportista"),
              new HeaderExcel("Cant. Lotes", "right"),
              new HeaderExcel("Total Peso Bruto KGS", "right"),
              new HeaderExcel("Estado")
            ];
            let vArrData: any[] = [];
            for (let i = 0; i < res.Result.Data.length; i++) {
              vArrData.push([
                res.Result.Data[i].Numero,
                res.Result.Data[i].Almacen,
                res.Result.Data[i].Destinatario,
                res.Result.Data[i].Motivo,
                res.Result.Data[i].Transportista,
                res.Result.Data[i].CantidadLotes,
                res.Result.Data[i].PesoKilosBrutos,
                res.Result.Data[i].Estado
              ]);
            }
            this.excelService.ExportJSONAsExcel(vArrHeaderExcel, vArrData, 'DatosNotaSalida');
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
