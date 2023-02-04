import { Component, OnInit, ViewEncapsulation, Input, EventEmitter, ViewChild, Output } from '@angular/core';
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
import { PagoServicioPlantaService } from '../../../../../../../Services/PagoServiciosPlanta.service';
import { NotaIngresoService } from '../../../../../../../services/notaingreso.service';
import { ControlCalidadService } from '../../../../../../../Services/control-calidad.service';
import { DevolucionPrestamoService } from '../../../../../../../Services/ServiciosDevoluciones.services';
import { host } from '../../../../../../../shared/hosts/main.host';
import { formatDate } from '@angular/common';
import { ServicioPlantaService } from '../../../../../../../Services/ServicioPlanta.services';
import { AuthService } from '../../../../../../../services/auth.service';
import { number } from 'ngx-custom-validators/src/app/number/validator';
import { sum } from 'chartist';

@Component({
  selector: 'app-anularPrestamo-edit',
  templateUrl: './anularPrestamo-edit.component.html',
  styleUrls: ['./anularPrestamo-edit.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AnularPrestamoeditComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private modalService: NgbModal,
    private dateUtil: DateUtil,
    private maestroService: MaestroService,
    private DevolucionPrestamoService: DevolucionPrestamoService,
    private ordenProcesoService: OrdenProcesoService,
    private ordenProcesoServicePlanta: OrdenProcesoServicePlanta,
    private PagoServicioPlantaService: PagoServicioPlantaService,
    private route: ActivatedRoute,
    private router: Router,
    private ServicioPlantaService: ServicioPlantaService,
    private spinner: NgxSpinnerService,
    private alertUtil: AlertUtil,
    private notaIngresoService: NotaIngresoService,
    private controlCalidad: ControlCalidadService,
    private authService: AuthService) { }


  error: any = { isError: false, errorMessage: '' };
  errorFecha: any = { isError: false, errorMessage: '' };
  AnularPrestamoEditForm: FormGroup;
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
  vSessionUser: any;
  errorGeneral: any = { isError: false, errorMessage: '' };
  mensajeErrorGenerico = "Ocurrio un error interno.";
  PrestamoPlantaId: Number;
  DevolucionPrestamoPlantaId: Number;
  //PagoServicioPlantaId:Number;

  // errorGeneral = { isError: false, msgError: '' };
  msgErrorGenerico = 'Ocurrio un error interno.';
  rowsDetails = [];
  rows = [];
  tempData = [];
  //selected = [];

  Moneda: string;
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
    this.DevolucionPrestamoPlantaId = this.route.snapshot.params.DevolucionPrestamoPlantaId ? Number(this.route.snapshot.params.DevolucionPrestamoPlantaId) : 0;
    this.PrestamoPlantaId = this.route.snapshot.params['id'] ? Number(this.route.snapshot.params['id']) : 0;
    //this.Moneda = this.route.snapshot.params.Moneda ? Number(this.route.snapshot.params.Moneda) : 0;
    await this.LoadForm();
    if (this.DevolucionPrestamoPlantaId <= 0) {
      //this.AnularPrestamoEditForm.controls.fechaCabe.setValue(this.dateUtil.currentDate());
    } else if (this.DevolucionPrestamoPlantaId > 0) {
      this.ConsultaPorId(this.DevolucionPrestamoPlantaId);
    }

    //this.readonly = this.authService.esReadOnly(this.vSessionUser.Result.Data.OpcionesEscritura, this.AnularPrestamoEditForm.controls.MonedaPagos);

  }


  LoadForm(): void {
    this.AnularPrestamoEditForm = this.fb.group({


      /////DATOS PARA EL APIC CONSULTAR DEVOLUCIONES 
      PrestamoPlantaId: ['', ''],
      DevolucionPrestamoPlantaId: ['', ''],
      NumeroDevoluciones: ['', ''],
      DestinoDevolucionId: ['', ''],
      BancoDevolucion: ['', ''],
      MonedaPrestamosDevoluciones: ['', ''],
      FechaInicioDevolucion: ['', ''],
      FechaFinDevolucion: ['', ''],
      EstadoDevolucion: ['', ''],
      EmpresaId: ['', ''],
      ObservacionAnulacion: ['', ''],
      ObservacionesPrestamo: ['', ''],
      Importe: ['', '']



    });
    this.AnularPrestamoEditForm.controls.estado.disable();
  }

  get f() {
    return this.AnularPrestamoEditForm.controls;
  }


  buscar(): void {
    this.Search();
  }

  Search(): void {
    if (!this.AnularPrestamoEditForm.invalid) {
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

    const form = this.AnularPrestamoEditForm.value;

    const request =
    {
      // PrestamoPlantaId:    Number(this.PrestamoPlantaId),
      PrestamoPlantaId: this.AnularPrestamoEditForm.controls["PrestamoPlantaId"].value ? this.AnularPrestamoEditForm.controls["PrestamoPlantaId"].value : '',
      Numero: this.AnularPrestamoEditForm.controls["NumeroDevoluciones"].value ? this.AnularPrestamoEditForm.controls["NumeroDevoluciones"].value : '',
      DestinoDevolucionId: this.AnularPrestamoEditForm.controls["DestinoDevolucionId"].value ? this.AnularPrestamoEditForm.controls["DestinoDevolucionId"].value : '',
      BancoId: this.AnularPrestamoEditForm.controls["BancoDevolucion"].value ? this.AnularPrestamoEditForm.controls["BancoDevolucion"].value : '',
      MonedaId: this.AnularPrestamoEditForm.controls["MonedaPrestamosDevoluciones"].value ? this.AnularPrestamoEditForm.controls["MonedaPrestamosDevoluciones"].value : '',
      FechaInicio: this.AnularPrestamoEditForm.controls["FechaInicioDevolucion"].value ? this.AnularPrestamoEditForm.controls["FechaInicioDevolucion"].value : '',
      FechaFin: this.AnularPrestamoEditForm.controls["FechaFinDevolucion"].value ? this.AnularPrestamoEditForm.controls["FechaFinDevolucion"].value : '',
      EstadoId: this.AnularPrestamoEditForm.controls["EstadoDevolucion"].value ? this.AnularPrestamoEditForm.controls["EstadoDevolucion"].value : '',
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
          form.anularDevolucion();
        }
        else {
          this.alertUtil.alertError("Error", "Solo se puede Anular en estado Registrados")
        }
      });

      // } 
    }
  }

  anularDevolucion(){
    this.spinner.show(),
      {
        type: 'ball-triangle-path',
        size: 'medium',
        bdColor: 'rgba(0, 0, 0, 0.8)',
        color: '#fff',
        fullScreen: true
      };
      this.DevolucionPrestamoService.Anular(
      {
        "PrestamoPlantaId": this.selected[0].PrestamoPlantaId,
        "DevolucionPrestamoPlantaId":this.selected[0].DevolucionPrestamoPlantaId,
        "Importe":this.selected[0].Importe,
        "Usuario": this.vSessionUser.Result.Data.NombreUsuario,
        "ObservacionAnulacion":this.AnularPrestamoEditForm.controls.ObservacionAnulacion.value
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


      this.AnularPrestamoEditForm.controls.PrestamoPlantaId.setValue(data.PrestamoPlantaId);
      this.AnularPrestamoEditForm.controls.DevolucionPrestamoPlantaId.setValue(data.DevolucionPrestamoPlantaId);
      this.AnularPrestamoEditForm.controls.Importe.setValue(data.Importe);
      this.AnularPrestamoEditForm.controls.ObservacionesPrestamo.setValue(data.Observaciones);
      this.AnularPrestamoEditForm.controls.ObservacionAnulacion.setValue(data.ObservacionAnulacion);
      this.AnularPrestamoEditForm.controls.NumeroDevoluciones.setValue(data.Numero);
      this.AnularPrestamoEditForm.controls.DestinoDevolucionId.setValue(data.DestinoDevolucionId);
      this.AnularPrestamoEditForm.controls.BancoDevolucion.setValue(data.BancoId);
      this.AnularPrestamoEditForm.controls.MonedaPrestamosDevoluciones.setValue(data.MonedaId);
      this.AnularPrestamoEditForm.controls.FechaInicioDevolucion.setValue(data.FechaInicio);
      this.AnularPrestamoEditForm.controls.FechaFinDevolucion.setValue(data.FechaFin);
      this.AnularPrestamoEditForm.controls.EstadoDevolucion.setValue(data.EstadoId);


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