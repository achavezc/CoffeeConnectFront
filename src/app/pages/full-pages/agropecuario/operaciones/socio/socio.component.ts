import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ValidatorFn, ValidationErrors } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { Router } from '@angular/router';
import swal from 'sweetalert2';

import { MaestroUtil } from '../../../../../services/util/maestro-util';
import { DateUtil } from '../../../../../services/util/date-util';
import { AlertUtil } from '../../../../../services/util/alert-util';
import { SocioService } from '../../../../../services/socio.service';

@Component({
  selector: 'app-socio',
  templateUrl: './socio.component.html',
  styleUrls: ['./socio.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SocioComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private maestroUtil: MaestroUtil,
    private dateUtil: DateUtil,
    private spinner: NgxSpinnerService,
    private alertUtil: AlertUtil,
    private socioService: SocioService,
    private router: Router) {
  }

  socioListForm: FormGroup;
  listTiposDocumentos: [] = [];
  listEstados: [] = [];
  selectedTipoDocumento: any;
  selectedEstado: any;
  submitted: boolean = false;
  error: any = { isError: false, errorMessage: '' };
  @ViewChild(DatatableComponent) table: DatatableComponent;
  limitRef = 10;
  rows = [];
  tempData = [];
  selected = [];
  errorGeneral: any = { isError: false, errorMessage: '' };
  mensajeErrorGenerico: string = "Ocurrio un error interno.";
  errorFecha: any = { isError: false, errorMessage: '' };

  ngOnInit(): void {
    this.LoadForm();
    this.LoadCombos();
    this.socioListForm.controls['fechaFin'].setValue(this.dateUtil.currentDate());
    this.socioListForm.controls['fechaInicio'].setValue(this.dateUtil.currentMonthAgo());
  }

  LoadForm(): void {
    this.socioListForm = this.fb.group({
      codSocio: ['', [Validators.minLength(5), Validators.maxLength(25), Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$')]],
      tipoDocumento: [],
      nroDocumento: ['', [Validators.maxLength(25), Validators.pattern('^[0-9]+$')]],
      nombRazonSocial: ['', [Validators.minLength(5), Validators.maxLength(100)]],
      fechaInicio: ['', [Validators.required]],
      fechaFin: ['', [Validators.required]],
      estado: []
    });
    this.socioListForm.setValidators(this.comparisonValidator());
  }

  LoadCombos(): void {
    let form = this;
    this.maestroUtil.obtenerMaestros("EstadoMaestro", function (res) {
      if (res.Result.Success) {
        form.listEstados = res.Result.Data;
      }
    });
    this.maestroUtil.obtenerMaestros("TipoDocumento", function (res) {
      if (res.Result.Success) {
        form.listTiposDocumentos = res.Result.Data;
      }
    });
  }

  get f() {
    return this.socioListForm.controls;
  }

  public comparisonValidator(): ValidatorFn {
    return (group: FormGroup): ValidationErrors => {

      if (!group.value.codSocio && !group.value.nombRazonSocial) {
        this.errorGeneral = { isError: true, errorMessage: 'Por favor ingresar al menos un filtro.' };
        // group.controls['nombRazonSocial'].setErrors({ isError: true, message: 'Por favor ingresar una razón social.' });
      } else if (group.value.nroDocumento && !group.value.tipoDocumento) {
        this.errorGeneral = { isError: true, errorMessage: 'Por favor seleccionar un tipo de documento.' };
        // group.controls['tipoDocumento'].setErrors({ isError: true, message: 'Por favor seleccionar un tipo de documento.' });
      } else if (!group.value.nroDocumento && group.value.tipoDocumento) {
        this.errorGeneral = { isError: true, errorMessage: 'Por favor ingresar un número de documento.' };
        // group.controls['nroDocumento'].setErrors({ isError: true, message: 'Por favor ingresar un número de documento.' });
      } else {
        this.errorGeneral = { isError: false, errorMessage: '' };
      }
      return;
    };
  }

  compareTwoDates(): void {
    let vBeginDate = new Date(this.socioListForm.value.fechaInicio);
    let vEndDate = new Date(this.socioListForm.value.fechaFin);

    var anioFechaInicio = vBeginDate.getFullYear()
    var anioFechaFin = vEndDate.getFullYear()

    if (vEndDate < vBeginDate) {
      this.error = { isError: true, errorMessage: 'La fecha fin no puede ser anterior a la fecha inicio' };
      this.socioListForm.value.fechaInicio.setErrors({ isError: true });
    } else if (this.dateUtil.restarAnio(anioFechaInicio, anioFechaFin) > 2) {
      this.error = { isError: true, errorMessage: 'El Rango de fechas no puede ser mayor a 2 años' };
      this.socioListForm.value.fechaFin.setErrors({ isError: true });
    }
    else {
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
    if (this.socioListForm.invalid || this.errorGeneral.isError) {
      this.submitted = true;
      return;
    } else {
      this.submitted = false;
      let request = {
        Codigo: this.socioListForm.value.codSocio,
        NombreRazonSocial: this.socioListForm.value.nombRazonSocial,
        TipoDocumentoId: this.socioListForm.value.tipoDocumento ?? '',
        NumeroDocumento: this.socioListForm.value.nroDocumento,
        EstadoId: this.socioListForm.value.estado ?? '',
        FechaInicio: new Date(this.socioListForm.value.fechaInicio),
        FechaFin: new Date(this.socioListForm.value.fechaFin)
      };

      this.spinner.show();

      this.socioService.Consultar(request)
        .subscribe((res: any) => {
          this.spinner.hide();
          if (res.Result.Success) {
            if (!res.Result.ErrCode) {
              res.Result.Data.forEach((obj: any) => {
                obj.FechaRegistroString = this.dateUtil.formatDate(new Date(obj.FechaRegistro));
              });
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
          (err: any) => {
            this.spinner.hide();
            console.error(err);
            this.errorGeneral = { isError: true, errorMessage: this.mensajeErrorGenerico };
          }
        );
    }
  }

  AddSocio(): void {
    this.router.navigate(['/operaciones/socio/create']);
  }

}
