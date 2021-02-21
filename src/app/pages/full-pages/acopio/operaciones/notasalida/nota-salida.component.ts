import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ValidatorFn, ValidationErrors } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import swal from 'sweetalert2';

import { MaestroUtil } from '../../../../../services/util/maestro-util';
import { DateUtil } from '../../../../../services/util/date-util';
import { AlertUtil } from '../../../../../services/util/alert-util';
import { NotaSalidaAlmacenService } from '../../../../../services/nota-salida-almacen.service';

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
    private alertUtil: AlertUtil) { }

  notaSalidaForm: any;
  listDestinatarios: [] = [];
  listTransportistas: [] = [];
  listAlmacenes: [] = [];
  listMotivos: [] = [];
  selectedDestinatario: any;
  selectedTransportista: any;
  selectedAlmacen: any;
  selectedMotivo: any;
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

  ngOnInit(): void {
    this.LoadForm();
    this.LoadCombos();
    this.notaSalidaForm.controls['fechaFin'].setValue(this.dateUtil.currentDate());
    this.notaSalidaForm.controls['fechaInicio'].setValue(this.dateUtil.currentMonthAgo());
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
      motivo: ['']
    });
    this.notaSalidaForm.setValidators(this.comparisonValidator());
  }

  comparisonValidator(): ValidatorFn {
    return (group: FormGroup): ValidationErrors => {
      let nroLote = group.controls['nroNotaSalida'].value.trim();

      // if (!nroLote) {
      //   this.errorGeneral = { isError: true, errorMessage: 'Por favor ingresar por lo menos un filtro.' };
      // } else {
      this.errorGeneral = { isError: false, errorMessage: '' };
      // }
      return;
    };
  }

  LoadCombos(): void {
    let form = this;
    this.maestroUtil.obtenerMaestros("Empresa", function (res) {
      if (res.Result.Success) {
        form.listDestinatarios = res.Result.Data;
      }
    });
    this.maestroUtil.obtenerMaestros("EmpresaTransporte", function (res) {
      if (res.Result.Success) {
        form.listTransportistas = res.Result.Data;
      }
    });
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

  Buscar(): void {
    if (this.notaSalidaForm.invalid || this.errorGeneral.isError) {
      this.submitted = true;
      return;
    } else {
      this.selected = [];
      this.submitted = false;
      let request = {
        Numero: this.notaSalidaForm.value.nroNotaSalida,
        EmpresaIdDestino: this.notaSalidaForm.value.destinatario ?? null,
        EmpresaTransporteId: this.notaSalidaForm.value.transportista ?? null,
        AlmacenId: this.notaSalidaForm.value.almacen ?? '',
        MotivoTrasladoId: this.notaSalidaForm.value.motivo ?? '',
        FechaInicio: this.notaSalidaForm.value.fechaInicio,
        FechaFin: this.notaSalidaForm.value.fechaFin,
        EmpresaId: 1
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
    if (this.selected.length <= 0) {
      if (this.selected.length == 1) {
        let form = this;
        swal.fire({
          title: 'Confirmación',
          text: `Solo se anularán las filas que se encuentren en estado INGRESADO.¿Está seguro de continuar?`,
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
            form.AnularFila();
          }
        });
      } else {
        this.alertUtil.alertError("Validación", "Solo se puede anular de UNO en UNO.");
      }
    } else {
      this.alertUtil.alertError("Validación", "No existen filas seleccionadas.");
    }
  }

  AnularFila(): void {
    this.notaSalidaService.Anular({
      NotaSalidaAlmacenId: this.selected[0].NotaSalidaAlmacenId,
      Usuario: "mruizb"
    })
      .subscribe(res => {

      }, err => {
        console.log(err);
      });
  }

}
