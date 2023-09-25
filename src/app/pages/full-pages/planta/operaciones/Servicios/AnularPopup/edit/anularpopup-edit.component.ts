import { Component, OnInit, ViewEncapsulation, Input,EventEmitter, ViewChild,Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatatableComponent, ColumnMode } from "@swimlane/ngx-datatable";
import { DateUtil } from '../../../../../../../services/util/date-util';
import { AlertUtil } from '../../../../../../../services/util/alert-util';
import { MaestroService } from '../../../../../../../services/maestro.service';
import { OrdenProcesoService } from '../../../../../../../services/orden-proceso.service';
import { OrdenProcesoServicePlanta } from '../../../../../../../Services/orden-proceso-planta.service';
import{ PagoServicioPlantaService }from '../../../../../../../Services/PagoServiciosPlanta.service';
import { NotaIngresoService } from '../../../../../../../services/notaingreso.service';
import { ControlCalidadService } from '../../../../../../../Services/control-calidad.service';
import { host } from '../../../../../../../shared/hosts/main.host';
import { formatDate } from '@angular/common';
import{ServicioPlantaService}from'../../../../../../../Services/ServicioPlanta.services';
import { AuthService } from '../../../../../../../services/auth.service';
import { number } from 'ngx-custom-validators/src/app/number/validator';
import { sum } from 'chartist';

@Component({
  selector: 'app-anularpopup-edit',
  templateUrl: './anularpopup-edit.component.html',
  styleUrls: ['./anularpopup-edit.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AnularServicioeditComponent implements OnInit {

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
  AnularServicioEditForm: FormGroup;
  vMsgErrGenerico = "Ha ocurrido un error interno.";
  listEstado = [];
  tipoProcesoSecado = '02';
  tipoProcesoReproceso = '03';
  listTipoProcesos = [];
  listTipoProduccion = [];
  esHumedo = false;
  submitted = false;
  submittedEdit = false;
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

  listTipoEstadoServicioPagos:[]=[];
  selectedTipoEstadoServicioPagos:any;




  listaCertificacion: any[];
  listaCampania:any[];
  listaCampania2:any[];
  listProducto = [];
  listCertificadora = [];
  listSubProducto = [];
  listEmpaque = [];
  listTipo = [];
  listEstadoServicio:any[];
  selectedEstadoServicio: any;
  listProductoTerminado = [];
  listSubProductoTerminado = [];
  listCalidad = [];
  listGrado = [];
  selectedCampania:any;
  selectedCampania2:any;
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
  PagoServicioPlantaId: Number;
  //PagoServicioPlantaId:Number;
 
 // errorGeneral = { isError: false, msgError: '' };
  msgErrorGenerico = 'Ocurrio un error interno.';
  rowsDetails = [];
  rows = [];
  tempData = [];
  //selected = [];

  Moneda:string;
  //limitRef: number = 10;
  @Output() agregarEvent = new EventEmitter<any>();
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild(DatatableComponent) tblDetails: DatatableComponent;
  @ViewChild(DatatableComponent) tableLotesDetalle: DatatableComponent;
  isLoading = false;
  fileName = "";
 // popUp = true;
  @Input() popUp = false;
  @Input() selected = [];
  popUpAnularServicio = true;
  estado = "01";
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
    this.PagoServicioPlantaId = this.route.snapshot.params.PagoServicioPlantaId ? Number(this.route.snapshot.params.PagoServicioPlantaId) : 0;
    this.ServicioPlantaId = this.route.snapshot.params['id'] ? Number(this.route.snapshot.params['id']) : 0;
    //this.Moneda = this.route.snapshot.params.Moneda ? Number(this.route.snapshot.params.Moneda) : 0;
    await this.LoadForm();
    //this.AnularServicioEditForm.controls['FechaFinPagos'].setValue(this.dateUtil.currentDate());
    //this.AnularServicioEditForm.controls['FechaInicioPagos'].setValue(this.dateUtil.currentMonthAgo()); 
    //this.ServicioPlantaEditForm.controls.MonedaPagos.setValue(this.vSessionUser.Result.Data.MonedaId);
    //this.ServicioPlantaEditForm.controls['MonedaId'].setValue(this.detalle.Result.Data.MonedaId);
  
    this.AnularServicioEditForm.controls.razonSocialCabe.setValue(this.vSessionUser.Result.Data.RazonSocialEmpresa);
    this.AnularServicioEditForm.controls.direccionCabe.setValue(this.vSessionUser.Result.Data.DireccionEmpresa);
    this.AnularServicioEditForm.controls.nroRucCabe.setValue(this.vSessionUser.Result.Data.RucEmpresa);
    this.AnularServicioEditForm.controls.responsableComercial.setValue(this.vSessionUser.Result.Data.NombreCompletoUsuario);

    this.GetListaTipoEstadoPagos();
    this.GetEstado();
    this.GetEstadoSercicio();
    //this.GetTipoProduccion();
    this.GetCertificacion();
    //this.GetProductoTerminado();
    //this.GetCalidad();
    //this.GetGrado();
    if (this.PagoServicioPlantaId <= 0) {
      this.AnularServicioEditForm.controls.fechaCabe.setValue(this.dateUtil.currentDate());
    } else if (this.PagoServicioPlantaId > 0) {
      this.ConsultaPorId(this.PagoServicioPlantaId);
    }

   //this.readonly = this.authService.esReadOnly(this.vSessionUser.Result.Data.OpcionesEscritura, this.AnularServicioEditForm.controls.MonedaPagos);

  }

  async GetSubProductoTerminado() {
    const data = await this.maestroService.obtenerMaestros('SubProductoPlanta').toPromise();
    if (data.Result.Success) {
      this.listProductoTerminado = data.Result.Data.filter(obj => obj.Val1 == '02'); //Exportable
    }
  }

  LoadForm(): void {
    this.AnularServicioEditForm = this.fb.group({
     
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
      ObservacionPagos:['',''],
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
      PagoServicioPlantaId:['',''],
      ObservacionAnulacion:['',''],
      //TipoComprobanteId:['',''],
      Numero: ['', ''],
      NumeroOperacionRelacionada: ['', ''],
      SerieComprobante: ['', ''],
      NumeroComprobante: ['', ''],
      FechaDocumento: ['', ''],
      FechaComprobante:['',''],
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
      ImportePago: ['', ''],
      Observaciones: ['', ''],
      Campania: new FormControl('',[]),
      estadoServicio:['',''],
      /////////////Pagos Servicios//////////////77
      NumeroPagos:['',''],
      BancoPagos:['',''],
      NumeroOperacionPagos:['',''],
      MonedaPagos:['',''],
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
    this.AnularServicioEditForm.controls.estado.disable();
  }

  get f() {
    return this.AnularServicioEditForm.controls;
  }

  async GetEstadoSercicio() {
    const res = await this.maestroService.obtenerMaestros('EstadoServicioPlanta').toPromise();
    if (res.Result.Success) {
      this.listEstadoServicio = res.Result.Data;
    }
  }

  async GetListaTipoEstadoPagos () {
    let res = await this.maestroService.obtenerMaestros('EstadoPagoServicio').toPromise();
    if (res.Result.Success) {
      this.listTipoEstadoServicioPagos = res.Result.Data;
    }
  }
  async GetEstado() {
    const res = await this.maestroService.obtenerMaestros('EstadoOrdenProcesoPlanta').toPromise();
    if (res.Result.Success) {
      this.listEstado = res.Result.Data;
    }
  }


  async GetCertificacion() {
    const res = await this.maestroService.obtenerMaestros('TipoCertificacionPlanta').toPromise();
    if (res.Result.Success) {
      this.listaCertificacion = res.Result.Data;
    }
  }


  buscar(): void {
    this.Search();
  }
  Search(): void {
    if (!this.AnularServicioEditForm.invalid) {
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
      
    
    const form = this.AnularServicioEditForm.value;

      const request =
     {
      
        Numero: this.AnularServicioEditForm.controls["NumeroPagos"].value ? this.AnularServicioEditForm.controls["NumeroPagos"].value : '',
        NumeroOperacion:  this.AnularServicioEditForm.controls["NumeroOperacionPagos"].value ?  this.AnularServicioEditForm.controls["NumeroOperacionPagos"].value : '',
        TipoOperacionPagoServicioId:  this.AnularServicioEditForm.controls["TipoOperacionPago"].value ?this.AnularServicioEditForm.controls["TipoOperacionPago"].value : '',
        ServicioPlantaId:   this.AnularServicioEditForm.controls["ServicioPlantaId"].value ? this.AnularServicioEditForm.controls["ServicioPlantaId"].value : 0,
        BancoId:    this.AnularServicioEditForm.controls["BancoPagos"].value ? this.AnularServicioEditForm.controls["BancoPagos"].value : '',
        MonedaId:   this.AnularServicioEditForm.controls["MonedaPagos"].value ? this.AnularServicioEditForm.controls["MonedaPagos"].value : '',
        FechaInicio:   this.AnularServicioEditForm.controls["FechaInicioPagos"].value ? this.AnularServicioEditForm.controls["FechaInicioPagos"].value : '',
        FechaFin:   this.AnularServicioEditForm.controls["FechaFinPagos"].value ? this.AnularServicioEditForm.controls["FechaFinPagos"].value : '',
        EstadoId:   this.AnularServicioEditForm.controls["EstadoPagos"].value ? this.AnularServicioEditForm.controls["EstadoPagos"].value : '',
        EmpresaId: this.vSessionUser.Result.Data.EmpresaId

      }
    
      //let json = JSON.stringify(request);
      return request;
  
  
  }

  anular() {
    if (this.selected.length > 0) {
    
     // if (this.selected[0].EstadoId == this.estado) {
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
            form.anularPago();
          }
          else {
            this.alertUtil.alertError("Error", "Solo se puede Anular en estado Registrados")
          }
        });
       
     // } 
    }
  }

  anularPago(){
    this.spinner.show(),
      {
        type: 'ball-triangle-path',
        size: 'medium',
        bdColor: 'rgba(0, 0, 0, 0.8)',
        color: '#fff',
        fullScreen: true
      };
      this.PagoServicioPlantaService.Anular(
      {
        "PagoServicioPlantaId": this.selected[0].PagoServicioPlantaId,
        "ServicioPlantaId":this.selected[0].ServicioPlantaId,
        "Importe":this.selected[0].Importe,
        "Usuario": this.vSessionUser.Result.Data.NombreUsuario,
        "ObservacionAnulacion":this.AnularServicioEditForm.controls.ObservacionAnulacion.value
      })
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
           // var form = this;
            this.alertUtil.alertOk('Anulado!', 'Pago Servicios Anulado.');
           //this.buscar();
           this.modalService.dismissAll();

           // form.router.navigate(['/planta/operaciones/servicios-edit']);
         
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
      this.AnularServicioEditForm.controls.ordenProcesoComercial.setValue(data.NumeroOrdenProcesoComercial);
      this.AnularServicioEditForm.controls.idOrdenProcesoComercial.setValue(data.OrdenProcesoId);
     // this.ServicioPlantaEditForm.controls.rucOrganizacion.setValue(data.RucOrganizacion);
     // this.ServicioPlantaEditForm.controls.nombreOrganizacion.setValue(data.RazonSocialOrganizacion);
      if (data.EstadoId)
        this.AnularServicioEditForm.controls.estado.setValue(data.EstadoId);
      //this.ordenProcesoEditForm.controls.cantidadContenedores.setValue(data.CantidadContenedores);
      this.AnularServicioEditForm.controls.cantidadDefectos.setValue(data.CantidadDefectos);
      this.AnularServicioEditForm.controls.numeroContrato.setValue(data.NumeroContrato);
      this.AnularServicioEditForm.controls.fechaInicio.setValue(data.FechaInicioProceso == null ? "" : formatDate(data.FechaInicioProceso, 'yyyy-MM-dd', 'en'));
      this.AnularServicioEditForm.controls.fechaFin.setValue(data.FechaFinProceso == null ? "" : formatDate(data.FechaFinProceso, 'yyyy-MM-dd', 'en'));
      this.selectOrganizacion[0] = { EmpresaProveedoraAcreedoraId: data.OrganizacionId };
      this.AnularServicioEditForm.controls.estado.disable();

   /////////Camppos del api servicio planta ////////////////////////7
   this.AnularServicioEditForm.controls.ServicioPlantaId.setValue(data.ServicioPlantaId);
   //this.ServicioPlantaEditForm.controls.Numero.setValue(data.Numero);

   if (data.Numero){
    this.AnularServicioEditForm.controls.Numero.setValue(data.Numero);
   }
   this.AnularServicioEditForm.controls.NumeroOperacionRelacionada.setValue(data.NumeroOperacionRelacionada);
   this.AnularServicioEditForm.controls.TipoServicio.setValue(data.TipoServicioId);
   this.AnularServicioEditForm.controls.TipoComprobante.setValue(data.TipoComprobanteId);
   this.AnularServicioEditForm.controls.SerieComprobante.setValue(data.SerieComprobante);
   this.AnularServicioEditForm.controls.NumeroComprobante.setValue(data.NumeroComprobante);

  this.AnularServicioEditForm.controls.FechaDocumento.setValue(data.FechaDocumento == null ? "" : formatDate(data.FechaDocumento, 'yyyy-MM-dd', 'en'));

  this.AnularServicioEditForm.controls.FechaComprobante.setValue(data.FechaComprobante == null ? "" : formatDate(data.FechaComprobante, 'yyyy-MM-dd', 'en'));
  
  this.AnularServicioEditForm.controls.FechaRegistro.setValue(data.FechaRegistro == null ? "" : formatDate(data.FechaRegistro, 'yyyy-MM-dd', 'en'));

  this.AnularServicioEditForm.controls.SerieDocumento.setValue(data.SerieDocumento);
   this.AnularServicioEditForm.controls.NumeroDocumento.setValue(data.NumeroDocumento);

   this.AnularServicioEditForm.controls.UnidadMedida.setValue(data.UnidadMedidaId);
  
   this.AnularServicioEditForm.controls.Cantidad.setValue(data.Cantidad);
   this.AnularServicioEditForm.controls.PrecioUnitario.setValue(data.PrecioUnitario);
   
   
   this.AnularServicioEditForm.controls.Moneda.setValue(data.MonedaId);

   this.AnularServicioEditForm.controls.Importe.setValue(data.Importe);

   this.AnularServicioEditForm.controls.PorcentajeTIRB.setValue(data.PorcentajeTIRB);
   this.AnularServicioEditForm.controls.MonedaPagos.setValue(data.MonedaId);
   this.AnularServicioEditForm.controls.TotalImporte.setValue(data.TotalImporte);
   this.AnularServicioEditForm.controls.ImportePago.setValue(data.TotalImporteProcesado);
   this.AnularServicioEditForm.controls.ObservacionPago.setValue(data.Observaciones);
   this.AnularServicioEditForm.controls.ObservacionAnulacion.setValue(data.ObservacionAnulacion);
   this.AnularServicioEditForm.controls.Campania.setValue(data.CodigoCampania);
   
   this.AnularServicioEditForm.controls['organizacionId'].setValue(data.EmpresaClienteId);
   this.AnularServicioEditForm.controls.nombreOrganizacion.setValue(data.RazonSocialEmpresaCliente);
  this.AnularServicioEditForm.controls.rucOrganizacion.setValue(data.RucEmpresaCliente);
    }
    this.spinner.hide();
  }

  Cancel(): void {
      
    this.modalService.dismissAll();
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

  Agregar(selected: any) {
    this.agregarEvent.emit(selected)
  }



}