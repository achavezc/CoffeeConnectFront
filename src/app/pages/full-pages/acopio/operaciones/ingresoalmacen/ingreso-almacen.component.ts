import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable } from 'rxjs';
import { NgxSpinnerService } from "ngx-spinner";
import { DatatableComponent, ColumnMode } from "@swimlane/ngx-datatable";
import swal from 'sweetalert2';

import { MaestroUtil } from '../../../../../services/util/maestro-util';
import { DateUtil } from '../../../../../services/util/date-util';
import { HeaderExcel } from '../../../../../services/models/headerexcel.model';
import { ExcelService } from '../../../../../shared/util/excel.service';
import { ReqIngresoAlmacenConsultar } from '../../../../../services/models/req-ingresoalmacen-consultar.model';
import { NotaIngresoAlmacenService } from '../../../../../services/nota-ingreso-almacen.service';
import { date } from 'ngx-custom-validators/src/app/date/validator';

@Component({
  selector: 'app-ingreso-almacen',
  templateUrl: './ingreso-almacen.component.html',
  styleUrls: ['./ingreso-almacen.component.scss', "/assets/sass/libs/datatables.scss"],
  encapsulation: ViewEncapsulation.None
})
export class IngresoAlmacenComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private maestroUtil: MaestroUtil,
    private dateUtil: DateUtil,
    private excelService: ExcelService,
    private spinner: NgxSpinnerService,
    private ingresoAlmacenService: NotaIngresoAlmacenService) {
    this.singleSelectCheck = this.singleSelectCheck.bind(this);
  }

  ingresoAlmacenForm: any;
  listTypeDocuments: Observable<any>;
  listStates: Observable<any>;
  listAlmacen: Observable<any>;
  listProducts: Observable<any>;
  listByProducts: Observable<any>;
  selectedTypeDocument: any;
  selectedState: any;
  selectedAlmacen: any;
  selectedProduct: any;
  selectedByProduct: any;
  error: any = { isError: false, errorMessage: '' };
  errorGeneral: any = { isError: false, errorMessage: '' };
  mensajeErrorGenerico: string = "Ocurrio un error interno.";
  errorFecha: any = { isError: false, errorMessage: '' };
  rows: any[] = [];
  tempData = [];
  submitted: boolean = false;
  limitRef = 10;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  // ColumnMode = ColumnMode;
  selected = [];

  ngOnInit(): void {
    this.LoadForm();
    this.LoadCombos();
    this.ingresoAlmacenForm.controls['fechaFin'].setValue(this.dateUtil.currentDate());
    this.ingresoAlmacenForm.controls['fechaInicio'].setValue(this.dateUtil.currentMonthAgo());
  }

  LoadForm(): void {
    this.ingresoAlmacenForm = this.fb.group({
      nroGuiaRecepcion: ['', [Validators.minLength(5), Validators.maxLength(20), Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$')]],
      tipoDocumento: [],
      numeroDocumento: ['', [Validators.minLength(8), Validators.maxLength(20), Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$')]],
      fechaInicio: [, [Validators.required]],
      fechaFin: [, [Validators.required]],
      codigoSocio: ['', [Validators.minLength(5), Validators.maxLength(20), Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$')]],
      estado: [],
      nombreRazonSocial: ['', [Validators.minLength(5), Validators.maxLength(100)]],
      almacen: [],
      producto: [],
      subProducto: []
    });
    this.ingresoAlmacenForm.setValidators(this.comparisonValidator());
  }

  get f() {
    return this.ingresoAlmacenForm.controls;
  }

  LoadCombos(): void {
    let form = this;
    this.maestroUtil.obtenerMaestros("TipoDocumento", function (res) {
      if (res.Result.Success) {
        form.listTypeDocuments = res.Result.Data;
      }
    });
    this.maestroUtil.obtenerMaestros("EstadoNotaIngresoAlmacen", function (res) {
      if (res.Result.Success) {
        form.listStates = res.Result.Data;
      }
    });
    this.maestroUtil.obtenerMaestros("Almacen", function (res) {
      if (res.Result.Success) {
        form.listAlmacen = res.Result.Data;
      }
    });
    this.maestroUtil.obtenerMaestros("Producto", function (res) {
      if (res.Result.Success) {
        form.listProducts = res.Result.Data;
      }
    });

  }

  public comparisonValidator(): ValidatorFn {
    return (group: FormGroup): ValidationErrors => {
      let numeroGuia = group.controls['nroGuiaRecepcion'].value.trim();
      let numeroDocumento = group.controls['numeroDocumento'].value.trim();
      let tipoDocumento = group.controls['tipoDocumento'].value;
      let codigoSocio = group.controls['codigoSocio'].value.trim();
      let nombre = group.controls['nombreRazonSocial'].value.trim();

      if (numeroGuia == "" && numeroDocumento == "" && codigoSocio == "" && nombre == ""
        && (tipoDocumento == undefined || tipoDocumento.trim() == "")) {
        this.errorGeneral = { isError: true, errorMessage: 'Por favor ingresar por lo menos un filtro.' };
      } else if (numeroDocumento != "" && (tipoDocumento == "" || tipoDocumento == undefined)) {
        this.errorGeneral = { isError: true, errorMessage: 'Por favor seleccionar un tipo documento.' };
      } else if (numeroDocumento == "" && (tipoDocumento != "" && tipoDocumento != undefined)) {
        this.errorGeneral = { isError: true, errorMessage: 'Por favor ingresar un numero documento.' };
      } else {
        this.errorGeneral = { isError: false, errorMessage: '' };
      }
      return;
    };
  }

  compareTwoDates(): void {
    let vBeginDate = new Date(this.ingresoAlmacenForm.value.fechaInicio);
    let vEndDate = new Date(this.ingresoAlmacenForm.value.fechaFin);

    var anioFechaInicio = vBeginDate.getFullYear()
    var anioFechaFin = vEndDate.getFullYear()

    if (vEndDate < vBeginDate) {
      this.error = { isError: true, errorMessage: 'La fecha fin no puede ser anterior a la fecha inicio.' };
      this.ingresoAlmacenForm.value.fechaInicio.setErrors({ isError: true })
    } else if (this.dateUtil.restarAnio(anioFechaInicio, anioFechaFin) > 2) {
      this.error = { isError: true, errorMessage: 'Por favor el Rango de fechas no puede ser mayor a 2 años.' };
      this.ingresoAlmacenForm.value.fechaFin.setErrors({ isError: true })
    } else {
      this.error = { isError: false, errorMessage: '' };
    }
  }

  changeProduct(e: any): void {
    let form = this;
    this.maestroUtil.obtenerMaestros("SubProducto", function (res) {
      if (res.Result.Success) {
        if (res.Result.Data.length > 0) {
          form.listByProducts = res.Result.Data.filter(x => x.Val1 == e.Codigo);
        }
      }
    });
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

  singleSelectCheck(row: any) {
    return this.selected.indexOf(row) === -1;
  }

  Buscar(exportExcel?: boolean): void {
    if (this.ingresoAlmacenForm.invalid || this.errorGeneral.isError) {
      this.submitted = true;
      return;
    } else {
      this.submitted = false;
      let request = new ReqIngresoAlmacenConsultar(this.ingresoAlmacenForm.value.nroGuiaRecepcion,
        this.ingresoAlmacenForm.value.nombreRazonSocial,
        this.ingresoAlmacenForm.value.tipoDocumento,
        this.ingresoAlmacenForm.value.producto,
        this.ingresoAlmacenForm.value.subProducto,
        this.ingresoAlmacenForm.value.numeroDocumento,
        this.ingresoAlmacenForm.value.codigoSocio,
        this.ingresoAlmacenForm.value.estado,
        new Date(this.ingresoAlmacenForm.value.fechaInicio),
        new Date(this.ingresoAlmacenForm.value.fechaFin), 1,
        this.ingresoAlmacenForm.value.almacen);

      this.spinner.show(undefined,
        {
          type: 'ball-triangle-path',
          size: 'medium',
          bdColor: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          fullScreen: true
        });

      this.ingresoAlmacenService.Consultar(request)
        .subscribe(res => {
          this.spinner.hide();
          if (res.Result.Success) {
            if (res.Result.ErrCode == "") {
              if (!exportExcel) {
                res.Result.Data.forEach((obj: any) => {
                  obj.FechaRegistroCadena = this.dateUtil.formatDate(new Date(obj.FechaRegistro));
                });
                this.tempData = res.Result.Data;
                this.rows = [...this.tempData];
              } else {
                let vArrHeaderExcel: HeaderExcel[] = [
                  new HeaderExcel("Número Nota Ingreso", "center"),
                  new HeaderExcel("Código Socio", "center"),
                  new HeaderExcel("Tipo Documento", "center"),
                  new HeaderExcel("Número Documento", "right", "#"),
                  new HeaderExcel("Nombre o Razón Social"),
                  new HeaderExcel("Producto"),
                  new HeaderExcel("Sub Producto"),
                  new HeaderExcel("Almacén"),
                  new HeaderExcel("Fecha", "center", "dd/mm/yyyy"),
                  new HeaderExcel("Estado", "center"),
                ];

                let vArrData: any[] = [];
                for (let i = 0; i < res.Result.Data.length; i++) {
                  vArrData.push([
                    res.Result.Data[i].Numero,
                    res.Result.Data[i].CodigoSocio,
                    res.Result.Data[i].TipoDocumento,
                    res.Result.Data[i].NumeroDocumento,
                    res.Result.Data[i].NombreRazonSocial,
                    res.Result.Data[i].Producto,
                    res.Result.Data[i].SubProducto,
                    res.Result.Data[i].Almacen,
                    new Date(res.Result.Data[i].FechaRegistro),
                    res.Result.Data[i].Estado
                  ]);
                }
                this.excelService.ExportJSONAsExcel(vArrHeaderExcel, vArrData, 'DatosIngresoAlmacen');
              }
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
            console.error(err);
            this.errorGeneral = { isError: true, errorMessage: this.mensajeErrorGenerico };
          }
        );
    }
  }

  Exportar(): void {
    this.Buscar(true);
  }

  GenerarLote(): void {
    let request = {
      NotasIngresoAlmacenId: [],
      Usuario: "",
      EmpresaId: 0,
      AlmacenId: 0
    }
  }
}
