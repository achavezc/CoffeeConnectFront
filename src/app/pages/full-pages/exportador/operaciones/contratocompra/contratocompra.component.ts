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
import { ContratoCompraService } from '../../../../../services/contratocompra.service';
import { AlertUtil } from '../../../../../services/util/alert-util';
import { formatDate } from '@angular/common';
import {AuthService} from './../../../../../services/auth.service';


@Component({
  selector: 'app-contratocompra',
  templateUrl: './contratocompra.component.html',
  styleUrls: ['./contratocompra.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ContratoCompraComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private dateUtil: DateUtil,
    private spinner: NgxSpinnerService,
    private excelService: ExcelService,
    private maestroUtil: MaestroUtil,
    private contratoService: ContratoCompraService,
    private router: Router,
    private route: ActivatedRoute,
    private alertUtil: AlertUtil,
    private authService : AuthService) { }

  contratoForm: FormGroup;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  listProductos: any[];
  listTipoProduccion: any[];
  listEstadoFijacion: any[];
  listCondicionEntrega: any[];
  listCalidad: any[];
  listEstados: any[];
  listTipoContrato: any[];
  listMesEmbarque: any[];
  selectedProducto: any;
  selectedTipoProduccion: any;
  selectedCalidad: any;
  selectedCondicionEntrega: any;
  selectedEstadoFijacion: any;
  selectedEstado: any;
  selectedTipoContrato: any;
  selectedMesEmbarque: any;
  selected = [];
  limitRef = 10;
  rows = [];
  tempData = [];
  errorGeneral = { isError: false, msgError: '' };
  msgErrorGenerico = 'Ocurrio un error interno.';
  userSession: any;
  tipoEmpresaId = '';

  cantidadKilosNetosDetalle: Number = 0;


  page: any;
  readonly: boolean;
  selectedEstadoPagoFactura : any;
  listEstadoPagoFactura: any[];
  @Input() popUp = false;
  @Output() agregarContratoEvent = new EventEmitter<any>();


  ngOnInit(): void {
    this.userSession = JSON.parse(localStorage.getItem('user'));
    this.tipoEmpresaId = this.userSession.Result.Data.TipoEmpresaid;
    this.LoadForm();
    this.LoadCombos();
    this.contratoForm.controls['fechaInicial'].setValue(this.dateUtil.currentMonthAgo());
    this.contratoForm.controls['fechaFinal'].setValue(this.dateUtil.currentDate());
    this.page = this.route.routeConfig.data.title;
    //this.readonly= this.authService.esReadOnly(this.userSession.Result.Data.OpcionesEscritura);

  }

  LoadForm(): void {
    this.contratoForm = this.fb.group({
      nroContrato: [],
      ruc: [],
      fechaInicial: [, Validators.required],
      fechaFinal: [, Validators.required],
      descCliente: [],
      producto: [],
      tipoProduccion: [],
      calidad: [],
      estadoFijacion: [],
      condicionEntrega: [],
      estado: ['', Validators.required],
      tipoContrato: [],
      estadoPagoFactura : [],
      mesEmbarque: []
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
    this.maestroUtil.obtenerMaestros('EstadoContratoCompra', (res: any) => {
      if (res.Result.Success) {
        form.listEstados = res.Result.Data;
        if (this.popUp == true) 
        {
          
          switch (this.page) {
            case "Aduanas":
              this.selectedEstado = '03';
              break;
          case "Contratos":
              let selectarrayProd = [];
              selectarrayProd.push('01');//Ingresado
              selectarrayProd.push('03');//Asignado             
              this.selectedEstado = selectarrayProd;
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
    this.maestroUtil.obtenerMaestros('CondicionEntregaContratoCompra', (res: any) => {
      if (res.Result.Success) {
        form.listCondicionEntrega = res.Result.Data;
      }
    });
    this.maestroUtil.obtenerMaestros('ContratoEstadoFijacion', (res: any) => {
      if (res.Result.Success) {
        form.listEstadoFijacion = res.Result.Data;
        
        if (this.popUp == true) 
        {         
          switch (this.page) 
          {
            case "Aduanas":
              this.selectedEstadoFijacion = '02'
              this.contratoForm.controls.estadoFijacion.disable();
              break;        
            
          }    
        }
      }
    });
    this.maestroUtil.obtenerMaestros('TipoContratoCompra', (res: any) => {
      if (res.Result.Success) {
        form.listTipoContrato = res.Result.Data;
      }
    });
    this.maestroUtil.obtenerMaestros('MesEmbarqueVenta', (res: any) => {
      if (res.Result.Success) {
        form.listMesEmbarque = res.Result.Data;
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
      RucProductor: this.contratoForm.value.ruc ? this.contratoForm.value.ruc : '',
      RazonSocial: this.contratoForm.value.descCliente ? this.contratoForm.value.descCliente : '',
      ProductoId: this.contratoForm.value.producto ? this.contratoForm.value.producto : '',
      TipoProduccionId: this.contratoForm.value.tipoProduccion ? this.contratoForm.value.tipoProduccion : '',
      CalidadId: this.contratoForm.value.calidad ? this.contratoForm.value.calidad : '',
      //EstadoId: this.contratoForm.controls['estado'].value ? this.contratoForm.controls['estado'].value : '',
      EstadoId: this.contratoForm.controls['estado'].value ? this.contratoForm.controls['estado'].value.join('|') : '',
      EmpresaId: this.userSession.Result.Data.EmpresaId,
      CondicionEntregaId: this.contratoForm.value.condicionEntrega ? this.contratoForm.value.condicionEntrega : '',
      EstadoFijacionId: this.contratoForm.value.estadoFijacion ? this.contratoForm.value.estadoFijacion : '',
      TipoContratoId: this.contratoForm.value.tipoContrato ? this.contratoForm.value.tipoContrato : '',
      FechaInicio: this.contratoForm.value.fechaInicial ? this.contratoForm.value.fechaInicial : '',
      FechaFin: this.contratoForm.value.fechaFinal ? this.contratoForm.value.fechaFinal : '',
      EstadoPagoFacturaId: this.contratoForm.value.estadoPagoFactura ? this.contratoForm.value.estadoPagoFactura : '',
      MesEmbarque : this.contratoForm.value.mesEmbarque ? this.contratoForm.value.mesEmbarque : ''
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
              obj.FechaContrato = this.dateUtil.formatDate(obj.FechaContrato, '/');
              obj.FechaFijacionContrato = this.dateUtil.formatDate(obj.FechaFijacionContrato, '/');
              obj.MesEntrega = obj.FechaEntrega == null ? "" : formatDate(obj.FechaEntrega, 'MM/yyyy', 'en');
              obj.FechaEntrega = this.dateUtil.formatDate(obj.FechaEntrega, '/');
              obj.FechaFactura = this.dateUtil.formatDate(obj.FechaFactura, '/');
              obj.FechaPagoFactura = this.dateUtil.formatDate(obj.FechaPagoFactura, '/');
              obj.FechaEntregaProducto = this.dateUtil.formatDate(obj.FechaEntregaProducto, '/');
            });
            this.rows = res.Result.Data;
            this.tempData = this.rows;
          } else {
            const vArrHeaderExcel = [
              new HeaderExcel("Contrato Compra", "center"),
              new HeaderExcel("Fecha Contrato Compra", 'center', 'yyyy-MM-dd'), 
              new HeaderExcel("Contrato Venta"),
              new HeaderExcel("Ruc"),
              new HeaderExcel("Razon Social"),
              new HeaderExcel("Departamento"),
              new HeaderExcel("Provincia"),
              new HeaderExcel("Distrito"),
              new HeaderExcel("Condicion de Entrega"),
              new HeaderExcel("Fecha Entrega"),
              new HeaderExcel("Nro. Factura"),
              new HeaderExcel("Moneda Factura"),
              new HeaderExcel("Monto Factura"),
              new HeaderExcel("Fecha Factura"),
              new HeaderExcel("Fecha Entrega Producto"),
              new HeaderExcel("Status Pago Factura"),
              new HeaderExcel("Fecha Pago Factura"),
              new HeaderExcel("Periodo Cosecha"),
              new HeaderExcel("Certificacion"),
              new HeaderExcel("Mes de Entrega"),
              new HeaderExcel("Nro. Contenedor"),

              new HeaderExcel("Cantidad"),
              new HeaderExcel("Tipo de Empaque"),
              new HeaderExcel("Kilos Netos"),
              new HeaderExcel("Kg. Netos en QQ"),
              new HeaderExcel("Kg. Neto en LB"),
              new HeaderExcel("Fecha Fijación Contrato"),
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
              new HeaderExcel("Precio de Venta"),
              new HeaderExcel("Producto"),
              new HeaderExcel("Tipo de Producción"),
              new HeaderExcel("Estado", "center")
            ];

            let vArrData: any[] = [];
            this.tempData.forEach((x: any) => vArrData.push([
              x.Numero,
              x.FechaContrato,
              x.NumeroContratoVenta,
              x.RucProductor,
              x.Productor,
              x.Departamento,
              x.Provincia,
              x.Distrito,
              x.CondicionEntrega,
              x.FechaEntrega,
              x.NumeroFactura,
              x.MonedaFactura,
              x.MontoFactura,
              x.FechaFactura,
              x.FechaEntregaProducto,
              x.EstadoPagoFactura,
              x.FechaPagoFactura,
              x.PeriodosCosecha,
              x.TipoCertificacion,
              x.MesEntrega,
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
              // x.NotaCreditoComision,
              // x.PUTotalB,
              x.TotalFacturar2,
              x.GastosExpCostos,
              x.PUTotalC,
              x.TotalFacturar3,
              x.Producto,
              x.TipoProduccion,
              x.Estado]));
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
    this.router.navigate(['/exportador/operaciones/contratocompra/edit'])
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
    this.contratoService.Cancel({ ContratoCompraId: this.selected[0].ContratoCompraId, Usuario: this.userSession.Result.Data.NombreUsuario })
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
}
