import { Component, OnInit, ViewChild, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable } from 'rxjs';
import { NgxSpinnerService } from "ngx-spinner";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import swal from 'sweetalert2';

import { MaestroUtil } from '../../../../../services/util/maestro-util';
import { DateUtil } from '../../../../../services/util/date-util';
import { HeaderExcel } from '../../../../../services/models/headerexcel.model';
import { ExcelService } from '../../../../../shared/util/excel.service';
import { NotaIngresoAlmacenService } from '../../../../../services/nota-ingreso-almacen.service';
import { LoteService } from '../../../../../services/lote.service';
import { AlertUtil } from '../../../../../services/util/alert-util';

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
    private ingresoAlmacenService: NotaIngresoAlmacenService,
    private loteService: LoteService,
    private alertUtil: AlertUtil) {
    // this.singleSelectCheck = this.singleSelectCheck.bind(this);
  }

  ingresoAlmacenForm: any;
  listTypeDocuments: Observable<any>;
  listStates: Observable<any>;
  listAlmacen: Observable<any>;
  listProducts: [];
  listCertificacion: [];
  listByProducts: [];
  selectedTypeDocument: any;
  selectedState: any;
  selectedAlmacen: any;
  selectedProduct: any;
  selectedCertificacion: any;
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
  selected = [];
  userSession: any = {};
  @Input() popUp = false;
  @Input() lote;
  @Output() agregarEvent = new EventEmitter<any>();

  ngOnInit(): void {
    this.LoadForm();
    
    this.ingresoAlmacenForm.controls['fechaFin'].setValue(this.dateUtil.currentDate());
    this.ingresoAlmacenForm.controls['fechaInicio'].setValue(this.dateUtil.currentMonthAgo());
    this.userSession = JSON.parse(localStorage.getItem('user'));

  }

  async LoadFormPopup() {
    if (this.popUp) {

      this.ingresoAlmacenForm.controls['estado'].disable();
      this.ingresoAlmacenForm.controls['estado'].setValue("01");
      this.ingresoAlmacenForm.controls['producto'].disable();
      this.ingresoAlmacenForm.controls['producto'].setValue(this.lote.ProductoId);
      let producto: any = {};
      producto.Codigo = this.lote.ProductoId;
      this.changeProduct(producto);
      this.cargarsubProducto();
      if (this.lote.TipoCertificacionId != "") {
        this.ingresoAlmacenForm.controls['certificacion'].disable();
        this.ingresoAlmacenForm.controls['certificacion'].setValue(this.lote.TipoCertificacionId);

      }

    }
  }

  async cargarsubProducto() {
    this.ingresoAlmacenForm.controls['subProducto'].setValue(this.lote.SubProductoId);
    this.ingresoAlmacenForm.controls['subProducto'].disable();
  }

  async LoadForm() {
    this.ingresoAlmacenForm = this.fb.group({
      nroIngreso: ['',],
      tipoDocumento: [],
      numeroDocumento: ['',],
      fechaInicio: [, [Validators.required]],
      fechaFin: [, [Validators.required]],
      codigoSocio: ['',],
      estado: ['', Validators.required],
      nombreRazonSocial: ['',],
      almacen: [],
      certificacion: [],
      producto: [''],
      subProducto: [],
      rendimientoInicio: [],
      rendimientoFin: [],
      puntajeFinalIni: [],
      puntajeFinalFin: []
    });
    this.ingresoAlmacenForm.setValidators(this.comparisonValidator());
   await this.LoadCombos();
   
    
  }

  get f() {
    return this.ingresoAlmacenForm.controls;
  }

  async LoadCombos() {
    let form = this;
    await this.maestroUtil.obtenerMaestros("TipoDocumento", function (res) {
      if (res.Result.Success) {
        form.listTypeDocuments = res.Result.Data;
      }
    });
    await this.maestroUtil.obtenerMaestros("EstadoNotaIngresoAlmacen", function (res) {
      if (res.Result.Success) {
        form.listStates = res.Result.Data;
      }
    });
    await this.maestroUtil.obtenerMaestros("Almacen", function (res) {
      if (res.Result.Success) {
        form.listAlmacen = res.Result.Data;
      }
    });
    await this.maestroUtil.obtenerMaestros("TipoCertificacion", function (res) {
      if (res.Result.Success) {
        form.listCertificacion = res.Result.Data;
      }
    });
    await this.maestroUtil.obtenerMaestros("Producto", function (res) {
      if (res.Result.Success) {
        form.listProducts = res.Result.Data;
      }
    });
   
    await this.LoadFormPopup();
   
  }

  public comparisonValidator(): ValidatorFn {
    return (group: FormGroup): ValidationErrors => {
     const fechaInicio = group.controls['fechaInicio'];
     const fechaFin = group.controls['fechaFin'];
     const estado = group.controls['estado'];
      if (!fechaInicio.value || !fechaFin.value) {
        this.errorGeneral = { isError: true, errorMessage: 'Por favor seleccionar ambas fechas.' };
      } else if (estado.value == null) {
        this.errorGeneral = { isError: true, errorMessage: 'Por favor seleccionar un estado.' };
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
    if (e) {
      this.maestroUtil.obtenerMaestros("SubProducto", function (res) {
        if (res.Result.Success) {
          if (res.Result.Data.length > 0) {
            form.listByProducts = res.Result.Data.filter(x => x.Val1 == e.Codigo);
          } else {
            form.listByProducts = [];
          }
        }
      });
    } else {
      form.listByProducts = [];
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

  onSelect(event: any): void {
    this.selected = event.selected;
  }

  Buscar(exportExcel?: boolean): void {
    
    if (this.ingresoAlmacenForm.invalid || this.errorGeneral.isError) {
      this.submitted = true;
      return;
    } else {
      this.selected = [];
      this.submitted = false;
      const request = {
        Numero: this.ingresoAlmacenForm.value.nroIngreso,
        NombreRazonSocial: this.ingresoAlmacenForm.value.nombreRazonSocial,
        TipoDocumentoId: this.ingresoAlmacenForm.value.tipoDocumento,
        ProductoId: this.ingresoAlmacenForm.controls["producto"].value,
        TipoCertificacionId: this.ingresoAlmacenForm.controls["certificacion"].value,
        SubProductoId: this.ingresoAlmacenForm.controls["subProducto"].value,
        NumeroDocumento: this.ingresoAlmacenForm.value.numeroDocumento,
        CodigoSocio: this.ingresoAlmacenForm.value.codigoSocio,
        EstadoId: this.ingresoAlmacenForm.controls["estado"].value,
        FechaInicio: new Date(this.ingresoAlmacenForm.value.fechaInicio),
        FechaFin: new Date(this.ingresoAlmacenForm.value.fechaFin),
        EmpresaId: this.userSession.Result.Data.EmpresaId,
        AlmacenId: this.ingresoAlmacenForm.value.almacen,
        RendimientoPorcentajeInicio: this.ingresoAlmacenForm.value.rendimientoInicio ?? null,
        RendimientoPorcentajeFin: this.ingresoAlmacenForm.value.rendimientoFin ?? null,
        PuntajeAnalisisSensorialInicio: this.ingresoAlmacenForm.value.puntajeFinalIni ?? null,
        PuntajeAnalisisSensorialFin: this.ingresoAlmacenForm.value.puntajeFinalFin ?? null
      };

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
            if (!res.Result.ErrCode) {
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
                  new HeaderExcel("Certificación"),
                  new HeaderExcel("Unidad de Medida"),
                  new HeaderExcel("Cantidad"),
                  new HeaderExcel("% Rendimiento"),
                  new HeaderExcel("Puntaje Final (Analisis)"),
                  new HeaderExcel("Desc. Defectos"),
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
                    res.Result.Data[i].Certificacion,
                    res.Result.Data[i].UnidadMedida,
                    res.Result.Data[i].CantidadPesado,
                    res.Result.Data[i].RendimientoPorcentaje,
                    res.Result.Data[i].TotalAnalisisSensorial,
                    res.Result.Data[i].DefectosAnalisisSensorial,
                    res.Result.Data[i].Almacen,
                    new Date(res.Result.Data[i].FechaRegistro),
                    res.Result.Data[i].Estado
                  ]);
                }
                this.excelService.ExportJSONAsExcel(vArrHeaderExcel, vArrData, 'DatosIngresoAlmacen');
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

  Exportar(): void {
    let form = this;
    swal.fire({
      title: 'Confirmación',
      text: `¿Está seguro de exportar la información visualizada?`,
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
        form.Buscar(true);
      }
    });
  }

  GenerarLote(): void {
    if (this.selectedProduct && this.selectedCertificacion && this.selectedByProduct) {
      this.errorGeneral = { isError: false, errorMessage: '' };
      let request = this.DevolverRequestGenerarLotes();
      if (request && request.length > 0) {
        let form = this;
        swal.fire({
          title: 'Confirmación',
          text: `¿Está seguro de continuar con la generación de lotes?`,
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
            form.ProcesarGenerarLote(request);
          }
        });
      } else {
        this.alertUtil.alertError("Advertencia",
          "Por favor solo seleccionar filas que se encuentren en estado INGRESADO y tengan asignado un ALMACEN.");
      }
    } else {
      this.alertUtil.alertError("Advertencia", 'Por favor seleccionar un producto, sub producto y certificación.');
    }
  }

  ProcesarGenerarLote(request: any[]): void {
    let form = this;
    for (let i = 0; i < request.length; i++) {
      form.spinner.show();
      this.loteService.Generar(request[i])
        .subscribe((res: any) => {
          if (!res.Result.Success) {
            if (res.Result.Message && res.Result.ErrCode) {
              this.errorGeneral = { isError: true, errorMessage: res.Result.Message };
            } else {
              this.errorGeneral = { isError: true, errorMessage: this.mensajeErrorGenerico };
            }
          } else {
            form.spinner.hide();
            this.alertUtil.alertOkCallback("GENERADO!", "Se genero el lote de manera correcta.", () => {
              form.Buscar();
            });
          }
        }, (err: any) => {
          console.log(err);
          form.spinner.hide();
          this.errorGeneral = { isError: true, errorMessage: this.mensajeErrorGenerico };
        });
    }
  }

  Anular(): void {
    if (this.selected.length > 0) {
      if (this.selected.length == 1) {
        let vIngresados = this.DevolverSoloIngresados();
        if (vIngresados.length > 0) {
          let form = this;
          swal.fire({
            title: 'Confirmación',
            text: `¿Está seguro de ANULAR la nota de ingreso ${this.selected[0].Numero}?`,
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
              form.ProcesarAnulacion(vIngresados);
            }
          });
        } else {
          this.alertUtil.alertError("Advertencia",
            "Ninguna de las filas selccionadas se encuentran en estado INGRESADO.");
        }
      } else {
        this.alertUtil.alertError("Advertencia", "Por favor para ANULAR solo seleccionar de UNO en UNO.");
      }
    } else {
      this.alertUtil.alertError("Advertencia", "No existen filas seleccionadas para anular.");
    }
  }

  ProcesarAnulacion(pIngresados: any[]): void {
    let form = this;
    this.spinner.show();
    let obj: any = {};
    for (let i = 0; i < pIngresados.length; i++) {
      obj = pIngresados[i];
      this.ingresoAlmacenService.Anular(obj.NotaIngresoAlmacenId, this.userSession.Result.Data.NombreUsuario)
        .subscribe(res => {
          if (!res.Result.Success) {
            if (res.Result.Message && res.Result.ErrCode) {
              this.errorGeneral = { isError: true, errorMessage: res.Result.Message };
            } else {
              this.errorGeneral = { isError: true, errorMessage: this.mensajeErrorGenerico };
            }
          } else {
            form.Buscar();
            form.spinner.hide();
            this.alertUtil.alertOk("Confirmación", "Se han anulado las filas seleccionadas correctamente.");
          }
        }, err => {
          console.log(err);
          this.spinner.hide();
          this.errorGeneral = { isError: true, errorMessage: this.mensajeErrorGenerico };
        });
    }
  }

  DevolverSoloIngresados(): any[] {
    let result: any[] = [];
    let obj: any = {};
    for (let i = 0; i < this.selected.length; i++) {
      obj = this.selected[i];
      if (obj.EstadoId && obj.EstadoId == "01") {
        result.push(obj);
      }
    }
    return result;
  }

  DevolverFilasValidas(): any[] {
    let result: any[] = [];
    let obj: any = {};
    for (let i = 0; i < this.selected.length; i++) {
      obj = this.selected[i];
      if (obj.EstadoId && obj.EstadoId == "01" && obj.AlmacenId) {
        result.push(obj);
      } else {
        result = [];
        break;
      }
    }
    return result;
  }

  DevolverRequestGenerarLotes(): any[] {
    let result: any[] = [], vObjRequest: any = {};
    let vFilas = this.DevolverFilasValidas();
    const form = this;
    if (vFilas && vFilas.length > 0) {
      let vArrAlmacenes: number[] = vFilas.map(x => x.AlmacenId);
      vArrAlmacenes = [...new Set(vArrAlmacenes)];
      if (vArrAlmacenes) {
        let vArrIdsNotaIngreso: any[] = [], user = this.userSession.Result;
        vArrAlmacenes.forEach((cv, index, arr) => {
          vFilas.filter(x => x.AlmacenId == cv).forEach(x => {
            vArrIdsNotaIngreso.push({ Id: x.NotaIngresoAlmacenId })
          });

          vObjRequest = {
            Usuario: this.userSession.Result.Data.NombreUsuario,
            EmpresaId: user.Data.EmpresaId,
            AlmacenId: cv.toString(),
            ProductoId: form.selectedProduct,
            SubProductoId: form.selectedByProduct,
            TipoCertificacionId: form.selectedCertificacion
          };
          vObjRequest.NotasIngresoAlmacenId = vArrIdsNotaIngreso;
          result.push(vObjRequest);
        });
      }
    }
    return result;
  }

  Agregar(selected: any) {
    this.agregarEvent.emit(selected)
  }

}
