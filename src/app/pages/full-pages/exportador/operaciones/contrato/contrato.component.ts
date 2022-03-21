import { Component, OnInit, ViewEncapsulation, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { ActivatedRoute, Router } from '@angular/router';
import swal from 'sweetalert2';

import { DateUtil } from '../../../../../services/util/date-util';
import { ExcelService } from '../../../../../shared/util/excel.service';
import { HeaderExcel } from '../../../../../services/models/headerexcel.model';
import { MaestroUtil } from '../../../../../services/util/maestro-util';
import { ContratoService } from '../../../../../services/contrato.service';
import { AlertUtil } from '../../../../../services/util/alert-util';
import { formatDate } from '@angular/common';
import {AuthService} from './../../../../../services/auth.service';
import { forEach } from 'core-js/core/array';


@Component({
  selector: 'app-contrato',
  templateUrl: './contrato.component.html',
  styleUrls: ['./contrato.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ContratoComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private dateUtil: DateUtil,
    private spinner: NgxSpinnerService,
    private excelService: ExcelService,
    private maestroUtil: MaestroUtil,
    private contratoService: ContratoService,
    private router: Router,
    private route: ActivatedRoute,
    private alertUtil: AlertUtil,
    private authService : AuthService) { }

  contratoForm: FormGroup;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  listProductos: any[];
  listTipoProduccion: any[];
  listEstadoFijacion: any[];
  listCondicionEmbarque: any[];
  listCalidad: any[];
  listEstados: any[];
  listTipoContrato: any[];
  selectedProducto: any;
  selectedTipoProduccion: any;
  selectedCalidad: any;
  selectedCondicionEmbarque: any;
  selectedEstadoFijacion: any;
  selectedEstado: any;
  selectedTipoContrato: any;
  selected = [];
  limitRef = 10;
  rows = [];
  tempData = [];
  errorGeneral = { isError: false, msgError: '' };
  msgErrorGenerico = 'Ocurrio un error interno.';
  userSession: any;
  tipoEmpresaId = '';
  page: any;
  readonly: boolean;
  @Input() popUp = false;
  @Output() agregarContratoEvent = new EventEmitter<any>();
  selectedEstadoPagoFactura : any;
  listEstadoPagoFactura: any[];
  ngOnInit(): void {
    this.userSession = JSON.parse(localStorage.getItem('user'));
    this.tipoEmpresaId = this.userSession.Result.Data.TipoEmpresaid;
    this.LoadForm();
    this.LoadCombos();
    this.contratoForm.controls['fechaInicial'].setValue(this.dateUtil.currentMonthAgo());
    this.contratoForm.controls['fechaFinal'].setValue(this.dateUtil.currentDate());
    this.page = this.route.routeConfig.data.title;
    this.readonly= this.authService.esReadOnly(this.userSession.Result.Data.OpcionesEscritura);

  }

  LoadForm(): void {
    this.contratoForm = this.fb.group({
      nroContrato: [],
      codCliente: [],
      fechaInicial: [, Validators.required],
      fechaFinal: [, Validators.required],
      descCliente: [],
      producto: [],
      tipoProduccion: [],
      calidad: [],
      estadoFijacion: [],
      condicionEmbarque: [],
      estado: ['', Validators.required],
      tipoContrato: [],
      estadoPagoFactura : [],
      codigoInterno: [],
    });
  }

  get f() {
    return this.contratoForm.controls;
  }

  updateLimit(event: any): void {
    this.limitRef = event.target.value;
  }

  filterUpdate(event: any): void {
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

  LoadCombos(): void {
    const form = this;
    this.maestroUtil.obtenerMaestros('EstadoContrato', (res: any) => {
      if (res.Result.Success) {
        form.listEstados = res.Result.Data;
        if (this.popUp == true) {
          switch (this.page) {
            case "Aduanas":
              this.selectedEstado = '03';
              break;
            default:
              this.selectedEstado = '01';
              break;
          }
          this.contratoForm.controls.estado.disable();
        }
      }
    });
    this.maestroUtil.obtenerMaestros('Producto', (res: any) => {
      if (res.Result.Success) {
        form.listProductos = res.Result.Data;
      }
    });
    this.maestroUtil.obtenerMaestros('TipoProduccion', (res: any) => {
      if (res.Result.Success) {
        form.listTipoProduccion = res.Result.Data;
      }
    });
    this.maestroUtil.obtenerMaestros('Calidad', (res: any) => {
      if (res.Result.Success) {
        form.listCalidad = res.Result.Data;
      }
    });
    this.maestroUtil.obtenerMaestros('CondicionEmbarque', (res: any) => {
      if (res.Result.Success) {
        form.listCondicionEmbarque = res.Result.Data;
      }
    });
    this.maestroUtil.obtenerMaestros('ContratoEstadoFijacion', (res: any) => {
      if (res.Result.Success) {
        form.listEstadoFijacion = res.Result.Data;
        
      }
    });
    this.maestroUtil.obtenerMaestros('TipoContrato', (res: any) => {
      if (res.Result.Success) {
        form.listTipoContrato = res.Result.Data;
      }
    });
    this.maestroUtil.obtenerMaestros('EstadoPagoFactura', (res: any) => {
      if (res.Result.Success) {
        form.listEstadoPagoFactura = res.Result.Data;
      }
    });
  }

  getRequest(): any {
    return {
      Numero: this.contratoForm.value.nroContrato ? this.contratoForm.value.nroContrato : '',
      NumeroCliente: this.contratoForm.value.codCliente ? this.contratoForm.value.codCliente : '',
      RazonSocial: this.contratoForm.value.descCliente ? this.contratoForm.value.descCliente : '',
      ProductoId: this.contratoForm.value.producto ? this.contratoForm.value.producto : '',
      TipoProduccionId: this.contratoForm.value.tipoProduccion ? this.contratoForm.value.tipoProduccion : '',
      CalidadId: this.contratoForm.value.calidad ? this.contratoForm.value.calidad : '',
      EstadoId: this.contratoForm.controls['estado'].value ? this.contratoForm.controls['estado'].value : '',
      EmpresaId: this.userSession.Result.Data.EmpresaId,
      CondicionEmbarqueId: this.contratoForm.value.condicionEmbarque ? this.contratoForm.value.condicionEmbarque : '',
      EstadoFijacionId: this.contratoForm.value.estadoFijacion ? this.contratoForm.value.estadoFijacion : '',
      TipoContratoId: this.contratoForm.value.tipoContrato ? this.contratoForm.value.tipoContrato : '',
      FechaInicio: this.contratoForm.value.fechaInicial ? this.contratoForm.value.fechaInicial : '',
      FechaFin: this.contratoForm.value.fechaFinal ? this.contratoForm.value.fechaFinal : '',
      EstadoPagoFacturaId: this.contratoForm.value.estadoPagoFactura ? this.contratoForm.value.estadoPagoFactura : '',
      CodigoInterno: this.contratoForm.value.codigoInterno ? this.contratoForm.value.codigoInterno : '',
    };
  }

  Buscar(): void {
    this.Search(false);
  }
  Export(): void {
    this.Search(true);
  }
  Search(xls?: any): void {
    if (!this.contratoForm.invalid && !this.errorGeneral.isError) {
      this.spinner.show();
      const request = this.getRequest();
      this.contratoService.Search(request).subscribe((res: any) => {
        this.spinner.hide();
        if (res.Result.Success) {
          this.errorGeneral = { isError: false, msgError: '' };
          if (!xls) {
            res.Result.Data.forEach((obj: any) => {
              obj.FechaContratoString = this.dateUtil.formatDate(obj.FechaContrato, '/');
              obj.FechaFijacionContrato = this.dateUtil.formatDate(obj.FechaFijacionContrato, '/');
              obj.FechaEmbarque = obj.FechaEmbarque == null ? "": formatDate(obj.FechaEmbarque, 'MM/yyyy', 'en');
              obj.PrecioQQVenta = obj.PrecioQQVenta.toFixed(2);
              obj.UtilidadBruta = obj.UtilidadBruta.toFixed(2);
              obj.UtilidadNeta = obj.UtilidadNeta.toFixed(2);
              obj.FechaContratoCompraString = obj.FechaContratoCompra == null ? "": this.dateUtil.formatDate(obj.FechaContratoCompra, '/');
              obj.FechaFijacionContratoCompraString = obj.FechaFijacionContratoCompra == null ? "": this.dateUtil.formatDate(obj.FechaFijacionContratoCompra, '/');
              obj.FechaFacturaString = obj.FechaFactura == null ? "": this.dateUtil.formatDate(obj.FechaFactura, '/');
              obj.FechaFacturaCompraString = obj.FechaFacturaCompra == null ? "":  this.dateUtil.formatDate(obj.FechaFacturaCompra, '/');
              obj.FechaEntregaProductoString = obj.FechaEntregaProducto == null ? "":this.dateUtil.formatDate(obj.FechaEntregaProducto, '/');
              obj.FechaEntregaProductoCompraString = obj.FechaEntregaProductoCompra == null ? "":this.dateUtil.formatDate(obj.FechaEntregaProductoCompra, '/');
            });
            this.rows = res.Result.Data;
            this.tempData = this.rows;
          } else 
          {
            debugger
            const vArrHeaderExcel = [
              
              new HeaderExcel(this.tipoEmpresaId != '01'? "Contrato Venta":"Contrato", "center"),
              new HeaderExcel(this.tipoEmpresaId != '01'? "Fecha de Contrato Venta":"Fecha de Contrato", 'center', 'yyyy-MM-dd'),
              
              new HeaderExcel("Codigo Interno"),
             // new HeaderExcel("Tipo de Contrato"),
              new HeaderExcel("Codigo Cliente"),
              new HeaderExcel("Cliente")
            ];


            if(this.tipoEmpresaId != '01')
            {
              vArrHeaderExcel.push(

              new HeaderExcel("Nro Factura Venta"),
              new HeaderExcel("Moneda Factura Venta"),
              new HeaderExcel("Monto Factura Venta"),
              new HeaderExcel("Status Factura Venta"),
              new HeaderExcel("Fecha Factura Venta")
              )
            }

            vArrHeaderExcel.push(
              new HeaderExcel("Certificacion"),
              new HeaderExcel("Calidad"),
              new HeaderExcel("Mes de Embarque"),
              new HeaderExcel("Condición de Embarque"),
              new HeaderExcel("Nro. Contenedor"),
              new HeaderExcel("Cantidad"),
              new HeaderExcel("Tipo de Empaque"),
              new HeaderExcel("Kilos Netos"),
              new HeaderExcel("Kg. Netos en QQ"),
              new HeaderExcel("Kg. Neto en LB"),
              new HeaderExcel(this.tipoEmpresaId != '01'? "Fecha Fijación Contrato Venta":"Fecha Fijación Contrato"),
              new HeaderExcel("Estado de Fijación"),
              new HeaderExcel("Nivel Fijación"),
              new HeaderExcel("Diferencial"),
              new HeaderExcel("Precio por QQ Total"),
              new HeaderExcel("Precio a Facturar"),
              //new HeaderExcel("Nota de Crédito/Comisión"),
              //new HeaderExcel("Precio"),
              new HeaderExcel("PRxFT"),
              new HeaderExcel("Gastos de Exportación"),
              new HeaderExcel("Precio Total"),
              new HeaderExcel("Precio de Venta")

            )



            if(this.tipoEmpresaId != '01'){
              vArrHeaderExcel.push(
                 new HeaderExcel("Precio QQ Venta"),
                 new HeaderExcel("Precio QQ Compra"),
                 new HeaderExcel("Utilidad Bruta"),
                 new HeaderExcel("Gastos Exportación"),
                 new HeaderExcel("Comisión"),
                 new HeaderExcel("Utilidad Neta"),
                 new HeaderExcel("Ganancia Neta")
              )

            }



            vArrHeaderExcel.push(
              new HeaderExcel("Producto"),
              new HeaderExcel("Tipo de Producción"),
              new HeaderExcel("Estado", "center")

            )

           

            if(this.tipoEmpresaId != '01'){
              vArrHeaderExcel.push(
                 new HeaderExcel("Contrato Compra"),
                 new HeaderExcel("Fecha Contrato Compra"),
                 new HeaderExcel("RUC"),
                 new HeaderExcel("Razon Social"),
                 new HeaderExcel("Distrito"),
                 new HeaderExcel("Nro. Contenedor"),
                 new HeaderExcel("Cantidad"),
                 new HeaderExcel("Tipo de Empaque"),
                 new HeaderExcel("Kilos Netos"),
                 new HeaderExcel("Fecha Fijación Contrato"),
                 new HeaderExcel("Nro. Factura"),
                 new HeaderExcel("Fecha Factura"),
                 new HeaderExcel("Monto Factura"),
                 new HeaderExcel("Fecha Entrega Producto"),
              )

            }

            let vArrData: any[] = [];


            if(this.tipoEmpresaId != '01')
            {
              this.tempData.forEach(function(x)
              {
                vArrData.push([
                  x.Numero,
                  x.FechaContratoString,
                  x.CodigoInterno,               
                  x.NumeroCliente,
                  x.Cliente,
                  x.NumeroFactura,
                  x.MonedaFactura,
                  x.MontoFactura,
                  x.EstadoPagoFactura,
                  x.FechaFacturaString,
                  x.TipoCertificacion,
                  x.Calidad,
                  x.FechaEmbarque,
                  x.CondicionEmbarque,
                  x.CantidadContenedores,
                  x.TotalSacos,
                  x.TipoEmpaque,
                  x.PesoKilos,
                  x.KilosNetosQQ,
                  x.KilosNetosLB,
                  x.FechaFijacionContrato,
                  x.EstadoFijacion,
                  x.PrecioNivelFijacion,
                  x.Diferencial,
                  x.PUTotalA,
                  x.TotalFacturar1,                 
                  x.TotalFacturar2,
                  x.GastosExpCostos,
                  x.PUTotalC,
                  x.TotalFacturar3,
                  x.PrecioQQVenta,
                  x.PrecioQQCompra,
                  x.UtilidadBruta,
                  x.GastosExportacion,
                  x.Comision,
                  x.UtilidadNeta,
                  x.GananciaNeta,
                  x.Producto,
                  x.TipoProduccion,
                  x.Estado,
                  x.ContratoCompra,
                  x.FechaContratoCompraString,
                  x.RucProductor,
                  x.Productor,
                  x.Distrito,
                  x.NumeroContenedor,
                  x.Cantidad,
                  x.TipoEmpaqueCompra,
                  x.KilosNetos,
                  x.FechaFijacionContratoCompraString,
                  x.NumeroFacturaCompra,
                  x.FechaFacturaCompraString,
                  x.MontoFacturaCompra,
                  x.FechaEntregaProductoCompraString]);

              });
            }
            else            
            {       

              this.tempData.forEach(function(x)
              {
                vArrData.push([
                  x.Numero,
                  x.FechaContratoString,
                  x.CodigoInterno,               
                  x.NumeroCliente,
                  x.Cliente,
                  x.TipoCertificacion,
                  x.Calidad,
                  x.FechaEmbarque,
                  x.CondicionEmbarque,
                  x.CantidadContenedores,
                  x.TotalSacos,
                  x.TipoEmpaque,
                  x.PesoKilos,
                  x.KilosNetosQQ,
                  x.KilosNetosLB,
                  x.FechaFijacionContrato,
                  x.EstadoFijacion,
                  x.PrecioNivelFijacion,
                  x.Diferencial,
                  x.PUTotalA,
                  x.TotalFacturar1,                 
                  x.TotalFacturar2,
                  x.GastosExpCostos,
                  x.PUTotalC,
                  x.TotalFacturar3,
                  x.Producto,
                  x.TipoProduccion,
                  x.Estado
                  ]);

              });
            }
          

            this.excelService.ExportJSONAsExcel(vArrHeaderExcel, vArrData, 'Contratos');
          }
        } else {
          this.errorGeneral = { isError: true, msgError: res.Result.Message };
        }
      }, (err: any) => {
        this.spinner.hide();
        console.log(err);
        this.errorGeneral = { isError: true, msgError: this.msgErrorGenerico };
      });
    } else {

    }
  }

  Nuevo(): void {
    this.router.navigate(['/exportador/operaciones/contrato/create'])
  }

  Cancel(): void {
    if (this.selected.length > 0) {
      const form = this;
      swal.fire({
        title: 'Confirmación',
        text: `¿Está seguro de continuar con la anulación del contrato?.`,
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
      }).then((result) => {
        if (result.value) {
          form.CancelContract();
        }
      });
    }
  }

  CancelContract(): void {
    this.spinner.show();
    this.errorGeneral = { isError: false, msgError: '' };
    this.contratoService.Cancel({ ContratoId: this.selected[0].ContratoId, Usuario: this.userSession.Result.Data.NombreUsuario })
      .subscribe((res: any) => {
        this.spinner.hide();
        if (res.Result.Success) {
          this.alertUtil.alertOkCallback('CONFIRMACIÓN', 'Contrato anulado correctamente.', () => {
            this.Buscar();
          });
        } else {
          this.errorGeneral = { isError: true, msgError: res.Result.Message };
        }
      }, (err: any) => {
        console.log(err);
        this.spinner.hide();
        this.errorGeneral = { isError: true, msgError: this.msgErrorGenerico };
      })
  }

  Agregar(selected: any) {
    this.agregarContratoEvent.emit(selected)
  }


  Desasignar(): void {
    if (this.selected.length > 0)
    {
      if (this.selected[0].EstadoId == '03')
      {

        const form = this;
        swal.fire({
          title: 'Confirmación',
          text: `¿Está seguro de continuar con la desasignación del contrato?.`,
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
        }).then((result) => {
          if (result.value) {
            form.DesasignarContrato();
          }
        });
      }
      else {
        this.alertUtil.alertError("Error", "Solo se puede desasignar contratos con estado asignado.")
      }
    }
  }

  DesasignarContrato(): void {
    this.spinner.show();
    this.errorGeneral = { isError: false, msgError: '' };
    this.contratoService.Desasignar({ ContratoVentaId: this.selected[0].ContratoId, Usuario: this.userSession.Result.Data.NombreUsuario })
      .subscribe((res: any) => {
        this.spinner.hide();
        if (res.Result.Success) {
          this.alertUtil.alertOkCallback('CONFIRMACIÓN', 'Contrato desagignado correctamente.', () => {
            this.Buscar();
          });
        } else {
          this.errorGeneral = { isError: true, msgError: res.Result.Message };
        }
      }, (err: any) => {
        console.log(err);
        this.spinner.hide();
        this.errorGeneral = { isError: true, msgError: this.msgErrorGenerico };
      })
  }
}
