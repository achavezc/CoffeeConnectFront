import { Component, OnInit, ViewEncapsulation, Input, EventEmitter, ViewChild, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatatableComponent, ColumnMode } from "@swimlane/ngx-datatable";
import { DateUtil } from '../../../../../../services/util/date-util';
import { AlertUtil } from '../../../../../../services/util/alert-util';
import { MaestroService } from '../../../../../../services/maestro.service';
import { host } from '../../../../../../shared/hosts/main.host';
import { formatDate } from '@angular/common';
import { ServiciosPrestamosService } from '../../../../../../Services/ServiciosPrestamos.services';
import { DevolucionPrestamoService } from '../../../../../../Services/ServiciosDevoluciones.services';
import { AuthService } from '../../../../../../services/auth.service';


@Component({
  selector: 'app-serviciosprestamos-edit',
  templateUrl: './serviciosprestamos-edit.component.html',
  styleUrls: ['./serviciosprestamos-edit.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PrestamosEditComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private modalService: NgbModal,
    private dateUtil: DateUtil,
    private maestroService: MaestroService,
    private ServiciosPrestamosService: ServiciosPrestamosService,
    private DevolucionPrestamoService: DevolucionPrestamoService,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: NgxSpinnerService,
    private alertUtil: AlertUtil,
    private authService: AuthService) { }


  error: any = { isError: false, errorMessage: '' };
  errorFecha: any = { isError: false, errorMessage: '' };
  PrestamosEditForm: FormGroup;
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
  listTipoDestino: [] = [];
  selectedTipoDestino: any;
  listTipoBancoDevolucion: [] = [];
  selectedTipoBancoDevolucion: any;
  selectOrganizacion = [];
  listTipoEstadoPrestamo: [] = [];
  selectedTipoEstadoPrestamo: any;

  listTipoMonedaPrestamos: [] = [];
  SelectedTipoMonedaPrestamos: any;


  listTipoMonedaDevolucion: [] = [];
  SelectedTipoMonedaDevolucion: any;

  listTipoEstadoDevolucion: [] = [];
  selectedTipoEstadoDevolucion: any;

  listTipoEstadoFondos: [] = [];
  selectedTipoEstadoFondos: any;

  vSessionUser: any;
  errorGeneral: any = { isError: false, errorMessage: '' };
  mensajeErrorGenerico = "Ocurrio un error interno.";
  PrestamoPlantaId: Number;
  //PagoServicioPlantaId:Number;

  // errorGeneral = { isError: false, msgError: '' };
  msgErrorGenerico = 'Ocurrio un error interno.';
  rowsDetails = [];
  rows = [];
  tempData = [];
  selected = [];

  Moneda: string;
  //limitRef: number = 10;
  @Output() agregarEvent = new EventEmitter<any>();
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild(DatatableComponent) tblDetails: DatatableComponent;
  @ViewChild(DatatableComponent) tableLotesDetalle: DatatableComponent;
  isLoading = false;
  fileName = "";
  popUp = true;
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
  OcultarSeccion: boolean = true;
  public limitRef = 20;
  averageExportable: Number = 0;
  averageDescarte: Number = 0;
  averageCascarilla: Number = 0;
  formGroupCantidad: FormGroup;
  groupCantidad = {};


  async ngOnInit() {
    this.vSessionUser = JSON.parse(localStorage.getItem('user'));
    //this
    this.PrestamoPlantaId = this.route.snapshot.params['id'] ? Number(this.route.snapshot.params['id']) : 0;
    //this.Moneda = this.route.snapshot.params.Moneda ? Number(this.route.snapshot.params.Moneda) : 0;
    await this.LoadForm();
    this.PrestamosEditForm.controls['FechaInicioDevolucion'].setValue(this.dateUtil.currentMonthAgo());
    this.PrestamosEditForm.controls['FechaFinDevolucion'].setValue(this.dateUtil.currentDate());
    this.PrestamosEditForm.controls.razonSocialCabe.setValue(this.vSessionUser.Result.Data.RazonSocialEmpresa);
    this.PrestamosEditForm.controls.direccionCabe.setValue(this.vSessionUser.Result.Data.DireccionEmpresa);
    this.PrestamosEditForm.controls.nroRucCabe.setValue(this.vSessionUser.Result.Data.RucEmpresa);
    this.PrestamosEditForm.controls.responsableComercial.setValue(this.vSessionUser.Result.Data.NombreCompletoUsuario);

    this.GetListaTipoDestinoBanco();
    this.GetListaTipoBancoDevolucion();
    this.GetEstadoPrestamos();
    this.GetListaTipoMonedaPrestamo();
    this.GetListaTipoMonedaDevolucion();
    this.GetlistTipoEstadoFondos();
    this.GetlistTipoEstadoDevolucion();


    if (this.PrestamoPlantaId <= 0) {
      this.PrestamosEditForm.controls.fechaCabe.setValue(this.dateUtil.currentDate());
    } else if (this.PrestamoPlantaId > 0) {
      this.ConsultaPorId(this.PrestamoPlantaId);
    }

    this.readonly = this.authService.esReadOnly(this.vSessionUser.Result.Data.OpcionesEscritura, this.PrestamosEditForm.controls.SaldoPrestamo);
    this.OcultarSecciones();
  }


  LoadForm(): void {
    this.PrestamosEditForm = this.fb.group({


      razonSocialCabe: ['',],
      nroOrden: [],
      direccionCabe: ['',],
      fechaCabe: ['',],
      nroRucCabe: ['',],
      responsableComercial: [],
      estado: ['',],
      rucOrganizacion: ['',],
      nombreOrganizacion: [],
      BnacoDevolucion: ['', ''],
      /////DATOS DE PANTALLA EDIT DE SERVICIOS PLANTA
      EmpresaId: ['', ''],
      //EmpresaClienteId:['',''],
      FechaRegistro: ['', ''],
      // ObservacionAnulacion:['',''],
      /////////////Pagos Servicios//////////////77
      DestinoBanco: ['', ''],
      //////campos Prestamos Y devoluciones///////////////////
      PrestamoPlantaId: ['', ''],
      FechaPrestamo: ['', ''],
      DetallePrestamo: ['', ''],
      ImportePrestamo: ['', ''],
      EstadoPrestamo: [],
      DevolucionPrestamoPlantaId: ['', ''],
      FondoPrestamo: ['', ''],
      ImporteProcesado: ['', ''],
      Importe: ['', ''],
      ImporteDevolucion: ['', ''],
      ImporteCambio: ['', ''],
      ObservacionesPrestamo: ['', ''],
      ObservacionAnulacion: ['', ''],
      SaldoPrestamo: ['', ''],
      Moneda: ['', ''],
      MonedaId: ['', ''],
      NumeroPrestamo: ['', ''],
      MonedaPrestamos: ['', ''],
      //////////////campos de devoluciones////////////////////////////
      NumeroDevoluciones: ['', ''],
      DestinoDevolucion: ['', ''],
      DestinoDevolucionId: ['', ''],
      BancoDevolucion: ['', ''],
      MonedaPrestamosDevoluciones: ['', ''],
      FechaDevolucion: ['', ''],
      FechaInicioDevolucion: ['', ''],
      FechaFinDevolucion: ['', ''],
      EstadoDevolucion: ['', '']

    });
    this.PrestamosEditForm.controls.EstadoPrestamo.disable();
  }
  get f() {
    return this.PrestamosEditForm.controls;
  }

  async OcultarSecciones() {

    if (this.PrestamoPlantaId > 0) {//0 es nuevo 
      //ocultar secciones 
      this.OcultarSeccion = true;

    } else {
      //mostrar secciones  con valor de id 
      this.OcultarSeccion = false;

    }
  }

  async GetEstadoPrestamos() {
    const res = await this.maestroService.obtenerMaestros('EstadoPrestamoPlanta').toPromise();
    if (res.Result.Success) {
      this.listTipoEstadoPrestamo = res.Result.Data;
    }
  }

  async GetListaTipoMonedaPrestamo() {
    let res = await this.maestroService.obtenerMaestros('Moneda').toPromise();
    if (res.Result.Success) {
      this.listTipoMonedaPrestamos = res.Result.Data;
    }
  }


  async GetListaTipoMonedaDevolucion() {
    let res = await this.maestroService.obtenerMaestros('Moneda').toPromise();
    if (res.Result.Success) {
      this.listTipoMonedaDevolucion = res.Result.Data;
    }
  }



  async GetlistTipoEstadoDevolucion() {
    const res = await this.maestroService.obtenerMaestros('EstadoDevolucionPrestamoPlanta').toPromise();
    if (res.Result.Success) {
      this.listTipoEstadoDevolucion = res.Result.Data;
    }
  }


  async GetlistTipoEstadoFondos() {
    const res = await this.maestroService.obtenerMaestros('FondoPrestamo').toPromise();
    if (res.Result.Success) {
      this.listTipoEstadoFondos = res.Result.Data;
    }
  }

  async GetListaTipoDestinoBanco() {
    let res = await this.maestroService.obtenerMaestros('DestinoDevolucion').toPromise();
    if (res.Result.Success) {
      this.listTipoDestino = res.Result.Data;
    }
  }

  async GetListaTipoBancoDevolucion() {
    let res = await this.maestroService.obtenerMaestros('Banco').toPromise();
    if (res.Result.Success) {
      this.listTipoBancoDevolucion = res.Result.Data;
    }
  }

  GetDataModal(event: any): void {
    this.modalService.dismissAll();
  }


  GetDataEmpresa(event: any): void {
    this.selectOrganizacion = event;
    if (this.selectOrganizacion[0]) {

      //this.notaIngredoFormEdit.controls['codigoOrganizacion'].setValue(this.selectOrganizacion[0].Ruc);
      this.PrestamosEditForm.controls['nombreOrganizacion'].setValue(this.selectOrganizacion[0].RazonSocial);
      this.PrestamosEditForm.controls['rucOrganizacion'].setValue(this.selectOrganizacion[0].Ruc);
      this.PrestamosEditForm.controls['organizacionId'].setValue(this.selectOrganizacion[0].EmpresaProveedoraAcreedoraId);
    }
    this.modalService.dismissAll();
  }


  openModal(modal: any): void {

    this.modalService.open(modal, { windowClass: 'dark-modal', size: 'xl' });

    //this.modalService.open(modal, { windowClass: 'dark-modal', size: 'xl', centered: true });
  }

  openModalAnularPrestamoPlanta(modalServicioPrestamoAnularPlanta) {
    this.modalService.open(modalServicioPrestamoAnularPlanta, { windowClass: 'dark-modal', size: 'xl' });

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

    const form = this.PrestamosEditForm.value;
    const request =
    {

      PrestamoPlantaId: Number(this.PrestamoPlantaId),
      Numero: this.PrestamosEditForm.controls["NumeroPrestamo"].value ? this.PrestamosEditForm.controls["NumeroPrestamo"].value : '',
      DetallePrestamo: this.PrestamosEditForm.controls["DetallePrestamo"].value ? this.PrestamosEditForm.controls["DetallePrestamo"].value : '',
      FondoPrestamoId: this.PrestamosEditForm.controls["FondoPrestamo"].value ? this.PrestamosEditForm.controls["FondoPrestamo"].value : '',
      MonedaId: this.PrestamosEditForm.controls["MonedaPrestamos"].value ? this.PrestamosEditForm.controls["MonedaPrestamos"].value : '',
      Importe: this.PrestamosEditForm.controls["ImportePrestamo"].value ? this.PrestamosEditForm.controls["ImportePrestamo"].value : '',
      Observaciones: this.PrestamosEditForm.controls["ObservacionesPrestamo"].value ? this.PrestamosEditForm.controls["ObservacionesPrestamo"].value : '',
      EstadoId: this.PrestamosEditForm.controls["EstadoPrestamo"].value ? this.PrestamosEditForm.controls["EstadoPrestamo"].value : '',
      Usuario: this.vSessionUser.Result.Data.NombreUsuario,
      EmpresaId: this.vSessionUser.Result.Data.EmpresaId,


    }

    //let json = JSON.stringify(request);
    return request;


  }

  buscar(): void {
    this.Search();
  }

  Search(): void {
    if (!this.PrestamosEditForm.invalid) {
      this.spinner.show(undefined,
        {
          type: 'ball-triangle-path',
          size: 'medium',
          bdColor: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          fullScreen: true
        });
      const request = this.getRequestDevolucionesConsultar();
      this.DevolucionPrestamoService.Consultar(request)
        .subscribe((res: any) => {
          this.spinner.hide();
          if (res.Result.Success) {
            res.Result.Data.forEach(x => {
              x.FechaDevolucion = this.dateUtil.formatDate(x.FechaDevolucion)
              //x.FechaFin =  this.dateUtil.formatDate(x.FechaFin);
              //x.FechaOperacion =  this.dateUtil.formatDate(x.FechaOperacion);
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

  getRequestDevolucionesConsultar(): any {

    const form = this.PrestamosEditForm.value;

    const request =
    {
      // PrestamoPlantaId:    Number(this.PrestamoPlantaId),
      PrestamoPlantaId: this.PrestamosEditForm.controls["PrestamoPlantaId"].value ? this.PrestamosEditForm.controls["PrestamoPlantaId"].value : '',
      Numero: this.PrestamosEditForm.controls["NumeroDevoluciones"].value ? this.PrestamosEditForm.controls["NumeroDevoluciones"].value : '',
      DestinoDevolucionId: this.PrestamosEditForm.controls["DestinoDevolucionId"].value ? this.PrestamosEditForm.controls["DestinoDevolucionId"].value : '',
      BancoId: this.PrestamosEditForm.controls["BancoDevolucion"].value ? this.PrestamosEditForm.controls["BancoDevolucion"].value : '',
      MonedaId: this.PrestamosEditForm.controls["MonedaPrestamosDevoluciones"].value ? this.PrestamosEditForm.controls["MonedaPrestamosDevoluciones"].value : '',
      FechaInicio: this.PrestamosEditForm.controls["FechaInicioDevolucion"].value ? this.PrestamosEditForm.controls["FechaInicioDevolucion"].value : '',
      FechaFin: this.PrestamosEditForm.controls["FechaFinDevolucion"].value ? this.PrestamosEditForm.controls["FechaFinDevolucion"].value : '',
      EstadoId: this.PrestamosEditForm.controls["EstadoDevolucion"].value ? this.PrestamosEditForm.controls["EstadoDevolucion"].value : '',
      EmpresaId: this.vSessionUser.Result.Data.EmpresaId

    }

    //let json = JSON.stringify(request);
    return request;
  }

  Nuevo() {
    var Moneda = this.PrestamosEditForm.controls["MonedaPrestamos"].value;
    // this.router.navigate([`/planta/operaciones/ServicioPlanta-edit/${this.ServicioPlantaId}`]);
    //this.router.navigate(['/planta/operaciones/ServicioPlanta-edit']);

    this.router.navigate([`/planta/operaciones/serviciosdevoluciones-edit/${this.PrestamoPlantaId}/${Moneda}`]);
  }

  Save(): void {
    //  debugger
    if (!this.PrestamosEditForm.invalid) {
      const form = this;
      if (this.PrestamoPlantaId <= 0) {

        this.alertUtil.alertRegistro('Confirmación', '¿Está seguro de continuar con el registro?.', function (result) {
          if (result.isConfirmed) {
            form.RegistrarPrestamos();
          }
        });
      } else if (this.PrestamoPlantaId > 0) {

        this.alertUtil.alertRegistro('Confirmación', '¿Está seguro de continuar con la actualización?.', function (result) {
          if (result.isConfirmed) {
            form.ActualizarPrestamos();
          }
        });
      }
      /* else {
        this.alertUtil.alertWarning('ADVERTENCIA!', 'No pueden existir datos vacios en el detalle, por favor corregir.');
      }*/
    }
  }

  RegistrarPrestamos(): void {
    this.spinner.show();
    const request = this.GetRequest();
    this.ServiciosPrestamosService.Registrar(request)
      .subscribe((res: any) => {
        this.spinner.hide();
        if (res.Result.Success) {
          this.alertUtil.alertOkCallback("CONFIRMACIÓN!",
            "Se registro correctamente el servicio prestamo.",
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

  ActualizarPrestamos() {
    this.spinner.show();
    const request = this.GetRequest();
    this.ServiciosPrestamosService.Actualizar(request)
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            var form = this;
            this.alertUtil.alertOkCallback('Actualizado!', 'Servicio Prestamo Actualizado.', function (result) {
              form.router.navigate(['/planta/operaciones/serviciosprestamos-list']);
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
      this.PrestamosEditForm.patchValue({ file: file });
    }
    this.PrestamosEditForm.get('file').updateValueAndValidity();
  }

  async ConsultaPorId(PrestamoPlantaId) {
    this.spinner.show();

    let request =
    {
      "PrestamoPlantaId": Number(PrestamoPlantaId),
    }

    this.ServiciosPrestamosService.ConsultarPorId(request)
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

  singleSelectCheck(row: any) {
    return this.selected.indexOf(row) === -1;
  }

  async AutocompleteFormEdit(data: any) {
    if (data) {

      this.PrestamosEditForm.controls.FechaRegistro.setValue(data.FechaRegistro == null ? "" : formatDate(data.FechaRegistro, 'yyyy-MM-dd', 'en'));
      //this.PrestamosEditForm.controls.DevolucionPrestamoPlantaId.setValue(data.DevolucionPrestamoPlantaId);
      ////////////////////campos para eñ formulario de prestamos y devoluciones///////////////////////////
      this.PrestamosEditForm.controls.PrestamoPlantaId.setValue(data.PrestamoPlantaId);
      this.PrestamosEditForm.controls.NumeroPrestamo.setValue(data.Numero);
      this.PrestamosEditForm.controls.DetallePrestamo.setValue(data.DetallePrestamo);
      //this.PrestamosEditForm.controls.FondoPrestamo.setValue(data.FondoPrestamoId);
      await this.GetlistTipoEstadoFondos();
      this.PrestamosEditForm.controls["FondoPrestamo"].setValue(data.FondoPrestamoId);
      //this.PrestamosEditForm.controls.MonedaPrestamos.setValue(data.MonedaId);
      await this.GetListaTipoMonedaPrestamo();
      this.PrestamosEditForm.controls["MonedaPrestamos"].setValue(data.MonedaId);
      this.PrestamosEditForm.controls.ImportePrestamo.setValue(data.Importe);
      this.PrestamosEditForm.controls.ImporteDevolucion.setValue(data.ImporteProcesado);
      this.PrestamosEditForm.controls.SaldoPrestamo.setValue(data.Saldo);
      this.PrestamosEditForm.controls.ImporteCambio.setValue(data.ImporteCambio);
      this.PrestamosEditForm.controls.ObservacionesPrestamo.setValue(data.Observaciones);
      this.PrestamosEditForm.controls.ObservacionAnulacion.setValue(data.ObservacionAnulacion);

      this.PrestamosEditForm.controls.EstadoPrestamo.setValue(data.EstadoId);
      this.PrestamosEditForm.controls.FechaPrestamo.setValue(data.FechaRegistro == null ? "" : formatDate(data.FechaRegistro, 'yyyy-MM-dd', 'en'));
      /////////////////////Campos de devoluciones //////////////////////////////
      // this.PrestamosEditForm.controls.MonedaPrestamosDevoluciones.setValue(data.MonedaId);

    }
    this.spinner.hide();
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
        link.href = `${host}OrdenProcesoPlanta/GenerarPDFOrdenProceso?id=${form.PrestamoPlantaId}&empresaId=${this.vSessionUser.Result.Data.EmpresaId}`;
        link.target = "_blank";
        link.click();
        link.remove();
      }
    });
  }

  Cancel(): void {
    this.router.navigate(['/planta/operaciones/prestamos-list']);
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