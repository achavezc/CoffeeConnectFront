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
import{ PagoServicioPlantaService }from '../../../../../../Services/PagoServiciosPlanta.service';
import { OrdenProcesoService } from '../../../../../../services/orden-proceso.service';
import{DevolucionPrestamoService}from '../../../../../../Services/ServiciosDevoluciones.services';
import { OrdenProcesoServicePlanta } from '../../../../../../Services/orden-proceso-planta.service';
import { NotaIngresoService } from '../../../../../../services/notaingreso.service';
import { ControlCalidadService } from '../../../../../../Services/control-calidad.service';
import { host } from '../../../../../../shared/hosts/main.host';
import { formatDate } from '@angular/common';
import{ServicioPlantaService}from'../../../../../../Services/ServicioPlanta.services';
import { AuthService } from '../../../../../../services/auth.service';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-serviciodevoluciones-edit',
  templateUrl: './serviciodevoluciones-edit.component.html',
  styleUrls: ['./serviciodevoluciones-edit.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ServicioDevolucionEditComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private modalService: NgbModal,
    private dateUtil: DateUtil,
    private maestroService: MaestroService,
    private ordenProcesoService: OrdenProcesoService,
    private ordenProcesoServicePlanta: OrdenProcesoServicePlanta,
    private route: ActivatedRoute,
    private router: Router,
    private PagoServicioPlantaService:PagoServicioPlantaService,
    private DevolucionPrestamoService:DevolucionPrestamoService,
    private ServicioPlantaService:ServicioPlantaService,
    private spinner: NgxSpinnerService,
    private alertUtil: AlertUtil,
    private notaIngresoService: NotaIngresoService,
    private controlCalidad: ControlCalidadService,
    private authService: AuthService) { }


  error: any = { isError: false, errorMessage: '' };
  errorFecha: any = { isError: false, errorMessage: '' };
  DevolucionesEditForm: FormGroup;
  vMsgErrGenerico = "Ha ocurrido un error interno.";
  listEstado = [];
  listEstadoDevolucion=[];

  tipoProcesoSecado = '02';
  tipoProcesoReproceso = '03';
  listTipoProcesos = [];
  listTipoProduccion = [];
  esHumedo = false;
  submitted = false;
  submittedEdit = false;
  esReproceso = false;
  //listCertificacion = [];

  listaCampania:any[];
  selectedCampania:any;

  listTipoServicio: [] = [];
  selectedTipoServicio: any;

  listTipoComprobante: [] = [];
  selectedTipoComprobante: any;
  
  listTipoUnidadMedida:[] =[];
  selectedTipoUnidadMedida:any;

  listTipoMoneda:[]=[];
  SelectedTipoMoneda:any;

  listTipoMonedaDevoluciones:[]=[];
  SelectedTipoMonedaDevoluciones:any;


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

  listTipoDestino:[]=[];
  selectedTipoDestino:any;

  listTipoBancoDevolucion:[]=[];
  selectedTipoBancoDevolucion:any;

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
  selectedEstadoDevolucion:any;
  selectedTipoProceso: any;
  vSessionUser: any;
  errorGeneral: any = { isError: false, errorMessage: '' };
  mensajeErrorGenerico = "Ocurrio un error interno.";
  PrestamoPlantaId: Number;
  DevolucionPrestamoPlantaId: Number;
  //MonedaId:Number;
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
  Moneda:string;
  OcultarSeccion: boolean =true;
  public limitRef = 20;
  averageExportable: Number = 0;
  averageDescarte: Number = 0;
  averageCascarilla: Number = 0;
  formGroupCantidad: FormGroup;
  groupCantidad = {};


  async ngOnInit() {
    this.vSessionUser = JSON.parse(localStorage.getItem('user'));
    this.DevolucionPrestamoPlantaId = this.route.snapshot.params.DevolucionPrestamoPlantaId ? Number(this.route.snapshot.params.DevolucionPrestamoPlantaId) : 0;
   // this.ServicioPlantaId = this.route.snapshot.params['ServicioPlantaId'] ? Number(this.route.snapshot.params['ServicioPlantaId']) : 0;
    // this.ProyectoInventarioId = this.route.snapshot.params.proyectoinventarioid ?parseInt(this.route.snapshot.params.proyectoinventarioid) : 0;
    this.PrestamoPlantaId = this.route.snapshot.params.PrestamoPlantaId ? Number(this.route.snapshot.params.PrestamoPlantaId) : 0;
    this.Moneda = this.route.snapshot.params.Moneda ? this.route.snapshot.params.Moneda : '';
    //this.Moneda = this.route.snapshot.params.Moneda ? Number(this.route.snapshot.params.Moneda) : 0;
   // this.ServicioPlantaEditForm.controls.ServicioPlantaId.setValue(this.ServicioPlantaId);
    //this.ServicioPlantaEditForm.controls.PagoServicioPlantaId.setValue(this.PagoServicioPlantaId);
    await this.LoadForm();
   
   this.DevolucionesEditForm.controls.MonedaDevolucion.setValue(this.Moneda);
   //this.ServicioPlantaEditForm.controls.MonedaPagos.setValue(this.vSessionUser.Result.Data.MonedaId);
    this.DevolucionesEditForm.controls.razonSocialCabe.setValue(this.vSessionUser.Result.Data.RazonSocialEmpresa);
    this.DevolucionesEditForm.controls.direccionCabe.setValue(this.vSessionUser.Result.Data.DireccionEmpresa);
    this.DevolucionesEditForm.controls.nroRucCabe.setValue(this.vSessionUser.Result.Data.RucEmpresa);
    this.DevolucionesEditForm.controls.responsableComercial.setValue(this.vSessionUser.Result.Data.NombreCompletoUsuario);
   // this.ServicioPlantaEditForm.controls.ServicioPlantaId.setValue(this.route.snapshot.params.ServicioPlantaId? Number(this.route.snapshot.params.ServicioPlantaId) : 0);
    this.GetListTipoServicio();
    this.GetListaTipoMoneda();
    this.GetListaTipoDestino();
    this.GetListaTipoBancoDevolucion();
    this.GetListaTipoMonedaDevoluciones();
    this.GetListaTipoBancoPago();
    this.GetListaTipoBanco();
    this.GetListaTipoOperacionServicios();
    this.GetListaTipoOperacionServiciosPago();
    this.GetListaTipoEstado2();
    this.GetEstado();
    this.GetEstadoDevolucion();

    if (this.DevolucionPrestamoPlantaId <= 0) {
      this.DevolucionesEditForm.controls.FechaRegistroDevolucion.setValue(this.dateUtil.currentDate());
      //this.ServicioPlantaEditForm.controls.ServicioPlantaId.setValue(this.detalle.data.ServicioPlantaId);
      //this.ServicioPlantaEditForm.controls.NumeroPagos.setValue(this.detalle.Numero);
      //this.ServicioPlantaEditForm.controls.EstadoPagos.setValue(this.detalle.EstadoId);


      //this.ServicioPlantaEditForm.controls.fecFinProcesoPlanta.setValue(this.dateUtil.currentDate());
      // this.addRowDetail();
    } else if (this.DevolucionPrestamoPlantaId > 0) {
      
      this.ConsultaPorId(this.DevolucionPrestamoPlantaId);
    }
    this.cargaCampania();
    this.readonly = this.authService.esReadOnly(this.vSessionUser.Result.Data.OpcionesEscritura, this.DevolucionesEditForm.controls.MonedaPagos);
   // this.readonly = this.authService.esReadOnly(this.vSessionUser.Result.Data.OpcionesEscritura, this.ServicioPlantaEditForm.controls.BancoPagos);
    this.OcultarSecciones();
  }



  agregarOrdenProceso(e) {
    /*this.ServicioPlantaEditForm.controls.ordenProcesoComercial.setValue(e[0].Numero);
    this.ServicioPlantaEditForm.controls.idOrdenProcesoComercial.setValue(e[0].OrdenProcesoId);
    this.ServicioPlantaEditForm.controls.rucOrganizacion.setValue(e[0].RucEmpresaProcesadora);
    this.ServicioPlantaEditForm.controls.nombreOrganizacion.setValue(e[0].RazonSocialEmpresaProcesadora);
    this.SearchByidOrdenProceso(e[0].OrdenProcesoId);
*/
  }


  LoadForm(): void {
    this.DevolucionesEditForm = this.fb.group({
     
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
      Campania: new FormControl('',[]),
      EmpresaId:['',''],
/////DATOS DE PANTALLA EDIT DE SERVICIOS PLANTA
      ServicioPlantaId:['',''],
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
      BnacoDevolucion:['',''],
      Destino:['',''],
      PorcentajeTIRB: ['', ''],
      Moneda: ['', ''],
      MonedaId:['',''],
    ///  MonedaDevoluciones:['',''],
      TotalImporte: ['', ''],
      Observaciones: ['', ''],
      estadoServicio:['',''],
      DestinoDevolucion:['',''],
      DevolucionPrestamoPlantaId:['',''],
      PrestamoPlantaId:['',''],
      ///////////////////////////77
      NumeroDevolucion:['',''],
      EstadoDevolucion:['',''],
      //NumeroOperacionPagos:['', Validators.required],
      MonedaDevolucion:['', ''],
      TipoOperacion:['',''],
      TipoOperacionPagoServicioId:['',''],
      TipoOperacionPagoServicio:['',''],
     // TipoOperacionPago:['', Validators.required],
      EstadoPagos:[],
      DestinoBanco:['',''],
      ObservacionDevolucion: ['', ''],
      ImporteDevolucion:['', ''],
      ImporteCambioDevolucion:['',''],
      BancoDevolucion:['',''],
      //FechaOperacion:['',''],
      FechaDevolucion:['',''],
      FechaInicioPagos:['',''],
      FechaFinPagos:['',''],
      PagoServicioPlantaId:['',''],
      FechaRegistroDevolucion:['',''],
      razonSocialPago: ['',],
      direccionPago: ['',],
      nroRucPago: ['',],
      
      //////Grilla campos////////////
     // FechaOperacionPagos:['', Validators.required],
      FechaRegistroPagos:['','']

    });
    this.DevolucionesEditForm.controls.EstadoDevolucion.disable();
  }

 
  get f() {
    return this.DevolucionesEditForm.controls;
  }

  async GetListaTipoBancoDevolucion () {
    let res = await this.maestroService.obtenerMaestros('Banco').toPromise();
    if (res.Result.Success) {
      this.listTipoBancoDevolucion = res.Result.Data;
    }
  }
  async GetListaTipoDestino () {
    let res = await this.maestroService.obtenerMaestros('DestinoDevolucion').toPromise();
    if (res.Result.Success) {
      this.listTipoDestino = res.Result.Data;
    }
  }

  async cargaCampania() 
  {

    var data = await this.maestroService.ConsultarCampanias("01").toPromise();
    if (data.Result.Success) {
      this.listaCampania = data.Result.Data;
    }

  }

  async GetListTipoServicio() {
    let res = await this.maestroService.obtenerMaestros('TipoServicioPlanta').toPromise();
    if (res.Result.Success) {
      this.listTipoServicio = res.Result.Data;
    }
  }

  async GetListaTipoMoneda () {
    let res = await this.maestroService.obtenerMaestros('Moneda').toPromise();
    if (res.Result.Success) {
      this.listTipoMoneda = res.Result.Data;
    }
  }

  async GetListaTipoMonedaDevoluciones () {
    let res = await this.maestroService.obtenerMaestros('Moneda').toPromise();
    if (res.Result.Success) {
      this.listTipoMonedaDevoluciones = res.Result.Data;
    }
  }

  async GetListaTipoBanco () {
    let res = await this.maestroService.obtenerMaestros('Banco').toPromise();
    if (res.Result.Success) {
      this.listTipoBanco = res.Result.Data;
    }
  }

  async GetListaTipoBancoPago () {
    let res = await this.maestroService.obtenerMaestros('Banco').toPromise();
    if (res.Result.Success) {
      this.listTipoBancoPago = res.Result.Data;
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

  async GetEstadoDevolucion() {
    const res = await this.maestroService.obtenerMaestros('EstadoDevolucionPrestamoPlanta').toPromise();
    if (res.Result.Success) {
      this.listEstadoDevolucion = res.Result.Data;
    }
  }


  async OcultarSecciones(){

    if(  this.DevolucionPrestamoPlantaId > 0){//0 es nuevo 
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


  GetDataEmpresa(event: any): void {
    this.selectOrganizacion = event;
    if (this.selectOrganizacion[0]) {

      //this.notaIngredoFormEdit.controls['codigoOrganizacion'].setValue(this.selectOrganizacion[0].Ruc);
      this.DevolucionesEditForm.controls['nombreOrganizacion'].setValue(this.selectOrganizacion[0].RazonSocial);
      this.DevolucionesEditForm.controls['rucOrganizacion'].setValue(this.selectOrganizacion[0].Ruc);
      this.DevolucionesEditForm.controls['organizacionId'].setValue(this.selectOrganizacion[0].EmpresaProveedoraAcreedoraId);
    }
    this.modalService.dismissAll();
  }

  openModal(modal: any): void {

    this.modalService.open(modal, { windowClass: 'dark-modal', size: 'xl' });

    //this.modalService.open(modal, { windowClass: 'dark-modal', size: 'xl', centered: true });
  }

  openModalNotaIngreso(modalAlmacenMateriaPrima: any, modalAlmacenProductoTerminado: any): void {
    
    var tipoProceso = this.DevolucionesEditForm.controls["tipoProceso"].value;

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

//  Nuevo() {
  //  this.router.navigate(['/planta/operaciones/ServicioPlanta-edit']);
 // }


  Guardar(): void {
    //debugger
    if (!this.DevolucionesEditForm.invalid) {
        const form = this;
        if (this.DevolucionPrestamoPlantaId <= 0) {

          this.alertUtil.alertRegistro('Confirmación', '¿Está seguro de continuar con el registro?.', function (result) {
            if (result.isConfirmed) {
              form.RegistrarDevoluciones();
            }
          });
        } else if (this.DevolucionPrestamoPlantaId > 0) {

          this.alertUtil.alertRegistro('Confirmación', '¿Está seguro de continuar con la actualización?.', function (result) {
            if (result.isConfirmed) {
              form.ActualizarDevoluciones();
            }
          });
        }
       else {
        this.alertUtil.alertWarning('ADVERTENCIA!', 'No pueden existir datos vacios en el detalle, por favor corregir.');
      }
    }
  }

 /* if(this.ServicioPlantaEditForm.controls["ImportePagos"].value > 0)
  {
    this.alertUtil.alertWarning("Advertencia","La Suma de Importes Pagos Excedio");
    return; 
  }*/
  /*
      var ImportePago = this.ServicioPlantaEditForm.controls["ImportePago"].value;
    var TotalImporte = this.ServicioPlantaEditForm.controls["TotalImporte"].value;

    if (ImportePago > TotalImporte){
      
      this.alertUtil.alertWarning("Advertencia","No se puede Registrar Mas Pagos");
      return;
    }
  
  */

    RegistrarDevoluciones(): void {
    this.spinner.show();
    const request = this.GetRequest();
    this.DevolucionPrestamoService.Registrar(request)
      .subscribe((res: any) => {
        this.spinner.hide();
        
        if (res.Result.Success)
         {
          if(res.Result.Data > 0) {

              this.alertUtil.alertOkCallback("CONFIRMACIÓN!",
                "Se registro correctamente la Devolucion.",
                () => {
                  this.Cancel();
                });
           }else{
            this.alertUtil.alertWarning("Advertencia","No se puede Registrar Mas Devoluciones");
           }

          }
          
        else {
          this.alertUtil.alertError("ERROR!", res.Result.Message);
        }
      
      }, (err: any) => {
        console.log(err);
        this.spinner.hide();
        this.alertUtil.alertError("ERROR!", this.vMsgErrGenerico);{
          
        }
       
      });
  }



  /*RegistrarPagos(): void {
    this.spinner.show();
  //  this.ServicioPlantaId
    const request = this.GetRequest();
    this.PagoServicioPlantaService.Registrar(request)
      .subscribe((res: any) => {
        this.spinner.hide();
        if (res.Result.Success) {
          this.alertUtil.alertOkCallback("CONFIRMACIÓN!",
            "Se registro correctamente el Pago.",
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
  }*/


  ActualizarDevoluciones() {
  this.spinner.show();
  const request = this.GetRequest();
  this.DevolucionPrestamoService.Actualizar(request)
    .subscribe(res => {
      this.spinner.hide();
      if (res.Result.Success) {
        if (res.Result.ErrCode == "") {
          var form = this;
        this.alertUtil.alertOkCallback('CONFIRMACIÓN!', 'Se actualizo exitosamente.', () => {
          this.Cancel();
        });
          
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
/*ActualizarPagos(): void {
  this.spinner.show();
  const request = this.GetRequest();
  this.PagoServicioPlantaService.Actualizar(request)
  .subscribe(res => {
    this.spinner.hide();
    if (res.Result.Success) {
      if (res.Result.ErrCode == "") {
        var form = this;
      this.alertUtil.alertOkCallback('CONFIRMACIÓN!', 'Se actualizo exitosamente.', () => {
        this.Cancel();
      });
    } else {
      this.errorGeneral = { isError: true, msgError: res.Result.Message };
    }
  }, (err: any) => {
    console.log(err);
    this.spinner.hide();
    this.errorGeneral = { isError: true, msgError: this.msgErrorGenerico };
  };
}
*/


  GetRequest(): any {

   // debugger
    const form = this.DevolucionesEditForm.value;

    const request =
    {

     DevolucionPrestamoPlantaId:   Number(this.DevolucionPrestamoPlantaId),
     PrestamoPlantaId:    Number(this.PrestamoPlantaId),
     DestinoDevolucionId: this.DevolucionesEditForm.controls["DestinoDevolucion"].value ? this.DevolucionesEditForm.controls["DestinoDevolucion"].value : '',
     BancoId:this.DevolucionesEditForm.controls["BancoDevolucion"].value ? this.DevolucionesEditForm.controls["BancoDevolucion"].value : '',
     FechaDevolucion:this.DevolucionesEditForm.controls["FechaDevolucion"].value ? this.DevolucionesEditForm.controls["FechaDevolucion"].value : '',
     Importe:this.DevolucionesEditForm.controls["ImporteDevolucion"].value ? this.DevolucionesEditForm.controls["ImporteDevolucion"].value : '',
    // ImporteCambio:this.DevolucionesEditForm.controls["ImporteCambioDevolucion"].value ? this.DevolucionesEditForm.controls["ImporteCambioDevolucion"].value : '',
     MonedaId:this.DevolucionesEditForm.controls["MonedaDevolucion"].value ? this.DevolucionesEditForm.controls["MonedaDevolucion"].value : '',
     Observaciones:this.DevolucionesEditForm.controls["ObservacionDevolucion"].value ? this.DevolucionesEditForm.controls["ObservacionDevolucion"].value : '',
     Usuario: this.vSessionUser.Result.Data.NombreUsuario,
     EmpresaId: this.vSessionUser.Result.Data.EmpresaId,

     

    }
    
    //let json = JSON.stringify(request);
    return request;


  }





  fileChange(event: any): void {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.DevolucionesEditForm.patchValue({ file: file });
    }
    this.DevolucionesEditForm.get('file').updateValueAndValidity();
  }

  async ConsultaPorId(DevolucionPrestamoPlantaId) {
 
    
    let request =
    {
      "DevolucionPrestamoPlantaId": Number(DevolucionPrestamoPlantaId),
    }

    this.DevolucionPrestamoService.ConsultarPorId(request)
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
    //  this.DevolucionesEditForm.controls.ordenProcesoComercial.setValue(data.NumeroOrdenProcesoComercial);
      this.DevolucionesEditForm.controls.idOrdenProcesoComercial.setValue(data.OrdenProcesoId);
      this.DevolucionesEditForm.controls.rucOrganizacion.setValue(data.RucOrganizacion);
      this.DevolucionesEditForm.controls.nombreOrganizacion.setValue(data.RazonSocialOrganizacion);
     // if (data.EstadoId)
      //  this.ServicioPlantaEditForm.controls.estado.setValue(data.EstadoId);
      //this.ordenProcesoEditForm.controls.cantidadContenedores.setValue(data.CantidadContenedores);
     // this.DevolucionesEditForm.controls.cantidadDefectos.setValue(data.CantidadDefectos);
      //this.DevolucionesEditForm.controls.numeroContrato.setValue(data.NumeroContrato);
     // this.DevolucionesEditForm.controls.fechaInicio.setValue(data.FechaInicioProceso == null ? "" : formatDate(data.FechaInicioProceso, 'yyyy-MM-dd', 'en'));
     // this.DevolucionesEditForm.controls.fechaFin.setValue(data.FechaFinProceso == null ? "" : formatDate(data.FechaFinProceso, 'yyyy-MM-dd', 'en'));
     // this.selectOrganizacion[0] = { EmpresaProveedoraAcreedoraId: data.OrganizacionId };
    ///  this.DevolucionesEditForm.controls.estado.disable();

   //this.ServicioPlantaEditForm.controls.Numero.setValue(data.Numero);

   //if (data.Numero){
   // this.ServicioPlantaEditForm.controls.Numero.setValue(data.Numero);
   //}
 //  this.DevolucionesEditForm.controls.NumeroOperacionRelacionada.setValue(data.NumeroOperacionRelacionada);
 //  this.DevolucionesEditForm.controls.TipoServicio.setValue(data.TipoServicioId);
 //  this.DevolucionesEditForm.controls.TipoComprobante.setValue(data.TipoComprobanteId);
 //  this.DevolucionesEditForm.controls.SerieComprobante.setValue(data.SerieComprobante);
  // this.DevolucionesEditForm.controls.NumeroComprobante.setValue(data.NumeroComprobante);

 // this.DevolucionesEditForm.controls.FechaDocumento.setValue(data.FechaDocumento == null ? "" : formatDate(data.FechaDocumento, 'yyyy-MM-dd', 'en'));
  
  //this.DevolucionesEditForm.controls.FechaRegistroPago.setValue(data.FechaRegistro == null ? "" : formatDate(data.FechaRegistro, 'yyyy-MM-dd', 'en'));
 //this.ServicioPlantaEditForm.controls.FechaRegistro.setValue(data.FechaRegistro == null ? "" : formatDate(data.FechaRegistro, 'yyyy-MM-dd', 'en'));

//  this.DevolucionesEditForm.controls.SerieDocumento.setValue(data.SerieDocumento);
 //  this.DevolucionesEditForm.controls.NumeroDocumento.setValue(data.NumeroDocumento);

  // this.DevolucionesEditForm.controls.UnidadMedida.setValue(data.UnidadMedidaId);
  // this.DevolucionesEditForm.controls.Cantidad.setValue(data.Cantidad);
  // this.DevolucionesEditForm.controls.PrecioUnitario.setValue(data.PrecioUnitario);
  // this.ServicioPlantaEditForm.controls.Importe.setValue(data.Importe);

   //this.DevolucionesEditForm.controls.PorcentajeTIRB.setValue(data.PorcentajeTIRB);
   //this.ServicioPlantaEditForm.controls.Moneda.setValue(data.MonedaId);
   //this.DevolucionesEditForm.controls.TotalImporte.setValue(data.TotalImporte);
   //this.DevolucionesEditForm.controls.Observaciones.setValue(data.Observaciones);
   this.DevolucionesEditForm.controls.razonSocialPago.setValue(data.RazonSocialEmpresaCliente);
   this.DevolucionesEditForm.controls.nroRucPago.setValue(data.RucEmpresaCliente);
   //////////////////////////////////////////////////////////
      /////////Camppos del api Por Id servicio planta ////////////////////////7
   
  // this.DevolucionesEditForm.controls.PagoServicioPlantaId.setValue(data.PagoServicioPlantaId);
  // this.DevolucionesEditForm.controls.ServicioPlantaId.setValue(data.ServicioPlantaId);
   //this.DevolucionesEditForm.controls.NumeroPagos.setValue(data.Numero);
  /// this.DevolucionesEditForm.controls.BancoPagos.setValue(data.BancoId);
  // this.DevolucionesEditForm.controls.ImportePagos.setValue(data.Importe);
  // this.DevolucionesEditForm.controls.MonedaPagos.setValue(data.MonedaId)
  // this.DevolucionesEditForm.controls.EstadoPagos.setValue(data.EstadoId);
  /// this.DevolucionesEditForm.controls.NumeroOperacionPagos.setValue(data.NumeroOperacion);
  // this.DevolucionesEditForm.controls.TipoOperacionPago.setValue(data.TipoOperacionPagoServicioId);
  // this.DevolucionesEditForm.controls.ObservacionPagos.setValue(data.Observaciones);
  // this.DevolucionesEditForm.controls.FechaOperacionPagos.setValue(data.FechaOperacion == null ? "" : formatDate(data.FechaOperacion, 'yyyy-MM-dd', 'en'));
 ///////////////////////devolucion prestamos/////////////////////////////////////
  this.DevolucionesEditForm.controls.DevolucionPrestamoPlantaId.setValue(data.DevolucionPrestamoPlantaId);
  this.DevolucionesEditForm.controls.PrestamoPlantaId.setValue(data.PrestamoPlantaId);
  this.DevolucionesEditForm.controls.NumeroDevolucion.setValue(data.Numero);

  this.DevolucionesEditForm.controls.DestinoDevolucion.setValue(data.DestinoDevolucionId);
  this.DevolucionesEditForm.controls.BancoDevolucion.setValue(data.BancoId);

  this.DevolucionesEditForm.controls.FechaDevolucion.setValue(data.FechaDevolucion == null ? "" : formatDate(data.FechaDevolucion, 'yyyy-MM-dd', 'en'));
  this.DevolucionesEditForm.controls.MonedaDevolucion.setValue(data.MonedaId);
  this.DevolucionesEditForm.controls.ImporteDevolucion.setValue(data.Importe);
  this.DevolucionesEditForm.controls.ImporteCambioDevolucion.setValue(data.ImporteCambio);
  this.DevolucionesEditForm.controls.ObservacionDevolucion.setValue(data.Observaciones);
  this.DevolucionesEditForm.controls.EstadoDevolucion.setValue(data.EstadoId);
  
 

    }
    this.spinner.hide();
  }

  Cancel(): void {
    this.router.navigate([`/planta/operaciones/serviciosprestamos-edit/${this.PrestamoPlantaId}`]);
    //this.router.navigate(['/operaciones/Servicios-edit']);
    ///planta/operaciones/Servicios-edit
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

 
}