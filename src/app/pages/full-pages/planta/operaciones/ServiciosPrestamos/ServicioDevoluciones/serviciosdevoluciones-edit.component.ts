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
import { PagoServicioPlantaService } from '../../../../../../Services/PagoServiciosPlanta.service';
import { OrdenProcesoService } from '../../../../../../services/orden-proceso.service';
import { DevolucionPrestamoService } from '../../../../../../Services/ServiciosDevoluciones.services';
import { OrdenProcesoServicePlanta } from '../../../../../../Services/orden-proceso-planta.service';
import { NotaIngresoService } from '../../../../../../services/notaingreso.service';
import { ControlCalidadService } from '../../../../../../Services/control-calidad.service';
import { host } from '../../../../../../shared/hosts/main.host';
import { formatDate } from '@angular/common';
import { ServicioPlantaService } from '../../../../../../Services/ServicioPlanta.services';
import { AuthService } from '../../../../../../services/auth.service';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-serviciosdevoluciones-edit',
  templateUrl: './serviciosdevoluciones-edit.component.html',
  styleUrls: ['./serviciosdevoluciones-edit.component.scss', '/assets/sass/libs/datatables.scss'],
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
    private PagoServicioPlantaService: PagoServicioPlantaService,
    private DevolucionPrestamoService: DevolucionPrestamoService,
    private ServicioPlantaService: ServicioPlantaService,
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
  listEstadoDevolucion = [];

  tipoProcesoSecado = '02';
  tipoProcesoReproceso = '03';
  listTipoProcesos = [];
  listTipoProduccion = [];
  esHumedo = false;
  submitted = false;
  submittedEdit = false;
  esReproceso = false;
  //listCertificacion = [];
  listTipoMonedaDevoluciones: [] = [];
  SelectedTipoMonedaDevoluciones: any;
  listTipoDestino: [] = [];
  selectedTipoDestino: any;
  listTipoBancoDevolucion: [] = [];
  selectedTipoBancoDevolucion: any;
  selectOrganizacion = [];
  selectedEstado: any;
  selectedEstadoDevolucion: any;
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
  Moneda: string;
  OcultarSeccion: boolean = true;
  public limitRef = 20;
  averageExportable: Number = 0;
  averageDescarte: Number = 0;
  averageCascarilla: Number = 0;
  formGroupCantidad: FormGroup;
  groupCantidad = {};


  async ngOnInit() {
    this.vSessionUser = JSON.parse(localStorage.getItem('user'));
    this.DevolucionPrestamoPlantaId = this.route.snapshot.params.DevolucionPrestamoPlantaId ? Number(this.route.snapshot.params.DevolucionPrestamoPlantaId) : 0;
    this.PrestamoPlantaId = this.route.snapshot.params.PrestamoPlantaId ? Number(this.route.snapshot.params.PrestamoPlantaId) : 0;
    this.Moneda = this.route.snapshot.params.Moneda ? this.route.snapshot.params.Moneda : '';

    await this.LoadForm();

    // this.DevolucionesEditForm.controls.MonedaDevolucion.setValue(this.Moneda);
    this.DevolucionesEditForm.controls.razonSocialCabe.setValue(this.vSessionUser.Result.Data.RazonSocialEmpresa);
    this.DevolucionesEditForm.controls.direccionCabe.setValue(this.vSessionUser.Result.Data.DireccionEmpresa);
    this.DevolucionesEditForm.controls.nroRucCabe.setValue(this.vSessionUser.Result.Data.RucEmpresa);
    this.DevolucionesEditForm.controls.responsableComercial.setValue(this.vSessionUser.Result.Data.NombreCompletoUsuario);
    this.GetListaTipoDestino();
    this.GetListaTipoBancoDevolucion();
    this.GetListaTipoMonedaDevoluciones();
    this.GetEstadoDevolucion();

    if (this.DevolucionPrestamoPlantaId <= 0) {
      this.DevolucionesEditForm.controls.FechaRegistroDevolucion.setValue(this.dateUtil.currentDate());

    } else if (this.DevolucionPrestamoPlantaId > 0) {

      this.ConsultaPorId(this.DevolucionPrestamoPlantaId);
    }
    // this.readonly = this.authService.esReadOnly(this.vSessionUser.Result.Data.OpcionesEscritura, this.DevolucionesEditForm.controls.MonedaPagos);

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

      EmpresaId: ['', ''],
      /////DATOS DE PANTALLA EDIT DE SERVICIOS PLANTA
      ServicioPlantaId: ['', ''],
      EmpresaClienteId: ['', ''],
      /////////////////7
      RazonSocialEmpresaCliente: ['', ''],
      RucEmpresaCliente: ['',],
      Numero: ['', ''],
      FechaRegistro: ['', ''],
      Importe: ['', ''],
      BnacoDevolucion: ['', ''],
      Moneda: ['', ''],
      MonedaId: ['', ''],
      TotalImporte: ['', ''],
      DestinoDevolucion: ['', ''],
      DevolucionPrestamoPlantaId: ['', ''],
      PrestamoPlantaId: ['', ''],
      ///////////////////////////77
      NumeroDevolucion: ['', ''],
      EstadoDevolucion: ['', ''],
      MonedaDevolucion: ['', ''],
      EstadoPagos: [],
      DestinoBanco: ['', ''],
      ObservacionDevolucion: ['', ''],
      ImporteDevolucion: ['', ''],
      ImporteCambioDevolucion: ['', ''],
      BancoDevolucion: ['', ''],
      //FechaOperacion:['',''],
      FechaDevolucion: ['', ''],
      FechaRegistroDevolucion: ['', ''],
      razonSocialPago: ['',],
      direccionPago: ['',],
      nroRucPago: ['',],

      //////Grilla campos////////////
      // FechaOperacionPagos:['', Validators.required],
      FechaRegistroPagos: ['', '']

    });
    this.DevolucionesEditForm.controls.EstadoDevolucion.disable();
  }


  get f() {
    return this.DevolucionesEditForm.controls;
  }

  async GetListaTipoBancoDevolucion() {
    let res = await this.maestroService.obtenerMaestros('Banco').toPromise();
    if (res.Result.Success) {
      this.listTipoBancoDevolucion = res.Result.Data;
    }
  }
  async GetListaTipoDestino() {
    let res = await this.maestroService.obtenerMaestros('DestinoDevolucion').toPromise();
    if (res.Result.Success) {
      this.listTipoDestino = res.Result.Data;
    }
  }

  async GetListaTipoMonedaDevoluciones() {
    let res = await this.maestroService.obtenerMaestros('Moneda').toPromise();
    if (res.Result.Success) {
      this.listTipoMonedaDevoluciones = res.Result.Data;
    }
  }

  async GetEstadoDevolucion() {
    const res = await this.maestroService.obtenerMaestros('EstadoDevolucionPrestamoPlanta').toPromise();
    if (res.Result.Success) {
      this.listEstadoDevolucion = res.Result.Data;
    }
  }


  async OcultarSecciones() {

    if (this.DevolucionPrestamoPlantaId > 0) {//0 es nuevo 
      //ocultar secciones 
      this.OcultarSeccion = true;

    } else {
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

  RegistrarDevoluciones(): void {
    this.spinner.show();
    const request = this.GetRequest();
    this.DevolucionPrestamoService.Registrar(request)
      .subscribe((res: any) => {
        this.spinner.hide();

        if (res.Result.Success) {
          if (res.Result.Data > 0) {

            this.alertUtil.alertOkCallback("CONFIRMACIÓN!",
              "Se registro correctamente la Devolucion.",
              () => {
                this.Cancel();
              });
          } else {
            this.alertUtil.alertWarning("Advertencia", "No se puede Registrar Mas Devoluciones");
          }

        }

        else {
          this.alertUtil.alertError("ERROR!", res.Result.Message);
        }

      }, (err: any) => {
        console.log(err);
        this.spinner.hide();
        this.alertUtil.alertError("ERROR!", this.vMsgErrGenerico); {

        }

      });
  }


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

  GetRequest(): any {

    // debugger
    const form = this.DevolucionesEditForm.value;

    const request =
    {

      DevolucionPrestamoPlantaId: Number(this.DevolucionPrestamoPlantaId),
      PrestamoPlantaId: Number(this.PrestamoPlantaId),
      DestinoDevolucionId: this.DevolucionesEditForm.controls["DestinoDevolucion"].value ? this.DevolucionesEditForm.controls["DestinoDevolucion"].value : '',
      BancoId: this.DevolucionesEditForm.controls["BancoDevolucion"].value ? this.DevolucionesEditForm.controls["BancoDevolucion"].value : '',
      FechaDevolucion: this.DevolucionesEditForm.controls["FechaDevolucion"].value ? this.DevolucionesEditForm.controls["FechaDevolucion"].value : '',
      Importe: this.DevolucionesEditForm.controls["ImporteDevolucion"].value ? this.DevolucionesEditForm.controls["ImporteDevolucion"].value : '',
      // ImporteCambio:this.DevolucionesEditForm.controls["ImporteCambioDevolucion"].value ? this.DevolucionesEditForm.controls["ImporteCambioDevolucion"].value : '',
      MonedaId: this.DevolucionesEditForm.controls["MonedaDevolucion"].value ? this.DevolucionesEditForm.controls["MonedaDevolucion"].value : '',
      Observaciones: this.DevolucionesEditForm.controls["ObservacionDevolucion"].value ? this.DevolucionesEditForm.controls["ObservacionDevolucion"].value : '',
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

  /*async ConsultaPorId(DevolucionPrestamoPlantaId) {
    // this.spinner.show();

    let request =
    {
      "DevolucionPrestamoPlantaId": Number(DevolucionPrestamoPlantaId),
    }

    this.DevolucionPrestamoService.ConsultarPorId(request)
      .subscribe(res => {
        // this.spinner.hide();
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
          //this.spinner.hide();
          console.log(err);
          this.errorGeneral = { isError: false, errorMessage: this.mensajeErrorGenerico };
        }
      );

    //LLAMAR SERVICIO


  }*/

  async ConsultaPorId(DevolucionPrestamoPlantaId) {
    this.spinner.show();

    let request =
    {
      "DevolucionPrestamoPlantaId": Number(DevolucionPrestamoPlantaId),
    }

    this.DevolucionPrestamoService.ConsultarPorId(request)
      .subscribe(res => {
        this.spinner.hide();
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
          this.spinner.hide();
          console.log(err);
          this.errorGeneral = { isError: false, errorMessage: this.mensajeErrorGenerico };
        }
      );

    //LLAMAR SERVICIO


  }



  async AutocompleteFormEdit(data: any) {
    if (data) {

      ///////////////////////devolucion prestamos/////////////////////////////////////
      this.DevolucionesEditForm.controls.DevolucionPrestamoPlantaId.setValue(data.DevolucionPrestamoPlantaId);
      this.DevolucionesEditForm.controls.PrestamoPlantaId.setValue(data.PrestamoPlantaId);
      this.DevolucionesEditForm.controls.NumeroDevolucion.setValue(data.Numero);
      this.DevolucionesEditForm.controls.FechaRegistroDevolucion.setValue(data.FechaRegistro == null ? "" : formatDate(data.FechaRegistro, 'yyyy-MM-dd', 'en'));
      this.DevolucionesEditForm.controls.FechaDevolucion.setValue(data.FechaDevolucion == null ? "" : formatDate(data.FechaDevolucion, 'yyyy-MM-dd', 'en'));
      await this.GetListaTipoDestino();
      this.DevolucionesEditForm.controls["DestinoDevolucion"].setValue(data.DestinoDevolucionId);
      //this.DevolucionesEditForm.controls.DestinoDevolucion.setValue(data.DestinoDevolucionId);
      // this.DevolucionesEditForm.controls.MonedaDevolucion.setValue(data.MonedaId);
      await this.GetListaTipoMonedaDevoluciones();
      this.DevolucionesEditForm.controls["MonedaDevolucion"].setValue(data.MonedaId);
      await this.GetListaTipoBancoDevolucion();
      this.DevolucionesEditForm.controls["BancoDevolucion"].setValue(data.BancoId);
      // this.DevolucionesEditForm.controls.BancoDevolucion.setValue(data.BancoId);
      this.DevolucionesEditForm.controls.ImporteDevolucion.setValue(data.Importe);
      await this.GetEstadoDevolucion();
      this.DevolucionesEditForm.controls["EstadoDevolucion"].setValue(data.EstadoId);
      // this.DevolucionesEditForm.controls.ImporteCambioDevolucion.setValue(data.ImporteCambio);
      this.DevolucionesEditForm.controls.ObservacionDevolucion.setValue(data.Observaciones);
      // this.DevolucionesEditForm.controls.EstadoDevolucion.setValue(data.EstadoId);

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