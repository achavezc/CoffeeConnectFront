import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ValidatorFn, ValidationErrors , FormControl} from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { Router } from "@angular/router"
import { MaestroUtil } from '../../../../../services/util/maestro-util';
import { DateUtil } from '../../../../../services/util/date-util';
import { AlertUtil } from '../../../../../services/util/alert-util';
import{KardexProcesoService} from '../../../../../services/kardex-proceso.service'
import { HeaderExcel } from '../../../../../services/models/headerexcel.model';
import { ExcelService } from '../../../../../shared/util/excel.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import swal from 'sweetalert2';
import {AuthService} from './../../../../../services/auth.service';

@Component({
  selector: 'app-kardex-proceso',
  templateUrl: './kardex-proceso.component.html',
  styleUrls: ['./kardex-proceso.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class KardexProcesoComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private maestroUtil: MaestroUtil,
    private dateUtil: DateUtil,
    private spinner: NgxSpinnerService,
    private kardexProcesoService: KardexProcesoService,
    private alertUtil: AlertUtil,
    private modalService: NgbModal,
    private router: Router,
    private excelService: ExcelService,
    private authService : AuthService) { }

  kardexProcesoForm: any;
  listPlantaProceso: [];
  listTipoDocumentoInterno: [];
  listEstados: [];
  listTipoOperacion = [];
  listCalidad = [];
  listCertificado = [];
  listaCliente = [];
  selectedPlantaProceso: any;
  selectedTipoDocumentoInterno: any;
  selectedEstado: any;
  selectedTipoOperacion: any;
  selectedCalidad: any;
  selectedCertificado: any;
  selectCliente: any[] = [];
  selectedCliente: any;
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
  popUp = true;
  estadoActivo = '01';
  readonly: boolean;


  ngOnInit(): void {
    this.LoadForm();
    this.LoadCombos();
    this.kardexProcesoForm.controls['fechaFin'].setValue(this.dateUtil.currentDate());
    this.kardexProcesoForm.controls['fechaInicio'].setValue(this.dateUtil.currentMonthAgo());
    this.vSessionUser = JSON.parse(localStorage.getItem('user'));
    this.readonly= this.authService.esReadOnly(this.vSessionUser.Result.Data.OpcionesEscritura);
  }

  get f() {
    return this.kardexProcesoForm.controls;
  }


  LoadForm(): void {
    this.kardexProcesoForm = this.fb.group({
      nroContrato: new FormControl('', [Validators.minLength(5), Validators.maxLength(20), Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$')]),
      cliente: new FormControl('', []),
      plantaProceso: new FormControl('', []),
      fechaInicio:  new FormControl('', [Validators.required]), 
      fechaFin:  new FormControl('', [Validators.required]), 
      tipoDocumentoInterno:  new FormControl('', []), 
      estado: new FormControl('', [Validators.required]), 
      tipoOperacion: new FormControl('', []),
      calidad: new FormControl('', []),
      certificado: new FormControl('', []),
      clienteId: new FormControl('', [])
    });
    this.kardexProcesoForm.setValidators(this.comparisonValidator());
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

  LoadCombos() {
    let form = this;
   
   this.maestroUtil.obtenerMaestros("PlantaProcesoAlmacenKardexProceso", function (res) {
      if (res.Result.Success) {
        form.listPlantaProceso = res.Result.Data;
      }
    });
 this.maestroUtil.obtenerMaestros("TipoDocumentoInternoKardexProceso", function (res) {
      if (res.Result.Success) {
        form.listTipoDocumentoInterno = res.Result.Data;
      }
    });
    this.maestroUtil.obtenerMaestros("TipoOperacionKardexProceso", function (res) {
      if (res.Result.Success) {
        form.listTipoOperacion = res.Result.Data;
      }
    });

    this.maestroUtil.obtenerMaestros("EstadoKardexProceso", function (res) {
      if (res.Result.Success) {
        form.listEstados = res.Result.Data;
      }
    });
    this.maestroUtil.obtenerMaestros("CalidadPlanta", function (res) {
      if (res.Result.Success) {
        form.listCalidad = res.Result.Data;
      }
    });
    this.maestroUtil.obtenerMaestros("TipoCertificacionPlanta", function (res) {
      if (res.Result.Success) {
        form.listCertificado = res.Result.Data;
      }
    });
    this.maestroUtil.obtenerMaestros("ClientePlanta", function (res) {
      if (res.Result.Success) {
        form.listaCliente = res.Result.Data;
      }
    });
  }

  compareTwoDates(): void {
    let vBeginDate = new Date(this.kardexProcesoForm.value.fechaInicio);
    let vEndDate = new Date(this.kardexProcesoForm.value.fechaFin);

    var anioFechaInicio = vBeginDate.getFullYear()
    var anioFechaFin = vEndDate.getFullYear()

    if (vEndDate < vBeginDate) {
      this.error = { isError: true, errorMessage: 'La fecha fin no puede ser anterior a la fecha inicio.' };
      this.kardexProcesoForm.value.fechaInicio.setErrors({ isError: true })
    } else if (this.dateUtil.restarAnio(anioFechaInicio, anioFechaFin) > 2) {
      this.error = { isError: true, errorMessage: 'Por favor el Rango de fechas no puede ser mayor a 2 años.' };
      this.kardexProcesoForm.value.fechaFin.setErrors({ isError: true })
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

  Buscar(exportExcel?: boolean): void {
    if (this.kardexProcesoForm.invalid || this.errorGeneral.isError) {
      this.submitted = true;
      return;
    } else {
      this.selected = [];
      this.submitted = false;
      const request = {
        NumeroContrato: this.kardexProcesoForm.value.nroContrato,
        RucCliente: this.kardexProcesoForm.value.cliente,
        PlantaProcesoAlmacenId: this.kardexProcesoForm.value.plantaProceso ?? '',
        TipoDocumentoInternoId: this.kardexProcesoForm.value.tipoDocumentoInterno ?? '',
        TipoOperacionId : this.kardexProcesoForm.value.tipoOperacion ?? '',
        CalidadId: this.kardexProcesoForm.value.calidad ?? '',
        TipoCertificacionId: this.kardexProcesoForm.value.certificado ?? '',
        EstadoId: this.kardexProcesoForm.value.estado,
        EmpresaId: this.vSessionUser.Result.Data.EmpresaId,
        FechaInicio: this.kardexProcesoForm.value.fechaInicio,
        FechaFin: this.kardexProcesoForm.value.fechaFin,
      }
      let json = JSON.stringify(request);
      this.spinner.show();

      this.kardexProcesoService.Consultar(request)
        .subscribe(res => {
          this.spinner.hide();
          if (res.Result.Success) {
            if (!res.Result.ErrCode) {
              res.Result.Data.forEach((obj: any) => {
                obj.FechaIngreso =this.dateUtil.formatDate(obj.FechaIngreso);
                obj.FechaFactura = this.dateUtil.formatDate(obj.FechaFactura);
                obj.SaldosKg = obj.KilosIngresados - obj.KilosDespachados;
                obj.SaldosQq = obj.QQIngresados - obj.QQDespachados;             
              });
              if (!exportExcel) {
               
                this.tempData = res.Result.Data;
                this.rows = [...this.tempData];
              } else {
                let vArrHeaderExcel: HeaderExcel[] = [
                  new HeaderExcel("Fecha Registro", "center"),
                  new HeaderExcel("Tipo Doc. Interno", "center"),
                  new HeaderExcel("Nro Comprobante Interno", "center"),
                  new HeaderExcel("Planta Proceso/Almacen", "right", "#"),
                  new HeaderExcel("Tipo de Operación"),
                  new HeaderExcel("Nro. Guia Remisión"),
                  new HeaderExcel("Cliente"),
                  new HeaderExcel("Nro. Contrato"),
                  new HeaderExcel("Certificado"),
                  new HeaderExcel("Calidad"),
                  new HeaderExcel("Fecha Factura"),
                  new HeaderExcel("Nro. Factura"),
                  new HeaderExcel("Nro Sacos Ingresados"),
                  new HeaderExcel("Kg. Ingresados"),
                  new HeaderExcel("QQ Ingresados", "center"),
                  new HeaderExcel("Precio Unitario CP"),
                  new HeaderExcel("Total CP"),
                  new HeaderExcel("Nro. Sacos Despachados"),
                  new HeaderExcel("Kg. Despachados"),
                  new HeaderExcel("QQ Despachados"),
                  new HeaderExcel("Precio Unitario Venta"),
                  new HeaderExcel("Total Venta"),
                  new HeaderExcel("Saldos en Kg."),
                  new HeaderExcel("Saldos en QQ"),
                  
                ];

                let vArrData: any[] = [];
                for (let i = 0; i < res.Result.Data.length; i++) {
                  vArrData.push([
                    res.Result.Data[i].FechaIngreso,
                    res.Result.Data[i].TipoDocumentoInterno,
                    res.Result.Data[i].NumeroComprobanteInterno,
                    res.Result.Data[i].PlantaProcesoAlmacen,
                    res.Result.Data[i].TipoOperacion,
                    res.Result.Data[i].NumeroGuiaRemision,
                    res.Result.Data[i].Cliente,
                    res.Result.Data[i].NumeroContrato,
                    res.Result.Data[i].TipoCertificacion,
                    res.Result.Data[i].Calidad,
                    res.Result.Data[i].FechaFactura,
                    res.Result.Data[i].NumeroFactura,
                    res.Result.Data[i].CantidadSacosIngresados,
                    res.Result.Data[i].KilosIngresados,
                    res.Result.Data[i].QQIngresados,
                    res.Result.Data[i].PrecioUnitarioCP,
                    res.Result.Data[i].TotalCP,
                    res.Result.Data[i].CantidadSacosDespachados,
                    res.Result.Data[i].KilosDespachados,
                    res.Result.Data[i].QQDespachados,
                    res.Result.Data[i].PrecioUnitarioVenta,
                    res.Result.Data[i].TotalVenta,
                    res.Result.Data[i].SaldosKg,
                    res.Result.Data[i].SaldosQq
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

  openModal(modalEmpresa) {
    this.modalService.open(modalEmpresa, { size: 'xl', centered: true });

  }
  close() {
    this.modalService.dismissAll();
  }

  nuevo() {
    this.router.navigate(['/exportador/operaciones/kardexProcesoEdit']);
  }

  GetDataModalClientes(event: any): void {
    this.selectCliente = event;
    if (this.selectCliente[0].ClienteId)
    this.kardexProcesoForm.get('clienteId').setValue(this.selectCliente[0].ClienteId);
    if (this.selectCliente[0].Numero)
    this.kardexProcesoForm.get('cliente').setValue(this.selectCliente[0].Numero);
    this.modalService.dismissAll();
  }

  anular() {
    if (this.selected.length > 0) {
      if (this.selected[0].EstadoId == this.estadoActivo) {
        var form = this;
        swal.fire({
          title: '¿Estas seguro?',
          text: "¿Estas seguro de anular el Kardex de Proceso?",
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
            form.anularKardexProceso();
          }
        });
      }
      else {
        this.alertUtil.alertError("Error", "Solo se puede anular adelantos por Liquidar.")
      }
    }
  }

  anularKardexProceso() {
    this.spinner.show(undefined,
      {
        type: 'ball-triangle-path',
        size: 'medium',
        bdColor: 'rgba(0, 0, 0, 0.8)',
        color: '#fff',
        fullScreen: true
      });
    this.kardexProcesoService.Anular(this.selected[0].KardexProcesoId, this.vSessionUser.Result.Data.NombreUsuario)
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            this.alertUtil.alertOk('Anulado!', 'Kardex Poceso Anulado.');
            this.Buscar();

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
 

}
