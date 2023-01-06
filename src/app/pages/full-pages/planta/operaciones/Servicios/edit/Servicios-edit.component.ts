import { Component, OnInit, ViewEncapsulation, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatatableComponent, ColumnMode } from "@swimlane/ngx-datatable";
import { DateUtil } from '../../../../../../services/util/date-util';
import { AlertUtil } from '../../../../../../services/util/alert-util';
import { MaestroService } from '../../../../../../services/maestro.service';
import { OrdenProcesoService } from '../../../../../../services/orden-proceso.service';
import { OrdenProcesoServicePlanta } from '../../../../../../Services/orden-proceso-planta.service';
import{ PagoServicioPlantaService }from '../../../../../../Services/PagoServiciosPlanta.service';
import { NotaIngresoService } from '../../../../../../services/notaingreso.service';
import { ControlCalidadService } from '../../../../../../Services/control-calidad.service';
import { host } from '../../../../../../shared/hosts/main.host';
import { formatDate } from '@angular/common';
import{ServicioPlantaService}from'../../../../../../Services/ServicioPlanta.services';
import { AuthService } from './../../../../../../services/auth.service';

@Component({
  selector: 'app-Servicios-edit',
  templateUrl: './Servicios-edit.component.html',
  styleUrls: ['./Servicios-edit.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ServiciosEditComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private modalService: NgbModal,
    private dateUtil: DateUtil,
    private maestroService: MaestroService,
    private ordenProcesoService: OrdenProcesoService,
    private ordenProcesoServicePlanta: OrdenProcesoServicePlanta,
    private PagoServicioPlantaService:PagoServicioPlantaService,
    private route: ActivatedRoute,
    private router: Router,
    private ServicioPlantaService:ServicioPlantaService,
    private spinner: NgxSpinnerService,
    private alertUtil: AlertUtil,
    private notaIngresoService: NotaIngresoService,
    private controlCalidad: ControlCalidadService,
    private authService: AuthService) { }


  error: any = { isError: false, errorMessage: '' };
  errorFecha: any = { isError: false, errorMessage: '' };
  ServicioPlantaEditForm: FormGroup;
  vMsgErrGenerico = "Ha ocurrido un error interno.";
  listEstado = [];
  tipoProcesoSecado = '02';
  tipoProcesoReproceso = '03';
  listTipoProcesos = [];
  listTipoProduccion = [];
  esHumedo = false;
  submitted = false;
  esReproceso = false;
  //listCertificacion = [];

  listTipoServicio: [] = [];
  selectedTipoServicio: any;
  listTipoComprobante: [] = [];
  selectedTipoComprobante: any;
  listTipoUnidadMedida:[] =[];
  selectedTipoUnidadMedida:any;

  listTipoMoneda:[]=[];
  SelectedTipoMoneda:any;

  listTipoMonedaPago:[]=[];
  SelectedTipoMonedaPago:any;


  listTipoBanco:[]=[];
  selectedTipoBanco:any;

  listTipoBancoPago:[]=[];
  selectedTipoBancoPago:any;

  listTipoOperacionServicio:[]=[];
  selectedTipoOperacionServicio:any;

  listTipoOperacionServicioPago:[]=[];
  selectedTipoOperacionServicioPago:any;

  listTipoEstadoServicio:[]=[];
  selectedTipoEstadoServicio:any;




  listaCertificacion: any[];
  listProducto = [];
  listCertificadora = [];
  listSubProducto = [];
  listEmpaque = [];
  listTipo = [];
  listProductoTerminado = [];
  listSubProductoTerminado = [];
  listCalidad = [];
  listGrado = [];
  selectedGrado: any;
  selectedCalidad: any;
  selectedProductoTerminado: any;
  selectedSubProductoTerminado: any;
  selectedTipo: any;
  selectedEmpaque: any;
  selectedSubProducto: any;
  selectedCertificadora: any;
  selectedProducto: any;
  selectedTipoProduccion: any;
  selectedCertificacion: any;
  selectOrganizacion = [];
  selectedEstado: any;
  selectedTipoProceso: any;
  vSessionUser: any;
  errorGeneral: any = { isError: false, errorMessage: '' };
  mensajeErrorGenerico = "Ocurrio un error interno.";
  ServicioPlantaId: Number;
 // errorGeneral = { isError: false, msgError: '' };
  msgErrorGenerico = 'Ocurrio un error interno.';
  rowsDetails = [];
  rows = [];
  tempData = [];
  selected = [];
  //limitRef: number = 10;
  
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild(DatatableComponent) tblDetails: DatatableComponent;
  @ViewChild(DatatableComponent) tableLotesDetalle: DatatableComponent;
  isLoading = false;
  fileName = "";
  popUp = true;
  public rowsLotesDetalle = [];
  selectLoteDetalle = [];
  public ColumnMode = ColumnMode;
  listaNotaIngreso = [];
  private tempDataLoteDetalle = [];
  filtrosLotesID: any = {};
  detalle: any;
  empresa: any[];
  readonly: boolean;
  OcultarSeccion: boolean =true;
  public limitRef = 20;
  averageExportable: Number = 0;
  averageDescarte: Number = 0;
  averageCascarilla: Number = 0;
  formGroupCantidad: FormGroup;
  groupCantidad = {};


  async ngOnInit() {
    this.vSessionUser = JSON.parse(localStorage.getItem('user'));
    //this
    this.ServicioPlantaId = this.route.snapshot.params['id'] ? Number(this.route.snapshot.params['id']) : 0;
    await this.LoadForm();
    this.ServicioPlantaEditForm.controls['FechaFinPagos'].setValue(this.dateUtil.currentDate());
    this.ServicioPlantaEditForm.controls['FechaInicioPagos'].setValue(this.dateUtil.currentMonthAgo()); 

    this.ServicioPlantaEditForm.controls.razonSocialCabe.setValue(this.vSessionUser.Result.Data.RazonSocialEmpresa);
    this.ServicioPlantaEditForm.controls.direccionCabe.setValue(this.vSessionUser.Result.Data.DireccionEmpresa);
    this.ServicioPlantaEditForm.controls.nroRucCabe.setValue(this.vSessionUser.Result.Data.RucEmpresa);
    this.ServicioPlantaEditForm.controls.responsableComercial.setValue(this.vSessionUser.Result.Data.NombreCompletoUsuario);

    this.GetTipoProcesos();
    this.GetListTipoServicio();
    this.GetListTipoComprobante();
    this.GetListUnidadMedida();
    this.GetListaTipoMoneda();
    this.GetListaTipoMonedaPago();
    this.GetListaTipoBanco();
    this.GetListaTipoBancoPago();

    this.GetListaTipoOperacionServicios();
    this.GetListaTipoEstado2();
    this.GetEstado();
    //this.GetTipoProduccion();
    this.GetCertificacion();
    this.GetProducto();
    this.GetCertificadora();
    this.GetEmpaque();
    this.GetTipo();
    //this.GetProductoTerminado();
    //this.GetCalidad();
    //this.GetGrado();
    if (this.ServicioPlantaId <= 0) {
      this.ServicioPlantaEditForm.controls.fechaCabe.setValue(this.dateUtil.currentDate());
      this.ServicioPlantaEditForm.controls.fecFinProcesoPlanta.setValue(this.dateUtil.currentDate());
     //this.ServicioPlantaEditForm.controls['FechaFinPagos'].setValue(this.dateUtil.currentDate());
     //this.ServicioPlantaEditForm.controls['FechaInicioPagos'].setValue(this.dateUtil.currentMonthAgo()); 
     //this.addRowDetail();
    } else if (this.ServicioPlantaId > 0) {
      this.ConsultaPorId(this.ServicioPlantaId);
    }
    
    //this.readonly = this.authService.esReadOnly(this.vSessionUser.Result.Data.OpcionesEscritura, this.ServicioPlantaEditForm);
    this.OcultarSecciones();
  }

  changeTipos(e)
  {
     
    this.cambiarPorTipos(e.Codigo);
  }
  cambiarPorTipos(codigo) 
  {    
   // debugger
    if (codigo == this.tipoProcesoSecado) 
    {
      this.ServicioPlantaEditForm.controls.cantidadDefectos.disable();

      
      this.ServicioPlantaEditForm.controls.producto.setValue("01") // Pergamino
      this.ServicioPlantaEditForm.controls.producto.disable();

      
      

      this.esReproceso = false;
       
      this.ServicioPlantaEditForm.controls.productoTerminado.enable();
      this.ServicioPlantaEditForm.controls.productoTerminado.setValue("")
      this.GetProductoTerminado();
      this.ServicioPlantaEditForm.controls.productoTerminado.setValue("01") // Pergamino
       
      this.ServicioPlantaEditForm.controls.productoTerminado.disable();
    }
    else 
    {
     if(codigo == this.tipoProcesoReproceso) 
     {
        this.esReproceso = true;
        this.listProductoTerminado= [];
        this.ServicioPlantaEditForm.controls.productoTerminado.enable();
        this.ServicioPlantaEditForm.controls.productoTerminado.setValue("")
        this.GetSubProductoTerminado();
        
        this.ServicioPlantaEditForm.controls.producto.setValue("02") // Exportable
        this.ServicioPlantaEditForm.controls.producto.disable();
        
     }
     else
     {
      this.esReproceso = false;
      this.listProductoTerminado= [];
       
      this.ServicioPlantaEditForm.controls.productoTerminado.enable();
      this.ServicioPlantaEditForm.controls.productoTerminado.setValue("")

      this.GetProductoTerminado();
      this.ServicioPlantaEditForm.controls.producto.disable();
      this.ServicioPlantaEditForm.controls.producto.setValue("01") // Pergamino
      
       
      this.ServicioPlantaEditForm.controls.productoTerminado.setValue("02") // Exportable
      this.ServicioPlantaEditForm.controls.productoTerminado.disable();
     }

      this.ServicioPlantaEditForm.controls.cantidadDefectos.enable();
    }
  }
  
  

  async GetSubProductoTerminado() {
    const data = await this.maestroService.obtenerMaestros('SubProductoPlanta').toPromise();
    if (data.Result.Success) {
      this.listProductoTerminado = data.Result.Data.filter(obj => obj.Val1 == '02'); //Exportable
    }
  }


  agregarOrdenProceso(e) {
    this.ServicioPlantaEditForm.controls.ordenProcesoComercial.setValue(e[0].Numero);
    this.ServicioPlantaEditForm.controls.idOrdenProcesoComercial.setValue(e[0].OrdenProcesoId);
    this.ServicioPlantaEditForm.controls.rucOrganizacion.setValue(e[0].RucEmpresaProcesadora);
    this.ServicioPlantaEditForm.controls.nombreOrganizacion.setValue(e[0].RazonSocialEmpresaProcesadora);
    this.SearchByidOrdenProceso(e[0].OrdenProcesoId);

  }

  SearchByidOrdenProceso(id: any): void {
    this.spinner.show();
    this.errorGeneral = { isError: false, msgError: '' };
    this.ordenProcesoService.SearchById(id).subscribe((res) => {
      if (res.Result.Success) {
        if (res.Result.Data) {
          var data = res.Result.Data;
          this.autocompleteOrdenProcesoComercial(data);

        }

      } else {
        this.errorGeneral = { isError: true, msgError: res.Result.Message };
        this.modalService.dismissAll();
        this.spinner.hide();
      }
    }, (err) => {
      console.log(err);
      this.spinner.hide();
      this.errorGeneral = { isError: true, msgError: this.msgErrorGenerico };
      this.modalService.dismissAll();
    });

  }

  SearchByidOrdenProcesoNumero(id: any): void {
    this.spinner.show();
    this.errorGeneral = { isError: false, msgError: '' };
    this.ordenProcesoService.SearchById(id).subscribe((res) => {
      if (res.Result.Success) {
        if (res.Result.Data) {
          var data = res.Result.Data;
          this.ServicioPlantaEditForm.controls.ordenProcesoComercial.setValue(data.Numero);
          this.ServicioPlantaEditForm.controls.idOrdenProcesoComercial.setValue(data.OrdenProcesoId);
          this.ServicioPlantaEditForm.controls.rucOrganizacion.setValue(data.Ruc);
          this.ServicioPlantaEditForm.controls.nombreOrganizacion.setValue(data.RazonSocial);
        }

      } else {
        this.errorGeneral = { isError: true, msgError: res.Result.Message };
        this.modalService.dismissAll();
        this.spinner.hide();
      }
    }, (err) => {
      console.log(err);
      this.spinner.hide();
      this.errorGeneral = { isError: true, msgError: this.msgErrorGenerico };
      this.modalService.dismissAll();
    });

  }
  async autocompleteOrdenProcesoComercial(data) {

    await this.GetCertificadora();
    this.ServicioPlantaEditForm.controls.ordenProcesoComercial.setValue(data.Numero);
    this.ServicioPlantaEditForm.controls.idOrdenProcesoComercial.setValue(data.OrdenProcesoId);
    this.ServicioPlantaEditForm.controls.rucOrganizacion.setValue(data.Ruc);
    this.ServicioPlantaEditForm.controls.nombreOrganizacion.setValue(data.RazonSocial);

    this.ServicioPlantaEditForm.controls.tipoProceso.setValue(data.TipoProcesoId);
    this.ServicioPlantaEditForm.controls.tipoProduccion.setValue(data.TipoProduccionId);

    //this.ordenProcesoEditForm.controls.certificacion.setValue(data.TipoCertificacionId);
    //this.ordenProcesoEditForm.controls["certificacion"].setValue(data.TipoCertificacionId);
    this.ServicioPlantaEditForm.controls.certificacion.setValue(data.CertificacionId.split('|').map(String));
    this.ServicioPlantaEditForm.controls.producto.setValue(data.ProductoId);
    this.ServicioPlantaEditForm.controls.certificadora.setValue(data.EntidadCertificadoraId);

    //this.ordenProcesoEditForm.controls.certificadora.setValue(data.EntidadCertificadoraId);
    this.ServicioPlantaEditForm.controls.subProducto.setValue(data.SubProductoId);
    this.ServicioPlantaEditForm.controls.organizacionId.setValue(data.EmpresaProcesadoraId);


    this.ServicioPlantaEditForm.controls.empaque.setValue(data.EmpaqueId);
    this.ServicioPlantaEditForm.controls.tipo.setValue(data.TipoId);
    this.ServicioPlantaEditForm.controls.productoTerminado.setValue(data.ProductoTerminadoId);
    this.ServicioPlantaEditForm.controls.cantidad.setValue(data.TotalSacos);
    this.ServicioPlantaEditForm.controls.subProductoTerminado.setValue(data.SubProductoId);
    this.ServicioPlantaEditForm.controls.pesoSaco.setValue(data.PesoPorSaco);
    this.ServicioPlantaEditForm.controls.calidad.setValue(data.CalidadId);
    this.ServicioPlantaEditForm.controls.totalKilosBrutos.setValue(data.PesoKilos);
    this.ServicioPlantaEditForm.controls.grado.setValue(data.GradoId);
    this.ServicioPlantaEditForm.controls.cantidadContenedores.setValue(data.CantidadContenedores);
    this.ServicioPlantaEditForm.controls.cantidadDefectos.setValue(data.PreparacionCantidadDefectos);

    this.ServicioPlantaEditForm.controls.empaque.disable();
    this.ServicioPlantaEditForm.controls.tipo.disable();
    this.ServicioPlantaEditForm.controls.productoTerminado.disable();
    this.ServicioPlantaEditForm.controls.cantidad.disable();
    this.ServicioPlantaEditForm.controls.subProductoTerminado.disable();
    this.ServicioPlantaEditForm.controls.pesoSaco.disable();
    this.ServicioPlantaEditForm.controls.calidad.disable();
    this.ServicioPlantaEditForm.controls.totalKilosBrutos.disable();
    this.ServicioPlantaEditForm.controls.grado.disable();
    this.ServicioPlantaEditForm.controls.cantidadContenedores.disable();
    this.ServicioPlantaEditForm.controls.cantidadDefectos.disable();

    this.ServicioPlantaEditForm.controls.tipoProceso.disable();
    this.ServicioPlantaEditForm.controls.rucOrganizacion.disable();
    this.ServicioPlantaEditForm.controls.nombreOrganizacion.disable();
    this.ServicioPlantaEditForm.controls.tipoProduccion.disable();
    this.ServicioPlantaEditForm.controls.certificacion.disable();
    this.ServicioPlantaEditForm.controls.producto.disable();
    this.ServicioPlantaEditForm.controls.certificadora.disable();
    this.ServicioPlantaEditForm.controls.subProducto.disable();
    this.spinner.hide();
    this.modalService.dismissAll();
  }
  LoadForm(): void {
    this.ServicioPlantaEditForm = this.fb.group({
     
      idOrdenProceso: [],
      organizacionId: [],
      razonSocialCabe: ['',],
      nroOrden: [],
      direccionCabe: ['',],
      certificacion: ['',],
      fechaCabe: ['',],
      nroRucCabe: ['',],
      idContrato: ['',],
      numeroContrato: ['',],
      idCliente: ['',],
      codCliente: ['',],
      cliente: ['',],
      idDestino: ['',],
      destino: ['',],
      porcenRendimiento: ['',],
      producto: ['',''],
      cantidadDefectos: ['',],
      responsableComercial: [],
      file: [],
      tipoProceso: ['',],
      observaciones: [''],
      pathFile: [],
      estado: ['',],
      ordenProcesoComercial: [],
      idOrdenProcesoComercial: [],
      rucOrganizacion: ['',],
      nombreOrganizacion: [],
      certificadora: ['',],
      empaque: ['', ],
      tipo: ['',],
      productoTerminado: ['',],
      fechaInicio: [],
      fechaFin: [],
/////DATOS DE PANTALLA EDIT DE SERVICIOS PLANTA
      ServicioPlantaId:['',''],
      EmpresaId:['',''],
      EmpresaClienteId:['',''],
      /////////////////7
      RazonSocialEmpresaCliente:['',''],
      RucEmpresaCliente:['',],
      TipoServicioId:['',''],
      TipoServicio:[],
      TipoComprobante:[],
      //TipoComprobanteId:['',''],
      Numero: ['', ''],
      NumeroOperacionRelacionada: ['', ''],
      SerieComprobante: ['', ''],
      NumeroComprobante: ['', ''],
      FechaDocumento: ['', ''],
      FechaRegistro:['',''],
      SerieDocumento: ['', ''],
      NumeroDocumento: ['', ''],
      UnidadMedida: ['', ''],
      UnidadMedidaId:['',''],
      Cantidad: ['', ''],
      PrecioUnitario: ['', ''],
      Importe: ['', ''],
      PorcentajeTIRB: ['', ''],
      Moneda: ['', ''],
      MonedaId:['',''],
      TotalImporte: ['', ''],
      Observaciones: ['', ''],
      estadoServicio:['',''],
      /////////////Pagos Servicios//////////////77
      NumeroPagos:['',''],
      BancoPagos:['',''],
      NumeroOperacionPagos:['',''],
      MonedaPagos:['',],
      TipoOperacion:['',''],
      TipoOperacionPagoServicioId:['',''],
      TipoOperacionPago:['',''],
      EstadoPagos:[],
      //FechaOperacion:['',''],
      FechaInicioPagos:['',''],
      FechaFinPagos:['',''],
      //////Grilla campos////////////
      FechaOperacionPagos:['',''],

    });
    this.ServicioPlantaEditForm.controls.estado.disable();
  }

 

  

  get f() {
    return this.ServicioPlantaEditForm.controls;
  }

  async GetTipoProcesos() {
    const res = await this.maestroService.obtenerMaestros('TipoProcesoPlanta').toPromise();
    if (res.Result.Success) {
      this.listTipoProcesos = res.Result.Data;
    }
  }

  async GetListTipoServicio() {
    let res = await this.maestroService.obtenerMaestros('TipoServicioPlanta').toPromise();
    if (res.Result.Success) {
      this.listTipoServicio = res.Result.Data;
    }
  }

  async GetListTipoComprobante() {
    let res = await this.maestroService.obtenerMaestros('TipoComprobantePlanta').toPromise();
    if (res.Result.Success) {
      this.listTipoComprobante = res.Result.Data;
    }
  }

  

  async GetListUnidadMedida() {
    let res = await this.maestroService.obtenerMaestros('UnidadMedidaServicioPlanta').toPromise();
    if (res.Result.Success) {
      this.listTipoUnidadMedida = res.Result.Data;
    }
  }

  
  async GetListaTipoMoneda () {
    let res = await this.maestroService.obtenerMaestros('Moneda').toPromise();
    if (res.Result.Success) {
      this.listTipoMoneda = res.Result.Data;
    }
  }

  async GetListaTipoMonedaPago () {
    let res = await this.maestroService.obtenerMaestros('Moneda').toPromise();
    if (res.Result.Success) {
      this.listTipoMonedaPago = res.Result.Data;
    }
  }


  async GetListaTipoBancoPago () {
    let res = await this.maestroService.obtenerMaestros('Banco').toPromise();
    if (res.Result.Success) {
      this.listTipoBancoPago = res.Result.Data;
    }
  }

  async GetListaTipoBanco () {
    let res = await this.maestroService.obtenerMaestros('Banco').toPromise();
    if (res.Result.Success) {
      this.listTipoBanco = res.Result.Data;
    }
  }

  async GetListaTipoOperacionServicios () {
    let res = await this.maestroService.obtenerMaestros('TipoOperacionPagoServicio').toPromise();
    if (res.Result.Success) {
      this.listTipoOperacionServicio = res.Result.Data;
    }
  }

  async GetListaTipoOperacionServiciosPago () {
    let res = await this.maestroService.obtenerMaestros('TipoOperacionPagoServicio').toPromise();
    if (res.Result.Success) {
      this.listTipoOperacionServicioPago = res.Result.Data;
    }
  }

  async GetListaTipoEstado2 () {
    let res = await this.maestroService.obtenerMaestros('EstadoPagoServicio').toPromise();
    if (res.Result.Success) {
      this.listTipoEstadoServicio = res.Result.Data;
    }
  }




  async GetEstado() {
    const res = await this.maestroService.obtenerMaestros('EstadoOrdenProcesoPlanta').toPromise();
    if (res.Result.Success) {
      this.listEstado = res.Result.Data;
    }
  }


  async GetProducto() {
    const res = await this.maestroService.obtenerMaestros('ProductoPlanta').toPromise();
    if (res.Result.Success) {
      this.listProducto = res.Result.Data;
    }
  }
  async GetCertificadora() {
    const res = await this.maestroService.obtenerMaestros('EntidadCertificadoraPlanta').toPromise();
    if (res.Result.Success) {
      this.listCertificadora = res.Result.Data;
    }
  }

  async GetEmpaque() {
    const res = await this.maestroService.obtenerMaestros('Empaque').toPromise();
    if (res.Result.Success) {
      this.listEmpaque = res.Result.Data;
    }
  }
  async GetTipo() {
    const res = await this.maestroService.obtenerMaestros('TipoEmpaque').toPromise();
    if (res.Result.Success) {
      this.listTipo = res.Result.Data;
    }
  }

  async GetProductoTerminado() {
    const res = await this.maestroService.obtenerMaestros('ProductoPlanta').toPromise();
    if (res.Result.Success) {
      this.listProductoTerminado = res.Result.Data;
    }
  }


  async OcultarSecciones(){

    if(  this.ServicioPlantaId > 0){//0 es nuevo 
      //ocultar secciones 
      this.OcultarSeccion = true;

    }else {
      //mostrar secciones  con valor de id 
      this.OcultarSeccion = false;

    }
  }



  GetDataModal(event: any): void {
    this.modalService.dismissAll();
  }

  async AutocompleteDataContrato(obj: any) {
    let empaque_Tipo = '';
    if (obj.ContratoId)
      this.ServicioPlantaEditForm.controls.idContrato.setValue(obj.ContratoId);

    if (obj.Numero)
      this.ServicioPlantaEditForm.controls.nroContrato.setValue(obj.Numero);

    if (obj.ClienteId)
      this.ServicioPlantaEditForm.controls.idCliente.setValue(obj.ClienteId);

    if (obj.NumeroCliente)
      this.ServicioPlantaEditForm.controls.codCliente.setValue(obj.NumeroCliente);

    if (obj.Cliente)
      this.ServicioPlantaEditForm.controls.cliente.setValue(obj.Cliente);

    if (obj.TipoProduccion)
      this.ServicioPlantaEditForm.controls.tipoProduccion.setValue(obj.TipoProduccion);

    if (obj.TipoCertificacion)
      this.ServicioPlantaEditForm.controls.certificacion.setValue(obj.TipoCertificacion);

    if (obj.Empaque)
      empaque_Tipo = obj.Empaque;
    if (empaque_Tipo)
      empaque_Tipo = empaque_Tipo + ' - '
    if (obj.TipoEmpaque)
      empaque_Tipo = empaque_Tipo + obj.TipoEmpaque;
    if (empaque_Tipo)
      this.ServicioPlantaEditForm.controls.empaqueTipo.setValue(empaque_Tipo);

    if (obj.TotalSacos)
      this.ServicioPlantaEditForm.controls.cantidad.setValue(obj.TotalSacos);

    if (obj.PesoPorSaco)
      this.ServicioPlantaEditForm.controls.pesoSacoKG.setValue(obj.PesoPorSaco);

    if (obj.PesoKilos)
      this.ServicioPlantaEditForm.controls.totalKilosNetos.setValue(obj.PesoKilos);

    if (obj.Producto)
      this.ServicioPlantaEditForm.controls.producto.setValue(obj.Producto);

    if (obj.SubProducto)
      this.ServicioPlantaEditForm.controls.subProducto.setValue(obj.SubProducto);

    if (obj.Calidad)
      this.ServicioPlantaEditForm.controls.calidad.setValue(obj.Calidad);

    if (obj.Grado)
      this.ServicioPlantaEditForm.controls.grado.setValue(obj.Grado);

    if (obj.PreparacionCantidadDefectos)
      this.ServicioPlantaEditForm.controls.cantidadDefectos.setValue(obj.PreparacionCantidadDefectos);
  }

  GetDataEmpresa(event: any): void {
    this.selectOrganizacion = event;
    if (this.selectOrganizacion[0]) {

      //this.notaIngredoFormEdit.controls['codigoOrganizacion'].setValue(this.selectOrganizacion[0].Ruc);
      this.ServicioPlantaEditForm.controls['nombreOrganizacion'].setValue(this.selectOrganizacion[0].RazonSocial);
      this.ServicioPlantaEditForm.controls['rucOrganizacion'].setValue(this.selectOrganizacion[0].Ruc);
      this.ServicioPlantaEditForm.controls['organizacionId'].setValue(this.selectOrganizacion[0].EmpresaProveedoraAcreedoraId);
    }
    this.modalService.dismissAll();
  }

  async GetCertificacion() {
    const res = await this.maestroService.obtenerMaestros('TipoCertificacionPlanta').toPromise();
    if (res.Result.Success) {
      this.listaCertificacion = res.Result.Data;
    }
  }

  openModal(modal: any): void {

    this.modalService.open(modal, { windowClass: 'dark-modal', size: 'xl' });

    //this.modalService.open(modal, { windowClass: 'dark-modal', size: 'xl', centered: true });
  }

  openModalServicioPlanta(modalServicoPlanta) {
    this.modalService.open(modalServicoPlanta, { windowClass: 'dark-modal', size: 'xl' });

  }

  openModalNotaIngreso(modalAlmacenMateriaPrima: any, modalAlmacenProductoTerminado: any): void {
    
    var tipoProceso = this.ServicioPlantaEditForm.controls["tipoProceso"].value;

    if (tipoProceso) {
      if (tipoProceso != '03') //Reproceso
      {
        this.modalService.open(modalAlmacenMateriaPrima, { windowClass: 'dark-modal', size: 'xl' });
      }
      else {
        this.modalService.open(modalAlmacenProductoTerminado, { windowClass: 'dark-modal', size: 'xl' });
      }
    }
    else {
      this.alertUtil.alertWarning("Oops...!", "Seleccione Tipo de Proceso");

    }
    //this.modalService.open(modal, { windowClass: 'dark-modal', size: 'xl', centered: true });
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

  GetRequest(): any {

    const form = this.ServicioPlantaEditForm.value;
   // this.formGroupCantidad = new FormGroup(this.groupCantidad);
    /* this.rowsDetails.forEach(data =>
       {
         debugger
         let cantidad =Number(this.formGroupCantidad.get(data.NotaIngresoAlmacenPlantaId+ '%cantidad').value)
         data.Cantidad = cantidad;
       }); */

    

    const request =
    {
    /*
      OrdenProcesoPlantaId: this.codeProcessOrder ? this.codeProcessOrder : 0,
      EmpresaId: this.vSessionUser.Result.Data.EmpresaId,
      OrganizacionId: form.organizacionId ? form.organizacionId : 0,
      TipoProcesoId: this.ordenProcesoEditForm.controls["tipoProceso"].value ? this.ordenProcesoEditForm.controls["tipoProceso"].value : '',
      NumeroContrato: this.ordenProcesoEditForm.controls["numeroContrato"].value ? this.ordenProcesoEditForm.controls["numeroContrato"].value : '',
      OrdenProcesoId: form.idOrdenProcesoComercial ? form.idOrdenProcesoComercial : null,
      EntidadCertificadoraId: this.ordenProcesoEditForm.controls["certificadora"].value ? this.ordenProcesoEditForm.controls["certificadora"].value : '',
      CertificacionId: this.ordenProcesoEditForm.controls["certificacion"].value ? this.ordenProcesoEditForm.controls["certificacion"].value.join('|') : '',

      ProductoId: this.ordenProcesoEditForm.controls["producto"].value ? this.ordenProcesoEditForm.controls["producto"].value : '',
      ProductoIdTerminado: this.ordenProcesoEditForm.controls["productoTerminado"].value ? this.ordenProcesoEditForm.controls["productoTerminado"].value : '',
      EmpaqueId: this.ordenProcesoEditForm.controls["empaque"].value ? this.ordenProcesoEditForm.controls["empaque"].value : '',
      TipoId: this.ordenProcesoEditForm.controls["tipo"].value ? this.ordenProcesoEditForm.controls["tipo"].value : '',
      CantidadDefectos: this.ordenProcesoEditForm.controls["cantidadDefectos"].value ? this.ordenProcesoEditForm.controls["cantidadDefectos"].value : 0,
      FechaInicioProceso: form.fechaInicio ? form.fechaInicio : null,
      FechaFinProceso: form.fechaFin ? form.fechaFin : null,
      Observacion: form.observaciones ? form.observaciones : '',
      EstadoId: '01',
      Usuario: this.vSessionUser.Result.Data.NombreUsuario,
      OrdenProcesoPlantaDetalle: this.rowsDetails.filter(x => x.NotaIngresoAlmacenPlantaId),
      */
     ///////////datos de campos de api servicios////
     //ServicioPlantaId: this.codeProcessOrder ? this.codeProcessOrder : 0,
     ServicioPlantaId: this.ServicioPlantaEditForm.controls["ServicioPlantaId"].value ? this.ServicioPlantaEditForm.controls["ServicioPlantaId"].value : 0,
     Numero: this.ServicioPlantaEditForm.controls["Numero"].value ? this.ServicioPlantaEditForm.controls["Numero"].value : '',
     NumeroOperacionRelacionada: this.ServicioPlantaEditForm.controls["NumeroOperacionRelacionada"].value ? this.ServicioPlantaEditForm.controls["NumeroOperacionRelacionada"].value : '',
     TipoServicioId: this.ServicioPlantaEditForm.controls["TipoServicio"].value ? this.ServicioPlantaEditForm.controls["TipoServicio"].value : '',
     TipoComprobanteId: this.ServicioPlantaEditForm.controls["TipoComprobante"].value ? this.ServicioPlantaEditForm.controls["TipoComprobante"].value : '',
     SerieComprobante:this.ServicioPlantaEditForm.controls["SerieComprobante"].value ? this.ServicioPlantaEditForm.controls["SerieComprobante"].value : '',
     NumeroComprobante:this.ServicioPlantaEditForm.controls["NumeroComprobante"].value ? this.ServicioPlantaEditForm.controls["NumeroComprobante"].value : '',
     FechaDocumento:this.ServicioPlantaEditForm.controls["FechaDocumento"].value ? this.ServicioPlantaEditForm.controls["FechaDocumento"].value : '',
     SerieDocumento:this.ServicioPlantaEditForm.controls["SerieDocumento"].value ? this.ServicioPlantaEditForm.controls["SerieDocumento"].value : '',
     NumeroDocumento:this.ServicioPlantaEditForm.controls["NumeroDocumento"].value ? this.ServicioPlantaEditForm.controls["NumeroDocumento"].value : '',
     UnidadMedidaId:this.ServicioPlantaEditForm.controls["UnidadMedida"].value ? this.ServicioPlantaEditForm.controls["UnidadMedida"].value : '',
     Cantidad:this.ServicioPlantaEditForm.controls["Cantidad"].value ? this.ServicioPlantaEditForm.controls["Cantidad"].value : 0,
     PrecioUnitario:this.ServicioPlantaEditForm.controls["PrecioUnitario"].value ? this.ServicioPlantaEditForm.controls["PrecioUnitario"].value : 0,
     Importe:this.ServicioPlantaEditForm.controls["Importe"].value ? this.ServicioPlantaEditForm.controls["Importe"].value : 0,
     PorcentajeTIRB:this.ServicioPlantaEditForm.controls["PorcentajeTIRB"].value ? this.ServicioPlantaEditForm.controls["PorcentajeTIRB"].value : 0,
     MonedaId:this.ServicioPlantaEditForm.controls["Moneda"].value ? this.ServicioPlantaEditForm.controls["Moneda"].value : '',
     TotalImporte:this.ServicioPlantaEditForm.controls["TotalImporte"].value ? this.ServicioPlantaEditForm.controls["TotalImporte"].value : 0,
     Observaciones:this.ServicioPlantaEditForm.controls["Observaciones"].value ? this.ServicioPlantaEditForm.controls["Observaciones"].value : '',
     //EstadoId:this.ordenProcesoEditForm.controls["estadoServicio"].value ? this.ordenProcesoEditForm.controls["estadoServicio"].value : '',
     Usuario: this.vSessionUser.Result.Data.NombreUsuario,
     EmpresaId: this.vSessionUser.Result.Data.EmpresaId,
     EmpresaClienteId:this.ServicioPlantaEditForm.controls["organizacionId"].value ? this.ServicioPlantaEditForm.controls["organizacionId"].value : 0
     

    }
    
    //let json = JSON.stringify(request);
    return request;


  }

  buscar(): void {
    this.Search();
  }
  


  Search(): void {
    if (!this.ServicioPlantaEditForm.invalid) {
      this.spinner.show();
      const request = this.getRequestPagoConsultar();
      this.PagoServicioPlantaService.Consultar(request)
      .subscribe((res: any) => {
        this.spinner.hide();
        if (res.Result.Success) {
          res.Result.Data.forEach(x => {
          //x.FechaInicio = this.dateUtil.formatDate(x.FechaInicio)
          //x.FechaFin =  this.dateUtil.formatDate(x.FechaFin);
          x.FechaOperacion =  this.dateUtil.formatDate(x.FechaOperacion);
          });
            this.tempData = res.Result.Data;
            this.rows = [...this.tempData];
          this.errorGeneral = { isError: false, msgError: '' };
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

  getRequestPagoConsultar(): any {
      
    
    const form = this.ServicioPlantaEditForm.value;

      const request =
     {
      
        Numero: this.ServicioPlantaEditForm.controls["NumeroPagos"].value ? this.ServicioPlantaEditForm.controls["NumeroPagos"].value : '',
        NumeroOperacion:  this.ServicioPlantaEditForm.controls["NumeroOperacionPagos"].value ?  this.ServicioPlantaEditForm.controls["NumeroOperacionPagos"].value : '',
        TipoOperacionPagoServicioId:  this.ServicioPlantaEditForm.controls["TipoOperacionPago"].value ?this.ServicioPlantaEditForm.controls["TipoOperacionPago"].value : '',
        ServicioPlantaId:   this.ServicioPlantaEditForm.controls["ServicioPlantaId"].value ? this.ServicioPlantaEditForm.controls["ServicioPlantaId"].value : 0,
        BancoId:    this.ServicioPlantaEditForm.controls["BancoPagos"].value ? this.ServicioPlantaEditForm.controls["BancoPagos"].value : '',
        MonedaId:   this.ServicioPlantaEditForm.controls["MonedaPagos"].value ? this.ServicioPlantaEditForm.controls["MonedaPagos"].value : '',
        FechaInicio:   this.ServicioPlantaEditForm.controls["FechaInicioPagos"].value ? this.ServicioPlantaEditForm.controls["FechaInicioPagos"].value : '',
        FechaFin:   this.ServicioPlantaEditForm.controls["FechaFinPagos"].value ? this.ServicioPlantaEditForm.controls["FechaFinPagos"].value : '',
        EstadoId:   this.ServicioPlantaEditForm.controls["EstadoPagos"].value ? this.ServicioPlantaEditForm.controls["EstadoPagos"].value : '',
        EmpresaId: this.vSessionUser.Result.Data.EmpresaId

      }
    
      //let json = JSON.stringify(request);
      return request;
  
  
  }

  anular() {

  }
  /*{
    if (this.selected.length > 0) {
    
      if (this.selected[0].EstadoCalidadId == this.estadoPesado) {
        var form = this;
        swal.fire({
          title: '¿Estas seguro?',
          text: "¿Estas seguro de anular?",
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
            form.anularServicio();
          }
        });
      } 
    }
  }*/
 
 /* anularServicio(){
    this.spinner.show(undefined,
      {
        type: 'ball-triangle-path',
        size: 'medium',
        bdColor: 'rgba(0, 0, 0, 0.8)',
        color: '#fff',
        fullScreen: true
      });
    this.ControlCalidadService.Anular(
      {
        "ControlCalidadPlantaId": this.selected[0].ControlCalidadPlantaId,
        "NotaIngresoPlantaId": this.selected[0].NotaIngresoPlantaId,
        "Usuario": this.vSessionUser.Result.Data.NombreUsuario
      })
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            this.alertUtil.alertOk('Anulado!', 'Control Calidad Anulado.');
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
  }*/

  Nuevo() {
   // this.router.navigate([`/planta/operaciones/ServicioPlanta-edit/${this.ServicioPlantaId}`]);
    this.router.navigate(['/planta/operaciones/ServicioPlanta-edit']);
  }

  Save(): void {
  //  debugger
    if (!this.ServicioPlantaEditForm.invalid) {
        const form = this;
        if (this.ServicioPlantaId <= 0) {

          this.alertUtil.alertRegistro('Confirmación', '¿Está seguro de continuar con el registro?.', function (result) {
            if (result.isConfirmed) {
              form.Registrar();
            }
          });
        } else if (this.ServicioPlantaId > 0) {

          this.alertUtil.alertRegistro('Confirmación', '¿Está seguro de continuar con la actualización?.', function (result) {
            if (result.isConfirmed) {
              form.Actualizar();
            }
          });
        }
      /* else {
        this.alertUtil.alertWarning('ADVERTENCIA!', 'No pueden existir datos vacios en el detalle, por favor corregir.');
      }*/
    }
  }

 /* Registrar(): void {
    
    this.spinner.show();
    this.errorGeneral = { isError: false, msgError: '' };
    const request = this.GetRequest();
    //const file = this.ordenProcesoEditForm.value.file;
    this.ServicioPlantaService.Registrar(request).subscribe((res: any) => 
    {
      
      this.spinner.hide();
      if (res.Result.Success) {
        this.alertUtil.alertOkCallback('CONFIRMACIÓN!', 'Se registro exitosamente.', () => {
          this.Cancel();
        });
      } else {
        this.errorGeneral = { isError: true, msgError: res.Result.Message };
      }
    }, (err: any) => {
      console.log(err);
      this.spinner.hide();
      this.errorGeneral = { isError: true, msgError: this.msgErrorGenerico };
    });
  }*/



  Registrar(): void {
    this.spinner.show();
    const request = this.GetRequest();
    this.ServicioPlantaService.Registrar(request)
      .subscribe((res: any) => {
        this.spinner.hide();
        if (res.Result.Success) {
          this.alertUtil.alertOkCallback("CONFIRMACIÓN!",
            "Se registro correctamente el servicio.",
            () => {
              this.Cancel();
            });
        } else {
          this.alertUtil.alertError("ERROR!", res.Result.Message);
        }
      }, (err: any) => {
        console.log(err);
        this.spinner.hide();
        this.alertUtil.alertError("ERROR!", this.vMsgErrGenerico);
      });
  }



  Actualizar() {
    this.spinner.show();
    const request = this.GetRequest();
    this.ServicioPlantaService.Actualizar(request)
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            var form = this;
            this.alertUtil.alertOkCallback('Actualizado!', 'Servicio Actualizado.', function (result) {
              form.router.navigate(['/planta/operaciones/Servicios-list']);
            }
            );

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

  fileChange(event: any): void {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.ServicioPlantaEditForm.patchValue({ file: file });
    }
    this.ServicioPlantaEditForm.get('file').updateValueAndValidity();
  }

 
  async ConsultaPorId(ServicioPlantaId) {
 
    
    let request =
    {
      "ServicioPlantaId": Number(ServicioPlantaId),
    }

    this.ServicioPlantaService.ConsultarPorId(request)
      .subscribe(res => {
        //this.spinner.hide();
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            this.AutocompleteFormEdit(res.Result.Data)
             //this.dateUtil.formatDate(new Date(FechaAsignacionSocioBeneficiarioPropietario))); 
             //this.dateUtil.formatDate(new Date(FechaAsignacionSocioInversorPropietario))); 
             //this.dateUtil.formatDate(new Date(FechaInstalacion))); 
            
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
         // this.spinner.hide();
          console.log(err);
          this.errorGeneral = { isError: false, errorMessage: this.mensajeErrorGenerico };
        }
      );

    //LLAMAR SERVICIO


  }




  async AutocompleteFormEdit(data: any) {
    if (data) {
      
      //this.SearchByidOrdenProcesoNumero(data.OrdenProcesoId);
      this.ServicioPlantaEditForm.controls.ordenProcesoComercial.setValue(data.NumeroOrdenProcesoComercial);
      this.ServicioPlantaEditForm.controls.idOrdenProcesoComercial.setValue(data.OrdenProcesoId);
      this.ServicioPlantaEditForm.controls.rucOrganizacion.setValue(data.RucOrganizacion);
      this.ServicioPlantaEditForm.controls.nombreOrganizacion.setValue(data.RazonSocialOrganizacion);
      if (data.EstadoId)
        this.ServicioPlantaEditForm.controls.estado.setValue(data.EstadoId);
      //this.ordenProcesoEditForm.controls.cantidadContenedores.setValue(data.CantidadContenedores);
      this.ServicioPlantaEditForm.controls.cantidadDefectos.setValue(data.CantidadDefectos);
      this.ServicioPlantaEditForm.controls.numeroContrato.setValue(data.NumeroContrato);
      this.ServicioPlantaEditForm.controls.fechaInicio.setValue(data.FechaInicioProceso == null ? "" : formatDate(data.FechaInicioProceso, 'yyyy-MM-dd', 'en'));
      this.ServicioPlantaEditForm.controls.fechaFin.setValue(data.FechaFinProceso == null ? "" : formatDate(data.FechaFinProceso, 'yyyy-MM-dd', 'en'));
      this.selectOrganizacion[0] = { EmpresaProveedoraAcreedoraId: data.OrganizacionId };
      this.ServicioPlantaEditForm.controls.estado.disable();

   /////////Camppos del api servicio planta ////////////////////////7
   this.ServicioPlantaEditForm.controls.ServicioPlantaId.setValue(data.ServicioPlantaId);
   //this.ServicioPlantaEditForm.controls.Numero.setValue(data.Numero);

   if (data.Numero){
    this.ServicioPlantaEditForm.controls.Numero.setValue(data.Numero);
   }
   this.ServicioPlantaEditForm.controls.NumeroOperacionRelacionada.setValue(data.NumeroOperacionRelacionada);
   this.ServicioPlantaEditForm.controls.TipoServicio.setValue(data.TipoServicioId);
   this.ServicioPlantaEditForm.controls.TipoComprobante.setValue(data.TipoComprobanteId);
   this.ServicioPlantaEditForm.controls.SerieComprobante.setValue(data.SerieComprobante);
   this.ServicioPlantaEditForm.controls.NumeroComprobante.setValue(data.NumeroComprobante);

  this.ServicioPlantaEditForm.controls.FechaDocumento.setValue(data.FechaDocumento == null ? "" : formatDate(data.FechaDocumento, 'yyyy-MM-dd', 'en'));
  
  this.ServicioPlantaEditForm.controls.FechaRegistro.setValue(data.FechaRegistro == null ? "" : formatDate(data.FechaRegistro, 'yyyy-MM-dd', 'en'));

  this.ServicioPlantaEditForm.controls.SerieDocumento.setValue(data.SerieDocumento);
   this.ServicioPlantaEditForm.controls.NumeroDocumento.setValue(data.NumeroDocumento);

   this.ServicioPlantaEditForm.controls.UnidadMedida.setValue(data.UnidadMedidaId);
   this.ServicioPlantaEditForm.controls.Cantidad.setValue(data.Cantidad);
   this.ServicioPlantaEditForm.controls.PrecioUnitario.setValue(data.PrecioUnitario);
   this.ServicioPlantaEditForm.controls.Importe.setValue(data.Importe);

   this.ServicioPlantaEditForm.controls.PorcentajeTIRB.setValue(data.PorcentajeTIRB);
   this.ServicioPlantaEditForm.controls.Moneda.setValue(data.MonedaId);
   this.ServicioPlantaEditForm.controls.TotalImporte.setValue(data.TotalImporte);
   this.ServicioPlantaEditForm.controls.Observaciones.setValue(data.Observaciones);
   this.ServicioPlantaEditForm.controls.razonSocialCabe.setValue(data.RazonSocialEmpresaCliente);
   this.ServicioPlantaEditForm.controls.nroRucCabe.setValue(data.RucEmpresaCliente);
   ////////////////////////////Pagos Servicios//////////////////////////////
  // this.ServicioPlantaEditForm.controls.NumeroPagos.setValue(data.Numero);
  // this.ServicioPlantaEditForm.controls.BancoPagos.setValue(data.BancoId);
  // this.ServicioPlantaEditForm.controls.MonedaPagos.setValue(data.MonedaId)
  // this.ServicioPlantaEditForm.controls.EstadoPagos.setValue(data.EstadoId);
  // this.ServicioPlantaEditForm.controls.NumeroOperacionPagos.setValue(data.NumeroOperacion);
   //this.ServicioPlantaEditForm.controls.TipoOperacionPago.setValue(data.TipoOperacionPagoServicioId);
 //  this.ServicioPlantaEditForm.controls.FechaInicioPagos.setValue(data.FechaInicio == null ? "" : formatDate(data.FechaInicio, 'yyyy-MM-dd', 'en'));
  // this.ServicioPlantaEditForm.controls.FechaFinPagos.setValue(data.FechaFin == null ? "" : formatDate(data.FechaFin, 'yyyy-MM-dd', 'en'));
  // this.ServicioPlantaEditForm.controls.FechaOperacion.setValue(data.FechaOperacion == null ? "" : formatDate(data.FechaOperacion, 'yyyy-MM-dd', 'en'));

    }
    this.spinner.hide();
  }

  addRowDetail(): void {
    this.rowsDetails = [...this.rowsDetails, {
      OrdenProcesoPlantaId: 0,
      OrdenProcesoPlantaDetalleId: 0,
      NotaIngresoPlantaId: 0,
      NumeroIngresoPlanta: '',
      FechaIngresoAlmacen: '',
      CantidadNotaIngreso: 0,
      KilosNetosNotaIngreso: 0,
      PorcentajeHumedad: 0,
      PorcentajeExportable: 0,
      PorcentajeDescarte: 0,
      PorcentajeCascarilla: 0,
      KilosExportables: 0,
      SacosCalculo: 0,
      Cantidad: 0,
      KilosNetos: 0
    }];
  }

  DeleteRowDetail(index: any): void {
    this.rowsDetails.splice(index, 1);
    this.rowsDetails = [...this.rowsDetails];
  }

  UpdateValuesGridDetails(event: any, index: any, prop: any): void {
    
    if (prop === 'Cantidad')
      this.rowsDetails[index].Cantidad = parseFloat(event.target.value);
    else if (prop === 'KilosNetos')
      this.rowsDetails[index].KilosNetos = parseFloat(event.target.value);
    else if (prop === 'KilosKilosExportablesNetosPesado')
      this.rowsDetails[index].KilosExportables = parseFloat(event.target.value);

  }

  Print(): void {
    const form = this;
    swal.fire({
      title: 'Confirmación',
      text: `¿Está seguro de continuar con impresión?.`,
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
        let link = document.createElement('a');
        document.body.appendChild(link);
        link.href = `${host}OrdenProcesoPlanta/GenerarPDFOrdenProceso?id=${form.ServicioPlantaId}&empresaId=${this.vSessionUser.Result.Data.EmpresaId}`;
        link.target = "_blank";
        link.click();
        link.remove();
      }
    });
  }

  Descargar(): void {
    const rutaFile = this.ServicioPlantaEditForm.value.pathFile;
    let link = document.createElement('a');
    document.body.appendChild(link);
    link.href = `${host}OrdenProceso/DescargarArchivo?path=${rutaFile}`;
    link.target = "_blank";
    link.click();
    link.remove();
  }

  ValidateDataDetails(): number {
    let result = [];
    /*  result = this.rowsLotesDetalle.filter(x => !x.NotaIngresoPlantaId
       || !x.FechaRegistro || !x.RendimientoPorcentaje
       || !x.HumedadPorcentaje)
  */
    result = this.rowsDetails.filter(x => x.NotaIngresoAlmacenPlantaId)
    return result.length;
  }

  Cancel(): void {
    this.router.navigate(['/planta/operaciones/Servicios-list']);
  }

  compareFechas() {
    /*
    var anioFechaInicio = new Date(this.ordenProcesoEditForm.controls['fechaInicio'].value).getFullYear()
    var anioFechaFin = new Date(this.ordenProcesoEditForm.controls['fechaFin'].value).getFullYear()
    if (new Date(this.ordenProcesoEditForm.controls['fechaInicio'].value) > new Date(this.ordenProcesoEditForm.controls['fechaFin'].value)) {
      this.errorFecha = { isError: true, errorMessage: 'La fecha inicio no puede ser mayor a la fecha fin' };
      this.ordenProcesoEditForm.controls['fechaInicio'].setErrors({ isError: true })
    } else if (this.dateUtil.restarAnio(anioFechaInicio, anioFechaFin) > 2) {
      this.errorFecha = { isError: true, errorMessage: 'El Rango de fechas no puede ser mayor a 2 años' };
      this.ordenProcesoEditForm.controls['fechaInicio'].setErrors({ isError: true })
    } else {
      this.errorFecha = { isError: false, errorMessage: '' };
    }
    */
  }

  compareTwoDates() {
    /*
    var anioFechaInicio = new Date(this.ordenProcesoEditForm.controls['fechaInicio'].value).getFullYear()
    var anioFechaFin = new Date(this.ordenProcesoEditForm.controls['fechaFin'].value).getFullYear()

    if (new Date(this.ordenProcesoEditForm.controls['fechaFin'].value) < new Date(this.ordenProcesoEditForm.controls['fechaInicio'].value)) {
      this.error = { isError: true, errorMessage: 'La fecha fin no puede ser anterior a la fecha inicio' };
      this.ordenProcesoEditForm.controls['fechaFin'].setErrors({ isError: true })
    } else if (this.dateUtil.restarAnio(anioFechaInicio, anioFechaFin) > 2) {
      this.error = { isError: true, errorMessage: 'El Rango de fechas no puede ser mayor a 2 años' };
      this.ordenProcesoEditForm.controls['fechaFin'].setErrors({ isError: true })
    } else {
      this.error = { isError: false, errorMessage: '' };
    }
    */
  }

  cargarDatos(detalle: any) {
    detalle.forEach(data => {
      debugger
      let object: any = {};
      object.NotaIngresoAlmacenPlantaId = data.NotaIngresoAlmacenPlantaId

      object.NumeroIngresoAlmacenPlanta = data.NumeroIngresoAlmacenPlanta
      object.FechaIngresoAlmacen = data.FechaIngresoAlmacen;
      object.FechaIngresoAlmacenString = this.dateUtil.formatDate(object.FechaIngresoAlmacen);

      object.CantidadNotaIngreso = data.CantidadNotaIngreso
      object.KilosNetosNotaIngreso = data.KilosNetosNotaIngreso
      object.PorcentajeHumedad = data.PorcentajeHumedad
      object.PorcentajeExportable = data.PorcentajeExportable
      object.PorcentajeDescarte = data.PorcentajeDescarte
      object.PorcentajeCascarilla = data.PorcentajeCascarilla

      if (data.ProductoId == "01" && data.SubProductoId == "05") //01:Pergamino  05: Humedo
      {
        this.esHumedo = true;
      }


      if (data.PorcentajeExportable) {
        object.KilosExportables = Math.round(Number(data.KilosNetosNotaIngreso * data.PorcentajeExportable) / 100);
      } else {
        object.KilosExportables = Number(0);
      }
      //if(data.KilosExportables){
      // var valorRounded = Math.round(( Number(object.KilosExportables / 69) + Number.EPSILON) * 100) / 100
      object.SacosCalculo = data.SacosCalculo;
      //}else{
      //  object.SacosCalculo = Number(0);
      //}

      object.Cantidad = data.Cantidad
      object.KilosNetos = data.KilosNetos

      this.listaNotaIngreso.push(object);
    });
    this.tempDataLoteDetalle = this.listaNotaIngreso;
    this.rowsDetails = [...this.tempDataLoteDetalle];
  }
  emptySumm() {
    return null;
  }
  calcularKilosNetos() {
    return 20;
  }
  agregarNotaIngreso(e, tipo) {

    debugger

    if (tipo == 'materiaPrima') 
    {
      var listFilter = [];
      listFilter = this.listaNotaIngreso.filter(x => x.NotaIngresoAlmacenPlantaId == e[0].NotaIngresoAlmacenPlantaId);
      if (listFilter.length == 0) 
      {
        if (e[0].ProductoId == "01" && e[0].SubProductoId == "05") //01:Pergamino  05: Humedo
        {
          this.esHumedo = true;
        }

          this.groupCantidad[e[0].NotaIngresoAlmacenPlantaId + '%cantidad'] = new FormControl('', []);
          this.filtrosLotesID.NotaIngresoAlmacenPlantaId = Number(e[0].NotaIngresoAlmacenPlantaId);
          let object: any = {};
          object.NotaIngresoAlmacenPlantaId = e[0].NotaIngresoAlmacenPlantaId;         
          object.NumeroIngresoAlmacenPlanta = e[0].Numero;
          const [day, month, year] = e[0].FechaRegistro.split('/');
          object.FechaIngresoAlmacen = new Date(year, month, day);
          object.FechaIngresoAlmacenString = this.dateUtil.formatDate(object.FechaIngresoAlmacen);
          object.CantidadNotaIngreso = e[0].CantidadDisponible;
          object.KilosNetosNotaIngreso = e[0].KilosNetosDisponibles;
          object.PorcentajeHumedad = e[0].HumedadPorcentajeAnalisisFisico;
          object.PorcentajeExportable = e[0].ExportablePorcentajeAnalisisFisico;
          object.PorcentajeRendimiento = e[0].RendimientoPorcentaje;
          object.PorcentajeDescarte = e[0].DescartePorcentajeAnalisisFisico;
          object.PorcentajeCascarilla = e[0].CascarillaPorcentajeAnalisisFisico;
          var KilosExportables = Number(e[0].KilosNetosDisponibles * (e[0].RendimientoPorcentaje / 100))
          object.KilosExportables = KilosExportables.toFixed(2);
          var valorRounded = Number(KilosExportables / 69);
          object.SacosCalculo = valorRounded.toFixed(2);
          object.Cantidad = e[0].CantidadDisponible;
          object.KilosNetos = e[0].KilosNetosDisponibles;

          this.listaNotaIngreso.push(object);
          this.tempDataLoteDetalle = this.listaNotaIngreso;
          this.rowsDetails = [...this.tempDataLoteDetalle];
          this.modalService.dismissAll();
      }
      else {
        this.alertUtil.alertWarning("Oops...!", "Ya ha sido agregado la Nota de Ingreso N° " + listFilter[0].NumeroIngresoPlanta + ".");
      }
      
    }
    else
    {
      var listFilter = [];
      listFilter = this.listaNotaIngreso.filter(x => x.NotaIngresoAlmacenPlantaId == e[0].NotaIngresoProductoTerminadoAlmacenPlantaId);
      if (listFilter.length == 0) 
      {
       
          this.esHumedo = false;
        

          this.groupCantidad[e[0].NotaIngresoProductoTerminadoAlmacenPlantaId + '%cantidad'] = new FormControl('', []);
          this.filtrosLotesID.NotaIngresoAlmacenPlantaId = Number(e[0].NotaIngresoProductoTerminadoAlmacenPlantaId);
          let object: any = {};
          object.NotaIngresoAlmacenPlantaId = e[0].NotaIngresoProductoTerminadoAlmacenPlantaId;         
          object.NumeroIngresoAlmacenPlanta = e[0].Numero;
          const [day, month, year] = e[0].FechaRegistro.split('/');
          object.FechaIngresoAlmacen = new Date(year, month, day);
          object.FechaIngresoAlmacenString = this.dateUtil.formatDate(object.FechaIngresoAlmacen);
          object.CantidadNotaIngreso = e[0].CantidadDisponible;
          object.KilosNetosNotaIngreso = e[0].KilosNetosDisponibles;
          object.PorcentajeHumedad = 0;
          object.PorcentajeExportable = 0;
          object.PorcentajeRendimiento = 0;
          object.PorcentajeDescarte = 0;
          object.PorcentajeCascarilla = 0;
          var KilosExportables = 0;
          object.KilosExportables = KilosExportables.toFixed(2);
          var valorRounded = Number(KilosExportables / 69);
          object.SacosCalculo = 0;
          object.Cantidad = e[0].CantidadDisponible;
          object.KilosNetos = e[0].KilosNetosDisponibles;

          this.listaNotaIngreso.push(object);
          this.tempDataLoteDetalle = this.listaNotaIngreso;
          this.rowsDetails = [...this.tempDataLoteDetalle];
          this.modalService.dismissAll();
      }
      else {
        this.alertUtil.alertWarning("Oops...!", "Ya ha sido agregado la Nota de Ingreso N° " + listFilter[0].NumeroIngresoPlanta + ".");
      }

    
    }

    if (this.listaNotaIngreso.length > 0) {
      var sumExportable = 0;
      var sumDescarte = 0;
      var sumCascarilla = 0;
      this.listaNotaIngreso.forEach(data => {
        sumExportable = sumExportable + data.PorcentajeExportable;
        sumDescarte = sumDescarte + data.PorcentajeDescarte;
        sumCascarilla = sumCascarilla + data.PorcentajeCascarilla;
      });
      this.averageCascarilla = Number((sumCascarilla / this.listaNotaIngreso.length).toFixed(2));
      this.averageDescarte = Number((sumDescarte / this.listaNotaIngreso.length).toFixed(2));
      this.averageExportable = Number((sumExportable / this.listaNotaIngreso.length).toFixed(2));
    }

  }

  eliminarLote(select) {
    let form = this;
    this.alertUtil.alertSiNoCallback('Está seguro?', 'La ' + select[0].NumeroIngresoAlmacenPlanta + ' se eliminará de su lista.', function (result) {
      if (result.isConfirmed) {
        form.listaNotaIngreso = form.listaNotaIngreso.filter(x => x.NotaIngresoAlmacenPlantaId != select[0].NotaIngresoAlmacenPlantaId)
        form.tempDataLoteDetalle = form.listaNotaIngreso;
        form.rowsDetails = [...form.tempDataLoteDetalle];
        form.selectLoteDetalle = [];
      }
    }
    );
  }



}