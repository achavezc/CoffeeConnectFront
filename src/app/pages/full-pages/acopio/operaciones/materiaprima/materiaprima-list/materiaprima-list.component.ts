import { Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { DatatableComponent, ColumnMode } from "@swimlane/ngx-datatable";
import { MaestroService } from '../../../../../../services/maestro.service';
import { AcopioService, FiltrosMateriaPrima } from '../../../../../../services/acopio.service';
import { Observable } from 'rxjs';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ExcelService } from '../../../../../../shared/util/excel.service';
import { NgxSpinnerService } from "ngx-spinner";

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
  @ViewChild(DatatableComponent) table: DatatableComponent;

  // row data
  public rows = [];//materiaPrimaListData;
  public ColumnMode = ColumnMode;
  public limitRef = 10;

  // column header
  public columns = [
    { name: "ID", prop: "ID" },
    { name: "Username", prop: "Username" },
    { name: "Name", prop: "Name" },
    { name: "Last Activity", prop: "Last Activity" },
    { name: "Verified", prop: "Verified" },
    { name: "Role", prop: "Role" },
    { name: "Status", prop: "Status" },
    { name: "Actions", prop: "Actions" },
  ];

  // private
  private tempData = [];
  constructor(private maestroService: MaestroService,
    private acopioService: AcopioService,
    private filtrosMateriaPrima: FiltrosMateriaPrima,
    private excelService: ExcelService,
    private spinner: NgxSpinnerService) {

  }


  get f() {
    return this.consultaMateriaPrimaForm.controls;
  }

  // Public Methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * filterUpdate
   *
   * @param event
   */
  filterUpdate(event) {
    const val = event.target.value.toLowerCase();
    // filter our data
    const temp = this.tempData.filter(function (d) {
      return d.Numero.toLowerCase().indexOf(val) !== -1 || !val;
    });
    // update the rows
    this.rows = temp;
    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }

  /**
   * updateLimit
   *
   * @param limit
   */
  updateLimit(limit) {
    this.limitRef = limit.target.value;
  }

  ngOnInit(): void {

    this.cargarForm();
    this.cargarcombos();

    this.consultaMateriaPrimaForm.controls['fechaFin'].setValue(this.currentDate());
    this.consultaMateriaPrimaForm.controls['fechaInicio'].setValue(this.currentMonthAgo());

  }

  currentDate() {
    const currentDate = new Date();
    return currentDate.toISOString().substring(0, 10);
  }

  currentMonthAgo() {
    let now = new Date();
    let monthAgo = new Date();
    monthAgo.setMonth(now.getMonth() - 1);
    return monthAgo.toISOString().substring(0, 10);
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
    this.maestroService.obtenerMaestros("EstadoGuiaRecepcion", 1)
      .subscribe(res => {
        if (res.Result.Success) {
          this.listaEstado = res.Result.Data;
        }
      },
        err => {
          console.error(err);
        }
      );

    this.maestroService.obtenerMaestros("TipoDocumento", 1)
      .subscribe(res => {
        if (res.Result.Success) {
          this.listaTipoDocumento = res.Result.Data;
        }
      },
        err => {
          console.error(err);
        }
      );

    this.maestroService.obtenerMaestros("Producto", 1)
      .subscribe(res => {
        if (res.Result.Success) {
          this.listaProducto = res.Result.Data;
        }
      },
        err => {
          console.error(err);
        }
      );
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
                obj.FechaRegistroCadena = fecha.getUTCDate() + "/" + fecha.getUTCMonth() + 1 + "/" + fecha.getUTCFullYear();

              });
              this.tempData = res.Result.Data;
              this.rows = [...this.tempData];
            } else if (res.Result.Message != "" && res.Result.ErrCode != "") {
              this.errorGeneral = { isError: true, errorMessage: res.Result.Message };
            } else {
              this.errorGeneral = { isError: true, errorMessage: 'Ocurrio un error interno' };
            }
          }
        },
          err => {
            this.spinner.hide();
            console.error(err);
            this.errorGeneral = { isError: true, errorMessage: 'Ocurrio un error interno' };
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
    } else if (this.years(anioFechaInicio, anioFechaFin) > 2) {
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
    } else if (this.years(anioFechaInicio, anioFechaFin) > 2) {
      this.errorFecha = { isError: true, errorMessage: 'El Rango de fechas no puede ser mayor a 2 años' };
      this.consultaMateriaPrimaForm.controls['fechaInicio'].setErrors({ isError: true })
    } else {
      this.errorFecha = { isError: false, errorMessage: '' };
    }
  }

  years(startYear, endYear) {
    var years = [];
    startYear = startYear || 1980;
    while (startYear <= endYear) {
      years.push(startYear++);
    }
    return years.length;
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

  }

  anular() {

  }

  enviar() {

  }

  exportar() {
    try {
      if (this.rows == null || this.rows.length <= 0) {
        alert('No Existen datos');
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
        this.acopioService.consultarMateriaPrima(this.filtrosMateriaPrima)
          .subscribe(res => {
            if (res.Result.Success) {
              if (res.Result.ErrCode == "") {
                this.tempData = res.Result.Data;
                let vCols = [
                  "Número Guia",
                  "Código Socio",
                  "Tipo Documento",
                  "Número Documento",
                  "Nombre o Razón Social",
                  "Fecha Registro",
                  "Estado"
                ];
                let vArrData: any[] = [];
                for (let i = 0; i < this.tempData.length; i++) {
                  vArrData.push([
                    this.tempData[i].Numero,
                    this.tempData[i].CodigoSocio,
                    this.tempData[i].TipoDocumento,
                    this.tempData[i].NumeroDocumento,
                    this.tempData[i].NombreRazonSocial,
                    this.tempData[i].FechaRegistro,
                    this.tempData[i].Estado
                  ]);
                }
                this.excelService.ExportJSONAsExcel(vCols, vArrData, 'DatosMateriaPrima');
              } else if (res.Result.Message != "" && res.Result.ErrCode != "") {
                this.errorGeneral = { isError: true, errorMessage: res.Result.Message };
              } else {
                this.errorGeneral = { isError: true, errorMessage: 'Ocurrio un error interno' };
              }
            }
          },
            err => {
              console.error(err);
              this.errorGeneral = { isError: true, errorMessage: 'Ocurrio un error interno' };
            }
          );
      }
    }
    catch (err) {
      alert('Ha ocurrio un error en la descarga delExcel.');
    }
  }
}
