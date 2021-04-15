import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
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

  ngOnInit(): void {
    this.LoadForm();
    this.LoadCombos();
    this.ingresoAlmacenForm.controls['fechaFin'].setValue(this.dateUtil.currentDate());
    this.ingresoAlmacenForm.controls['fechaInicio'].setValue(this.dateUtil.currentMonthAgo());
    this.userSession = JSON.parse(localStorage.getItem('user'));
  }

  LoadForm(): void {
    this.ingresoAlmacenForm = this.fb.group({
      //nroIngreso: ['', [Validators.minLength(5), Validators.maxLength(20), Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$')]],
      nroIngreso: ['',],
      tipoDocumento: [],
      //numeroDocumento: ['', [Validators.minLength(8), Validators.maxLength(20), Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$')]],
      numeroDocumento: ['',],
      fechaInicio: [, [Validators.required]],
      fechaFin: [, [Validators.required]],
      //codigoSocio: ['', [Validators.minLength(5), Validators.maxLength(20), Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$')]],
      codigoSocio: ['',],
      estado: ['', Validators.required],
      //nombreRazonSocial: ['', [Validators.minLength(5), Validators.maxLength(100)]],
      nombreRazonSocial: ['',],
      almacen: [],
      certificacion: [],
      producto: ['', Validators.required],
      subProducto: [],
      rendimientoInicio: [],
      rendimientoFin: [],
      puntajeFinalIni: [],
      puntajeFinalFin: []
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
    this.maestroUtil.obtenerMaestros("TipoCertificacion", function (res) {
      if (res.Result.Success) {
        form.listCertificacion = res.Result.Data;
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
      // let numeroGuia = group.controls['nroIngreso'].value.trim();
      // let numeroDocumento = group.controls['numeroDocumento'].value.trim();
      // let tipoDocumento = group.controls['tipoDocumento'].value;
      // let codigoSocio = group.controls['codigoSocio'].value.trim();
      // let nombre = group.controls['nombreRazonSocial'].value.trim();
      // let vProduct = group.controls['producto'].value;
      // let vByProduct = group.controls['subProducto'].value;

      // if (!numeroGuia && !numeroDocumento && !codigoSocio && !nombre && !tipoDocumento) {
      //   this.errorGeneral = { isError: true, errorMessage: 'Por favor ingresar por lo menos un filtro.' };
      // } else if (numeroDocumento && !tipoDocumento) {
      //   this.errorGeneral = { isError: true, errorMessage: 'Por favor seleccionar un tipo documento.' };
      // } else if (!numeroDocumento && tipoDocumento) {
      //   this.errorGeneral = { isError: true, errorMessage: 'Por favor ingresar un numero documento.' };
      // } else if (vByProduct && !vProduct) {
      //   this.errorGeneral = { isError: true, errorMessage: 'Por favor seleccionar un producto.' };
      // } else 
      if ((group.value.rendimientoInicio && !group.value.rendimientoFin)
        || (!group.value.rendimientoInicio && group.value.rendimientoFin)) {
        this.errorGeneral = { isError: true, errorMessage: 'Por favor ingresar ambos valores de rendimiento.' };
      } else if (group.value.rendimientoInicio && group.value.rendimientoFin && group.value.rendimientoFin <= group.value.rendimientoInicio) {
        this.errorGeneral = { isError: true, errorMessage: 'Por favor ingresar un rango valido para rendimiento.' };
      } else if ((group.value.puntajeFinalIni && !group.value.puntajeFinalFin)
        || (!group.value.puntajeFinalIni && group.value.puntajeFinalFin)) {
        this.errorGeneral = { isError: true, errorMessage: 'Por favor ingresar ambos valores de puntaje final.' };
      } else if (group.value.puntajeFinalIni && group.value.puntajeFinalFin && group.value.puntajeFinalFin <= group.value.puntajeFinalIni) {
        this.errorGeneral = { isError: true, errorMessage: 'Por favor ingresar un rango valido para puntaje final.' };
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

  // singleSelectCheck(row: any) {
  //   return this.selected.indexOf(row) === -1;
  // }

  onSelect(event: any): void {
    this.selected = event.selected;
    // if (event && event.selected.length > 0) {
    //   let obj: any = {};
    //   for (let i = 0; i < event.selected.length; i++) {
    //     obj = event.selected[i];
    //     if (obj.EstadoId == "01" && obj.AlmacenId) {
    //       if (this.selected && this.selected.length > 0) {
    //         if (!this.selected.find(x => x.NotaIngresoAlmacenId == obj.NotaIngresoAlmacenId)) {
    //           this.selected.push(obj);
    //         }
    //       } else {
    //         this.selected.push(obj);
    //       }
    //     }
    //   }
    //   if (event.selected.length > 1 && this.selected.length <= 0) {
    //     this.alertUtil.alertError("Advertencia", "Ninguna de las filas seleccionadas tiene asignado un ALMACEN y/o se encuentra en estado INGRESADO.");
    //     this.selected = [];
    //   }
    // }
  }

  onActive(event): void {
    // if (event.type == "click" && event.column.name.trim() == "Lote" && event.event.target.checked && this.selected.length > 0) {
    //   if (event.row.EstadoId != "01" || !event.row.AlmacenId) {
    //     let obj: any = {};
    //     for (let i = 0; i < this.selected.length; i++) {
    //       obj = this.selected[i];
    //       if (obj.NotaIngresoAlmacenId == event.row.NotaIngresoAlmacenId) {
    //         this.selected.splice(i, 1);
    //         this.alertUtil.alertError("Advertencia", "La fila seleccionada no tiene asignado un ALMACEN y/o su estado no es INGRESADO.");
    //         break;
    //       }
    //     }
    //   }
    // } else {
    //   if (this.selected.length <= 0) {
    //     this.selected = [];
    //   }
    // }
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
        ProductoId: this.ingresoAlmacenForm.value.producto,
        TipoCertificacionId: this.ingresoAlmacenForm.value.certificacion,
        SubProductoId: this.ingresoAlmacenForm.value.subProducto,
        NumeroDocumento: this.ingresoAlmacenForm.value.numeroDocumento,
        CodigoSocio: this.ingresoAlmacenForm.value.codigoSocio,
        EstadoId: this.ingresoAlmacenForm.value.estado,
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
    if (this.selectedProduct && this.selectedCertificacion) {
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
      this.alertUtil.alertError("Advertencia", 'Por favor seleccionar un producto y certificación.');
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
            TipoCertificacionId: form.selectedCertificacion
          };
          vObjRequest.NotasIngresoAlmacenId = vArrIdsNotaIngreso;
          result.push(vObjRequest);
        });
      }
    }
    return result;
  }

}
