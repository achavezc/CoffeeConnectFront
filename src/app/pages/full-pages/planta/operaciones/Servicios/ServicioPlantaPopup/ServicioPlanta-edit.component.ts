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
import { OrdenProcesoServicePlanta } from '../../../../../../Services/orden-proceso-planta.service';
import { NotaIngresoService } from '../../../../../../services/notaingreso.service';
import { ControlCalidadService } from '../../../../../../Services/control-calidad.service';
import { host } from '../../../../../../shared/hosts/main.host';
import { formatDate } from '@angular/common';
import{ServicioPlantaService}from'../../../../../../Services/ServicioPlanta.services';
import { AuthService } from '../../../../../../services/auth.service';

@Component({
  selector: 'app-ServicioPlanta-edit',
  templateUrl: './ServicioPlanta-edit.component.html',
  styleUrls: ['./ServicioPlanta-edit.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ServicioPlantaeditComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private modalService: NgbModal,
    private dateUtil: DateUtil,
    private maestroService: MaestroService,
    private ordenProcesoService: OrdenProcesoService,
    private ordenProcesoServicePlanta: OrdenProcesoServicePlanta,
    private route: ActivatedRoute,
    private router: Router,
    private PagoServicioPlantaService:PagoServicioPlantaService,
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
  listEstadoPago=[];
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
  selectedEstadoPago:any;
  selectedTipoProceso: any;
  vSessionUser: any;
  errorGeneral: any = { isError: false, errorMessage: '' };
  mensajeErrorGenerico = "Ocurrio un error interno.";
  ServicioPlantaId: Number;
  PagoServicioPlantaId: Number;
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
    this.PagoServicioPlantaId = this.route.snapshot.params.PagoServicioPlantaId ? Number(this.route.snapshot.params.PagoServicioPlantaId) : 0;
   // this.ServicioPlantaId = this.route.snapshot.params['ServicioPlantaId'] ? Number(this.route.snapshot.params['ServicioPlantaId']) : 0;
    // this.ProyectoInventarioId = this.route.snapshot.params.proyectoinventarioid ?parseInt(this.route.snapshot.params.proyectoinventarioid) : 0;
    this.ServicioPlantaId = this.route.snapshot.params.ServicioPlantaId ? Number(this.route.snapshot.params.ServicioPlantaId) : 0;
    
   // this.ServicioPlantaEditForm.controls.ServicioPlantaId.setValue(this.ServicioPlantaId);
    //this.ServicioPlantaEditForm.controls.PagoServicioPlantaId.setValue(this.PagoServicioPlantaId);
    await this.LoadForm();
    this.ServicioPlantaEditForm.controls.razonSocialCabe.setValue(this.vSessionUser.Result.Data.RazonSocialEmpresa);
    this.ServicioPlantaEditForm.controls.direccionCabe.setValue(this.vSessionUser.Result.Data.DireccionEmpresa);
    this.ServicioPlantaEditForm.controls.nroRucCabe.setValue(this.vSessionUser.Result.Data.RucEmpresa);
    this.ServicioPlantaEditForm.controls.responsableComercial.setValue(this.vSessionUser.Result.Data.NombreCompletoUsuario);
   // this.ServicioPlantaEditForm.controls.ServicioPlantaId.setValue(this.route.snapshot.params.ServicioPlantaId? Number(this.route.snapshot.params.ServicioPlantaId) : 0);
    this.GetListTipoServicio();
    this.GetListaTipoMoneda();
    this.GetListaTipoMonedaPago();
    this.GetListaTipoBancoPago();
    this.GetListaTipoBanco();
    this.GetListaTipoOperacionServicios();
    this.GetListaTipoOperacionServiciosPago();
    this.GetListaTipoEstado2();
    this.GetEstado();
    this.GetEstadoPago();

    if (this.PagoServicioPlantaId <= 0) {
      this.ServicioPlantaEditForm.controls.FechaRegistroPago.setValue(this.dateUtil.currentDate());
      //this.ServicioPlantaEditForm.controls.ServicioPlantaId.setValue(this.detalle.data.ServicioPlantaId);
      //this.ServicioPlantaEditForm.controls.NumeroPagos.setValue(this.detalle.Numero);
      //this.ServicioPlantaEditForm.controls.EstadoPagos.setValue(this.detalle.EstadoId);


      //this.ServicioPlantaEditForm.controls.fecFinProcesoPlanta.setValue(this.dateUtil.currentDate());
      // this.addRowDetail();
    } else if (this.PagoServicioPlantaId > 0) {
      
      this.ConsultaPorId(this.PagoServicioPlantaId);
    }
    
    //this.readonly = this.authService.esReadOnly(this.vSessionUser.Result.Data.OpcionesEscritura, this.ServicioPlantaEditForm);
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
      PorcentajeTIRB: ['', ''],
      Moneda: ['', ''],
      MonedaId:['',''],
      TotalImporte: ['', ''],
      Observaciones: ['', ''],
      estadoServicio:['',''],
      
      ///////////////////////////77
      NumeroPagos:['',''],
      BancoPagos:['', Validators.required],
      NumeroOperacionPagos:['', Validators.required],
      MonedaPagos:['', Validators.required],
      TipoOperacion:['',''],
      TipoOperacionPagoServicioId:['',''],
      TipoOperacionPagoServicio:['',''],
      TipoOperacionPago:['', Validators.required],
      EstadoPagos:[],
      ObservacionPagos: ['', ''],
      ImportePagos:['', Validators.required],
      //FechaOperacion:['',''],
      FechaInicioPagos:['',''],
      FechaFinPagos:['',''],
      PagoServicioPlantaId:['',''],
      FechaRegistroPago:['',''],
      razonSocialPago: ['',],
      direccionPago: ['',],
      nroRucPago: ['',],
      
      //////Grilla campos////////////
      FechaOperacionPagos:['', Validators.required],
      FechaRegistroPagos:['','']

    });
    this.ServicioPlantaEditForm.controls.EstadoPagos.disable();
  }

 

  

  get f() {
    return this.ServicioPlantaEditForm.controls;
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

  async GetListaTipoMonedaPago () {
    let res = await this.maestroService.obtenerMaestros('Moneda').toPromise();
    if (res.Result.Success) {
      this.listTipoMonedaPago = res.Result.Data;
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

  async GetEstadoPago() {
    const res = await this.maestroService.obtenerMaestros('EstadoOrdenProcesoPlanta').toPromise();
    if (res.Result.Success) {
      this.listEstadoPago = res.Result.Data;
    }
  }


  async OcultarSecciones(){

    if(  this.PagoServicioPlantaId > 0){//0 es nuevo 
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
      this.ServicioPlantaEditForm.controls['nombreOrganizacion'].setValue(this.selectOrganizacion[0].RazonSocial);
      this.ServicioPlantaEditForm.controls['rucOrganizacion'].setValue(this.selectOrganizacion[0].Ruc);
      this.ServicioPlantaEditForm.controls['organizacionId'].setValue(this.selectOrganizacion[0].EmpresaProveedoraAcreedoraId);
    }
    this.modalService.dismissAll();
  }

  openModal(modal: any): void {

    this.modalService.open(modal, { windowClass: 'dark-modal', size: 'xl' });

    //this.modalService.open(modal, { windowClass: 'dark-modal', size: 'xl', centered: true });
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

//  Nuevo() {
  //  this.router.navigate(['/planta/operaciones/ServicioPlanta-edit']);
 // }


  Guardar(): void {
    //debugger
    if (!this.ServicioPlantaEditForm.invalid) {
        const form = this;
        if (this.PagoServicioPlantaId <= 0) {

          this.alertUtil.alertRegistro('Confirmación', '¿Está seguro de continuar con el registro?.', function (result) {
            if (result.isConfirmed) {
              form.RegistrarPagos();
            }
          });
        } else if (this.PagoServicioPlantaId > 0) {

          this.alertUtil.alertRegistro('Confirmación', '¿Está seguro de continuar con la actualización?.', function (result) {
            if (result.isConfirmed) {
              form.ActualizarPagos();
            }
          });
        }
       else {
        this.alertUtil.alertWarning('ADVERTENCIA!', 'No pueden existir datos vacios en el detalle, por favor corregir.');
      }
    }
  }

  RegistrarPagos(): void {
    this.spinner.show();
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


 ActualizarPagos() {
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
    const form = this.ServicioPlantaEditForm.value;

    const request =
    {

      PagoServicioPlantaId:    Number(this.PagoServicioPlantaId),
      ServicioPlantaId:    Number(this.ServicioPlantaId),
     //ServicioPlantaId: this.ServicioPlantaEditForm.controls["ServicioPlantaId"].value ? this.ServicioPlantaEditForm.controls["ServicioPlantaId"].value : 0,
     Numero: this.ServicioPlantaEditForm.controls["NumeroPagos"].value ? this.ServicioPlantaEditForm.controls["NumeroPagos"].value : '',
     NumeroOperacion: this.ServicioPlantaEditForm.controls["NumeroOperacionPagos"].value ? this.ServicioPlantaEditForm.controls["NumeroOperacionPagos"].value : '',
     TipoOperacionPagoServicioId: this.ServicioPlantaEditForm.controls["TipoOperacionPago"].value ? this.ServicioPlantaEditForm.controls["TipoOperacionPago"].value : '',
     BancoId:this.ServicioPlantaEditForm.controls["BancoPagos"].value ? this.ServicioPlantaEditForm.controls["BancoPagos"].value : '',
     FechaOperacion:this.ServicioPlantaEditForm.controls["FechaOperacionPagos"].value ? this.ServicioPlantaEditForm.controls["FechaOperacionPagos"].value : '',
     Importe:this.ServicioPlantaEditForm.controls["ImportePagos"].value ? this.ServicioPlantaEditForm.controls["ImportePagos"].value : '',
     MonedaId:this.ServicioPlantaEditForm.controls["MonedaPagos"].value ? this.ServicioPlantaEditForm.controls["MonedaPagos"].value : '',
     Observaciones:this.ServicioPlantaEditForm.controls["ObservacionPagos"].value ? this.ServicioPlantaEditForm.controls["ObservacionPagos"].value : '',
     Usuario: this.vSessionUser.Result.Data.NombreUsuario,
     EmpresaId: this.vSessionUser.Result.Data.EmpresaId,

     

    }
    
    //let json = JSON.stringify(request);
    return request;


  }





  fileChange(event: any): void {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.ServicioPlantaEditForm.patchValue({ file: file });
    }
    this.ServicioPlantaEditForm.get('file').updateValueAndValidity();
  }

  async ConsultaPorId(PagoServicioPlantaId) {
 
    
    let request =
    {
      "PagoServicioPlantaId": Number(PagoServicioPlantaId),
    }

    this.PagoServicioPlantaService.ConsultarPorId(request)
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
     // if (data.EstadoId)
      //  this.ServicioPlantaEditForm.controls.estado.setValue(data.EstadoId);
      //this.ordenProcesoEditForm.controls.cantidadContenedores.setValue(data.CantidadContenedores);
      this.ServicioPlantaEditForm.controls.cantidadDefectos.setValue(data.CantidadDefectos);
      this.ServicioPlantaEditForm.controls.numeroContrato.setValue(data.NumeroContrato);
      this.ServicioPlantaEditForm.controls.fechaInicio.setValue(data.FechaInicioProceso == null ? "" : formatDate(data.FechaInicioProceso, 'yyyy-MM-dd', 'en'));
      this.ServicioPlantaEditForm.controls.fechaFin.setValue(data.FechaFinProceso == null ? "" : formatDate(data.FechaFinProceso, 'yyyy-MM-dd', 'en'));
      this.selectOrganizacion[0] = { EmpresaProveedoraAcreedoraId: data.OrganizacionId };
      this.ServicioPlantaEditForm.controls.estado.disable();

   //this.ServicioPlantaEditForm.controls.Numero.setValue(data.Numero);

   //if (data.Numero){
   // this.ServicioPlantaEditForm.controls.Numero.setValue(data.Numero);
   //}
   this.ServicioPlantaEditForm.controls.NumeroOperacionRelacionada.setValue(data.NumeroOperacionRelacionada);
   this.ServicioPlantaEditForm.controls.TipoServicio.setValue(data.TipoServicioId);
   this.ServicioPlantaEditForm.controls.TipoComprobante.setValue(data.TipoComprobanteId);
   this.ServicioPlantaEditForm.controls.SerieComprobante.setValue(data.SerieComprobante);
   this.ServicioPlantaEditForm.controls.NumeroComprobante.setValue(data.NumeroComprobante);

  this.ServicioPlantaEditForm.controls.FechaDocumento.setValue(data.FechaDocumento == null ? "" : formatDate(data.FechaDocumento, 'yyyy-MM-dd', 'en'));
  
  this.ServicioPlantaEditForm.controls.FechaRegistroPago.setValue(data.FechaRegistro == null ? "" : formatDate(data.FechaRegistro, 'yyyy-MM-dd', 'en'));
 //this.ServicioPlantaEditForm.controls.FechaRegistro.setValue(data.FechaRegistro == null ? "" : formatDate(data.FechaRegistro, 'yyyy-MM-dd', 'en'));

  this.ServicioPlantaEditForm.controls.SerieDocumento.setValue(data.SerieDocumento);
   this.ServicioPlantaEditForm.controls.NumeroDocumento.setValue(data.NumeroDocumento);

   this.ServicioPlantaEditForm.controls.UnidadMedida.setValue(data.UnidadMedidaId);
   this.ServicioPlantaEditForm.controls.Cantidad.setValue(data.Cantidad);
   this.ServicioPlantaEditForm.controls.PrecioUnitario.setValue(data.PrecioUnitario);
  // this.ServicioPlantaEditForm.controls.Importe.setValue(data.Importe);

   this.ServicioPlantaEditForm.controls.PorcentajeTIRB.setValue(data.PorcentajeTIRB);
  // this.ServicioPlantaEditForm.controls.Moneda.setValue(data.MonedaId);
   this.ServicioPlantaEditForm.controls.TotalImporte.setValue(data.TotalImporte);
   this.ServicioPlantaEditForm.controls.Observaciones.setValue(data.Observaciones);
   this.ServicioPlantaEditForm.controls.razonSocialPago.setValue(data.RazonSocialEmpresaCliente);
   this.ServicioPlantaEditForm.controls.nroRucPago.setValue(data.RucEmpresaCliente);
   //////////////////////////////////////////////////////////
      /////////Camppos del api Por Id servicio planta ////////////////////////7
   
   this.ServicioPlantaEditForm.controls.PagoServicioPlantaId.setValue(data.PagoServicioPlantaId);
   this.ServicioPlantaEditForm.controls.ServicioPlantaId.setValue(data.ServicioPlantaId);
   this.ServicioPlantaEditForm.controls.NumeroPagos.setValue(data.Numero);
   this.ServicioPlantaEditForm.controls.BancoPagos.setValue(data.BancoId);
   this.ServicioPlantaEditForm.controls.ImportePagos.setValue(data.Importe);
   this.ServicioPlantaEditForm.controls.MonedaPagos.setValue(data.MonedaId)
   this.ServicioPlantaEditForm.controls.EstadoPagos.setValue(data.EstadoId);
   this.ServicioPlantaEditForm.controls.NumeroOperacionPagos.setValue(data.NumeroOperacion);
   this.ServicioPlantaEditForm.controls.TipoOperacionPago.setValue(data.TipoOperacionPagoServicioId);
   this.ServicioPlantaEditForm.controls.ObservacionPagos.setValue(data.Observaciones);
   this.ServicioPlantaEditForm.controls.FechaOperacionPagos.setValue(data.FechaOperacion == null ? "" : formatDate(data.FechaOperacion, 'yyyy-MM-dd', 'en'));
   //this.ServicioPlantaEditForm.controls.FechaRegistroPagos.setValue(data.FechaRegistro == null ? "" : formatDate(data.FechaRegistro, 'yyyy-MM-dd', 'en'));


   //EmpresaId: this.vSessionUser.Result.Data.EmpresaId,
   
  // this.ServicioPlantaEditForm.controls.FechaRegistroPago.setValue(data.FechaRegistro == null ? "" : formatDate(data.FechaInicio, 'yyyy-MM-dd', 'en'));
  // this.ServicioPlantaEditForm.controls.FechaFinPagos.setValue(data.FechaFin == null ? "" : formatDate(data.FechaFin, 'yyyy-MM-dd', 'en'));

   //this.EmpresaId: this.vSessionUser.Result.Data.EmpresaId,

    }
    this.spinner.hide();
  }

  Cancel(): void {
    this.router.navigate([`/planta/operaciones/Servicios-edit/${this.ServicioPlantaId}`]);
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