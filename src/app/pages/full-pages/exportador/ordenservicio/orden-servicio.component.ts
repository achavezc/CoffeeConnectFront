import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ValidatorFn, ValidationErrors } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import swal from 'sweetalert2';

import { MaestroUtil } from '../../../../services/util/maestro-util';
import { DateUtil } from '../../../../services/util/date-util';
import { AlertUtil } from '../../../../services/util/alert-util';
import { OrdenservicioControlcalidadService } from '../../../../services/ordenservicio-controlcalidad.service';

@Component({
  selector: 'app-orden-servicio',
  templateUrl: './orden-servicio.component.html',
  styleUrls: ['./orden-servicio.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OrdenServicioComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private maestroUtil: MaestroUtil,
    private dateUtil: DateUtil,
    private spinner: NgxSpinnerService,
    private alertUtil: AlertUtil,
    private ordenSerContCalidService: OrdenservicioControlcalidadService) {
    // this.singleSelectCheck = this.singleSelectCheck.bind(this);
  }

  ordenServConCalExtForm: FormGroup;
  listEstados: [] = [];
  listProductos: [] = [];
  listSubProductos: [] = [];
  selectedEstado: any;
  selectedProducto: any;
  selectedSubProducto: any;
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
    this.ordenServConCalExtForm.controls['fechaFin'].setValue(this.dateUtil.currentDate());
    this.ordenServConCalExtForm.controls['fechaInicio'].setValue(this.dateUtil.currentMonthAgo());
  }

  LoadForm(): void {
    this.ordenServConCalExtForm = this.fb.group({
      nroOrdenServicio: ['', [Validators.minLength(5), Validators.maxLength(20), Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$')]],
      razonSocial: [''],
      ruc: [''],
      fechaInicio: ['', [Validators.required]],
      fechaFin: ['', [Validators.required]],
      estado: [],
      producto: [],
      subProducto: []
    });
    this.ordenServConCalExtForm.setValidators(this.comparisonValidator());
  }

  LoadCombos(): void {
    let form = this;
    this.maestroUtil.obtenerMaestros("EstadoOrdenServicioControlCalidad", function (res) {
      if (res.Result.Success) {
        form.listEstados = res.Result.Data;
      }
    });
    this.maestroUtil.obtenerMaestros("Producto", function (res) {
      if (res.Result.Success) {
        form.listProductos = res.Result.Data;
      }
    });
  }

  get f() {
    return this.ordenServConCalExtForm.controls;
  }

  public comparisonValidator(): ValidatorFn {
    return (group: FormGroup): ValidationErrors => {
      let nroOrdenServicio = group.value.nroOrdenServicio;
      let razonSocial = group.controls['razonSocial'].value.trim();
      let ruc = group.value.ruc;
      let producto = group.controls['producto'].value;
      let subProducto = group.controls['subProducto'].value;

      if (!razonSocial && !nroOrdenServicio && !ruc) {
        this.errorGeneral = { isError: true, errorMessage: 'Por favor ingresar al menos un filtro.' };
      } else if (subProducto && !producto) {
        this.errorGeneral = { isError: true, errorMessage: 'Por favor seleccionar un producto.' };
      } else {
        this.errorGeneral = { isError: false, errorMessage: '' };
      }
      return;
    };
  }

  changeProduct(event: any): void {
    let form = this;
    if (event) {
      this.maestroUtil.obtenerMaestros("SubProducto", function (res) {
        if (res.Result.Success) {
          if (res.Result.Data.length > 0) {
            form.listSubProductos = res.Result.Data.filter(x => x.Val1 == event.Codigo);
          } else {
            form.listSubProductos = [];
          }
        }
      });
    } else {
      form.listSubProductos = [];
    }
  }

  compareTwoDates(): void {
    let vBeginDate = new Date(this.ordenServConCalExtForm.value.fechaInicio);
    let vEndDate = new Date(this.ordenServConCalExtForm.value.fechaFin);

    var anioFechaInicio = vBeginDate.getFullYear()
    var anioFechaFin = vEndDate.getFullYear()

    if (vEndDate < vBeginDate) {
      this.error = { isError: true, errorMessage: 'La fecha fin no puede ser anterior a la fecha inicio' };
      this.ordenServConCalExtForm.value.fechaInicio.setErrors({ isError: true });
    } else if (this.dateUtil.restarAnio(anioFechaInicio, anioFechaFin) > 2) {
      this.error = { isError: true, errorMessage: 'El Rango de fechas no puede ser mayor a 2 años' };
      this.ordenServConCalExtForm.value.fechaFin.setErrors({ isError: true });
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

  Buscar(): void {
    if (this.ordenServConCalExtForm.invalid || this.errorGeneral.isError) {
      this.submitted = true;
      return;
    } else {
      this.submitted = false;
      let request = {
        Numero: this.ordenServConCalExtForm.value.nroOrdenServicio,
        RazonSocial: this.ordenServConCalExtForm.value.razonSocial,
        Ruc: this.ordenServConCalExtForm.value.ruc,
        ProductoId: this.ordenServConCalExtForm.value.producto ?? '',
        SubProductoId: this.ordenServConCalExtForm.value.subProducto ?? '',
        EstadoId: this.ordenServConCalExtForm.value.estado ?? '',
        FechaInicio: new Date(this.ordenServConCalExtForm.value.fechaInicio),
        FechaFin: new Date(this.ordenServConCalExtForm.value.fechaFin),
        EmpresaId: 1
      };

      this.spinner.show();

      this.ordenSerContCalidService.Consultar(request)
        .subscribe(res => {
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
      if (this.selected[0].EstadoId == "01") {
        let form = this;
        swal.fire({
          title: 'Confirmación',
          text: `¿Estas seguro de anular el orden de servicio "${this.selected[0].Numero}"?`,
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
            form.AnularOSSelected();
          }
        });
      } else {
        this.alertUtil.alertError("ADVERTENCIA", "Solo se puede anular ordenes de servicio con estado INGRESADO.")
      }
    }
  }

  AnularOSSelected(): void {
    this.ordenSerContCalidService.Anular({ OrdenServicioControlCalidadId: this.selected[0].OrdenServicioControlCalidadId, Usuario: "mruizb" })
      .subscribe(res => {
        if (res.Result.Success) {
          if (!res.Result.ErrCode) {
            this.alertUtil.alertOk('Anulado!', 'Orden de servicio anulado.');
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

}
