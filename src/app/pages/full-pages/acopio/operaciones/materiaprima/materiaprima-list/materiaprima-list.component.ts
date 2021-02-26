import { Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { DatatableComponent, ColumnMode } from "@swimlane/ngx-datatable";
import { MaestroUtil } from '../../../../../../services/util/maestro-util';
import { AlertUtil } from '../../../../../../services/util/alert-util';
import { DateUtil } from '../../../../../../services/util/date-util';
import { AcopioService, FiltrosMateriaPrima } from '../../../../../../services/acopio.service';
import { NotaIngresoAlmacenService } from '../../../../../../services/nota-ingreso-almacen.service';
import { Observable } from 'rxjs';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ExcelService } from '../../../../../../shared/util/excel.service';
import { NgxSpinnerService } from "ngx-spinner";
import { HeaderExcel } from '../../../../../../services/models/headerexcel.model';
import swal from 'sweetalert2';
import {Router} from "@angular/router"

@Component({
  selector: "app-materiaprima-list",
  templateUrl: "./materiaprima-list.component.html",
  styleUrls: [
    "./materiaprima-list.component.scss",
    "/assets/sass/libs/datatables.scss",
  ],
  encapsulation: ViewEncapsulation.None
})

export class MateriaPrimaListComponent implements OnInit {
  @ViewChild('vform') validationForm: FormGroup;
  submitted = false;
  listaEstado: Observable<any[]>;
  listaTipoDocumento: Observable<any[]>;
  listaProducto: Observable<any[]>;
  selectedTipoDocumento: any;
  selectedEstado: any;
  selectedProducto: any;
  consultaMateriaPrimaForm: FormGroup;
  error: any = { isError: false, errorMessage: '' };
  errorFecha: any = { isError: false, errorMessage: '' };
  errorGeneral: any = { isError: false, errorMessage: '' };
  selected = []
  mensajeErrorGenerico = "Ocurrio un error interno.";
  estadoPesado = "01";
  estadoAnalizado = "02";
  @ViewChild(DatatableComponent) table: DatatableComponent;

  // row data
  public rows = [];
  public ColumnMode = ColumnMode;
  public limitRef = 10;

  // private
  private tempData = [];
  constructor(
    private router: Router,
    private maestroUtil: MaestroUtil,
    private alertUtil: AlertUtil,
    private dateUtil: DateUtil,
    private acopioService: AcopioService,
    private notaIngrersoService: NotaIngresoAlmacenService,
    private filtrosMateriaPrima: FiltrosMateriaPrima,
    private excelService: ExcelService,
    private spinner: NgxSpinnerService) {
    this.singleSelectCheck = this.singleSelectCheck.bind(this);
  }

  singleSelectCheck(row: any) {
    return this.selected.indexOf(row) === -1;
  }
  get f() {
    return this.consultaMateriaPrimaForm.controls;
  }


  filterUpdate(event) {
    const val = event.target.value.toLowerCase();
    const temp = this.tempData.filter(function (d) {
      return d.Numero.toLowerCase().indexOf(val) !== -1 || !val;
    });
    this.rows = temp;
    this.table.offset = 0;
  }

  updateLimit(limit) {
    this.limitRef = limit.target.value;
  }

  ngOnInit(): void {

    this.cargarForm();
    this.cargarcombos();

    this.consultaMateriaPrimaForm.controls['fechaFin'].setValue(this.dateUtil.currentDate());
    this.consultaMateriaPrimaForm.controls['fechaInicio'].setValue(this.dateUtil.currentMonthAgo());

  }

  cargarForm() {
    this.consultaMateriaPrimaForm = new FormGroup(
      {
        numeroGuia: new FormControl('', [Validators.minLength(5), Validators.maxLength(20), Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$')]),
        tipoDocumento: new FormControl('', []),
        nombre: new FormControl('', [Validators.minLength(5), Validators.maxLength(100)]),
        fechaInicio: new FormControl('', [Validators.required]),
        numeroDocumento: new FormControl('', [Validators.minLength(8), Validators.maxLength(20), Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$')]),
        estado: new FormControl('', []),
        fechaFin: new FormControl('', [Validators.required,]),
        codigoSocio: new FormControl('', [Validators.minLength(5), Validators.maxLength(20), Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$')]),
        producto: new FormControl('', [])
      });
    this.consultaMateriaPrimaForm.setValidators(this.comparisonValidator())
  }

  cargarcombos() {
    var form = this;
    this.maestroUtil.obtenerMaestros("EstadoGuiaRecepcion", function (res) {
      if (res.Result.Success) {
        form.listaEstado = res.Result.Data;
      }
    });
    this.maestroUtil.obtenerMaestros("TipoDocumento", function (res) {
      if (res.Result.Success) {
        form.listaTipoDocumento = res.Result.Data;
      }
    });
    this.maestroUtil.obtenerMaestros("Producto", function (res) {
      if (res.Result.Success) {
        form.listaProducto = res.Result.Data;
      }
    });
  }

  buscar() {
    if (this.consultaMateriaPrimaForm.invalid || this.errorGeneral.isError) {
      this.submitted = true;
      return;
    } else {

      this.submitted = false;
      this.filtrosMateriaPrima.Numero = this.consultaMateriaPrimaForm.controls['numeroGuia'].value;
      this.filtrosMateriaPrima.NombreRazonSocial = this.consultaMateriaPrimaForm.controls['nombre'].value;
      this.filtrosMateriaPrima.TipoDocumentoId = this.consultaMateriaPrimaForm.controls['tipoDocumento'].value;
      this.filtrosMateriaPrima.NumeroDocumento = this.consultaMateriaPrimaForm.controls['numeroDocumento'].value;
      this.filtrosMateriaPrima.ProductoId = this.consultaMateriaPrimaForm.controls['producto'].value;
      this.filtrosMateriaPrima.CodigoSocio = this.consultaMateriaPrimaForm.controls['codigoSocio'].value;
      this.filtrosMateriaPrima.EstadoId = this.consultaMateriaPrimaForm.controls['estado'].value;
      this.filtrosMateriaPrima.FechaInicio = this.consultaMateriaPrimaForm.controls['fechaInicio'].value;
      this.filtrosMateriaPrima.FechaFin = this.consultaMateriaPrimaForm.controls['fechaFin'].value;
      this.spinner.show(undefined,
        {
          type: 'ball-triangle-path',
          size: 'medium',
          bdColor: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          fullScreen: true
        });
      this.acopioService.consultarMateriaPrima(this.filtrosMateriaPrima)
        .subscribe(res => {
          this.spinner.hide();
          if (res.Result.Success) {
            if (res.Result.ErrCode == "") {
              res.Result.Data.forEach(obj => {

                var fecha = new Date(obj.FechaRegistro);
                obj.FechaRegistroCadena = this.dateUtil.formatDate(fecha,"/");

              });
              this.tempData = res.Result.Data;
              this.rows = [...this.tempData];
              this.selected = [];
            } else if (res.Result.Message != "" && res.Result.ErrCode != "") {
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
            console.log(err);
            this.errorGeneral = { isError: false, errorMessage: this.mensajeErrorGenerico };
          }
        );
    }
  }

  compareTwoDates() {
    var anioFechaInicio = new Date(this.consultaMateriaPrimaForm.controls['fechaInicio'].value).getFullYear()
    var anioFechaFin = new Date(this.consultaMateriaPrimaForm.controls['fechaFin'].value).getFullYear()

    if (new Date(this.consultaMateriaPrimaForm.controls['fechaFin'].value) < new Date(this.consultaMateriaPrimaForm.controls['fechaInicio'].value)) {
      this.error = { isError: true, errorMessage: 'La fecha fin no puede ser anterior a la fecha inicio' };
      this.consultaMateriaPrimaForm.controls['fechaFin'].setErrors({ isError: true })
    } else if (this.dateUtil.restarAnio(anioFechaInicio, anioFechaFin) > 2) {
      this.error = { isError: true, errorMessage: 'El Rango de fechas no puede ser mayor a 2 años' };
      this.consultaMateriaPrimaForm.controls['fechaFin'].setErrors({ isError: true })
    } else {
      this.error = { isError: false, errorMessage: '' };
    }
  }

  compareFechas() {
    var anioFechaInicio = new Date(this.consultaMateriaPrimaForm.controls['fechaInicio'].value).getFullYear()
    var anioFechaFin = new Date(this.consultaMateriaPrimaForm.controls['fechaFin'].value).getFullYear()
    if (new Date(this.consultaMateriaPrimaForm.controls['fechaInicio'].value) > new Date(this.consultaMateriaPrimaForm.controls['fechaFin'].value)) {
      this.errorFecha = { isError: true, errorMessage: 'La fecha inicio no puede ser mayor a la fecha fin' };
      this.consultaMateriaPrimaForm.controls['fechaInicio'].setErrors({ isError: true })
    } else if (this.dateUtil.restarAnio(anioFechaInicio, anioFechaFin) > 2) {
      this.errorFecha = { isError: true, errorMessage: 'El Rango de fechas no puede ser mayor a 2 años' };
      this.consultaMateriaPrimaForm.controls['fechaInicio'].setErrors({ isError: true })
    } else {
      this.errorFecha = { isError: false, errorMessage: '' };
    }
  }


  public comparisonValidator(): ValidatorFn {
    return (group: FormGroup): ValidationErrors => {
      const numeroGuia = group.controls['numeroGuia'];
      const numeroDocumento = group.controls['numeroDocumento'];
      const codigoSocio = group.controls['codigoSocio'];
      const nombre = group.controls['nombre'];
      const tipoDocumento = group.controls['tipoDocumento'];
      if (numeroGuia.value == "" && numeroDocumento.value == "" && codigoSocio.value == "" && nombre.value == "") {

        this.errorGeneral = { isError: true, errorMessage: 'Ingrese por lo menos un campo' };

      } else {
        this.errorGeneral = { isError: false, errorMessage: '' };
      }

      if (numeroDocumento.value != "" && (tipoDocumento.value == "" || tipoDocumento.value == undefined)) {

        this.errorGeneral = { isError: true, errorMessage: 'Seleccione un tipo documento' };

      } else if (numeroDocumento.value == "" && (tipoDocumento.value != "" && tipoDocumento.value != undefined)) {

        this.errorGeneral = { isError: true, errorMessage: 'Ingrese un numero documento' };

      }

      return;
    };
  }

  nuevo() {
    this.router.navigate(['/operaciones/guiarecepcionmateriaprima-edit'])
  }

  anular() {
    if (this.selected.length > 0) {
      if (this.selected[0].EstadoId == this.estadoPesado) {
        var form = this;
        swal.fire({
          title: '¿Estas seguro?',
          text: "¿Estas seguro de anular la guia?",
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
            form.anularGuia();
          }
        });
      } else {
        this.alertUtil.alertError("Error", "Solo se puede anular guias con estado pesado")
      }
    }


  }

  enviar() {
    if (this.selected.length > 0) {
      if (this.selected[0].EstadoId == this.estadoAnalizado) {
          var form = this;
          swal.fire({
            title: '¿Estas seguro?',
            text: "¿Estas seguro de enviar a almacen?",
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
              form.enviarAlmacenGuia();
            }
          });
        } else {
          this.alertUtil.alertError("Error", "Solo se puede enviar guias con estado analizado")
        }
    }
  }

  anularGuia() {
    this.spinner.show(undefined,
      {
        type: 'ball-triangle-path',
        size: 'medium',
        bdColor: 'rgba(0, 0, 0, 0.8)',
        color: '#fff',
        fullScreen: true
      });
    this.acopioService.anularMateriaPrima(this.selected[0].GuiaRecepcionMateriaPrimaId)
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            this.alertUtil.alertOk('Anulado!', 'Guia Anulada.');
            this.buscar();

          } else if (res.Result.Message != "" && res.Result.ErrCode != "") {
            this.alertUtil.alertError('Error', res.Result.Message);
          } else {
            this.alertUtil.alertError('Error', this.mensajeErrorGenerico);
          }
        } else {
          this.alertUtil.alertError('Error', this.mensajeErrorGenerico);
        }
      },
        err => {
          this.spinner.hide();
          console.log(err);
          this.alertUtil.alertError('Error', this.mensajeErrorGenerico);
        }
      );
  }

  enviarAlmacenGuia() {
    this.spinner.show(undefined,
      {
        type: 'ball-triangle-path',
        size: 'medium',
        bdColor: 'rgba(0, 0, 0, 0.8)',
        color: '#fff',
        fullScreen: true
      });
    this.notaIngrersoService.enviarAlmacen(this.selected[0].GuiaRecepcionMateriaPrimaId)
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            this.alertUtil.alertOk('Enviado!', 'Enviado Almacen.');
            this.buscar();

          } else if (res.Result.Message != "" && res.Result.ErrCode != "") {
            this.alertUtil.alertError('Error', res.Result.Message);

          } else {
            this.alertUtil.alertError('Error', this.mensajeErrorGenerico);
          }
        } else {
          this.alertUtil.alertError('Error', this.mensajeErrorGenerico);
        }
      },
        err => {
          this.spinner.hide();
          console.log(err);
          this.alertUtil.alertError('Error', this.mensajeErrorGenerico);
        }
      );
  }

  exportar() {
    try {
      if (this.rows == null || this.rows.length <= 0) {
        this.alertUtil.alertError("Error", "No existen datos a exportar.");
      } else {
        this.filtrosMateriaPrima.Numero = this.consultaMateriaPrimaForm.controls['numeroGuia'].value
        this.filtrosMateriaPrima.NombreRazonSocial = this.consultaMateriaPrimaForm.controls['nombre'].value
        this.filtrosMateriaPrima.TipoDocumentoId = this.consultaMateriaPrimaForm.controls['tipoDocumento'].value
        this.filtrosMateriaPrima.NumeroDocumento = this.consultaMateriaPrimaForm.controls['numeroDocumento'].value
        this.filtrosMateriaPrima.ProductoId = this.consultaMateriaPrimaForm.controls['producto'].value
        this.filtrosMateriaPrima.CodigoSocio = this.consultaMateriaPrimaForm.controls['codigoSocio'].value
        this.filtrosMateriaPrima.EstadoId = this.consultaMateriaPrimaForm.controls['estado'].value
        this.filtrosMateriaPrima.FechaInicio = this.consultaMateriaPrimaForm.controls['fechaInicio'].value
        this.filtrosMateriaPrima.FechaFin = this.consultaMateriaPrimaForm.controls['fechaFin'].value

        let vArrHeaderExcel: HeaderExcel[] = [];

        this.spinner.show(undefined,
          {
            type: 'ball-triangle-path',
            size: 'medium',
            bdColor: 'rgba(0, 0, 0, 0.8)',
            color: '#fff',
            fullScreen: true
          });
        this.acopioService.consultarMateriaPrima(this.filtrosMateriaPrima)
          .subscribe(res => {
            this.spinner.hide();
            if (res.Result.Success) {
              if (res.Result.ErrCode == "") {
                this.tempData = res.Result.Data;

                vArrHeaderExcel = [
                  new HeaderExcel("Número Guia", "center"),
                  new HeaderExcel("Código Socio", "center"),
                  new HeaderExcel("Tipo Documento", "center"),
                  new HeaderExcel("Número Documento", "right", "#"),
                  new HeaderExcel("Nombre o Razón Social"),
                  new HeaderExcel("Fecha Registro", "center", "dd/mm/yyyy"),
                  new HeaderExcel("Estado", "center")
                ];

                let vArrData: any[] = [];
                for (let i = 0; i < this.tempData.length; i++) {
                  vArrData.push([
                    this.tempData[i].Numero,
                    this.tempData[i].CodigoSocio,
                    this.tempData[i].TipoDocumento,
                    this.tempData[i].NumeroDocumento,
                    this.tempData[i].NombreRazonSocial,
                    new Date(this.tempData[i].FechaRegistro),
                    this.tempData[i].Estado
                  ]);
                }
                this.excelService.ExportJSONAsExcel(vArrHeaderExcel, vArrData, 'DatosMateriaPrima');
              } else if (res.Result.Message != "" && res.Result.ErrCode != "") {
                this.errorGeneral = { isError: true, errorMessage: res.Result.Message };
              } else {
                this.errorGeneral = { isError: true, errorMessage: this.mensajeErrorGenerico };
              }
            }
          },
            err => {
              this.spinner.hide();
              console.log(err);
              this.errorGeneral = { isError: true, errorMessage: this.mensajeErrorGenerico };
            }
          );
      }
    }
    catch (err) {
      alert('Ha ocurrio un error en la descarga delExcel.');
    }
  }

}

