import { Component, OnInit, ViewEncapsulation, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn, FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router, ActivatedRoute } from '@angular/router';
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { AlertUtil } from '../../../../../../services/util/alert-util';
import swal from 'sweetalert2';
import { PagoServicioPlantaService } from '../../../../../../Services/PagoServiciosPlanta.service';
import { DateUtil } from '../../../../../../services/util/date-util';
import { OrdenProcesoServicePlanta } from '../../../../../../Services/orden-proceso-planta.service';
import { ServicioPlantaService } from '../../../../../../Services/ServicioPlanta.services';
import { ServiciosPrestamosService } from '../../../../../../Services/ServiciosPrestamos.services';
import { MaestroService } from '../../../../../../services/maestro.service';
import { AuthService } from '../../../../../../services/auth.service';

@Component({
  selector: 'app-prestamos-list',
  templateUrl: './prestamos-list.component.html',
  styleUrls: ['./prestamos-list.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PrestamosListComponent implements OnInit {

  constructor(private fb: FormBuilder, private dateUtil: DateUtil,
    private OrdenProcesoServicePlanta: OrdenProcesoServicePlanta,
    private alertUtil: AlertUtil,
    private ServicioPlantaService: ServicioPlantaService,
    private ServiciosPrestamosService: ServiciosPrestamosService,
    private spinner: NgxSpinnerService,
    private PagoServicioPlantaService: PagoServicioPlantaService,
    private maestroService: MaestroService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService) { }

  @ViewChild(DatatableComponent) table: DatatableComponent;

  listEstado: [] = [];
  selectedEstado: any;
  listTipoServicio: [] = [];
  selectedTipoServicio: any;
  listaCampania: any[];
  selectedCampania: any;
  listTipoMoneda: [] = [];
  SelectedTipoMoneda: any;

  listTipoComprobante: [] = [];
  selectedTipoComprobante: any;

  listTipoMonedaPrestamos: [] = [];
  SelectedTipoMonedaPrestamos: any;

  listTipoEstadoPrestamo: [] = [];
  selectedTipoEstadoPrestamo: any;

  listTipoEstadoDevolucion: [] = [];
  selectedTipoEstadoDevolucion: any;

  listTipoEstadoFondos: [] = [];
  selectedTipoEstadoFondos: any;



  vSessionUser: any;
  selected = [];
  limitRef: number = 10;
  rows = [];
  tempData = [];
  mensajeErrorGenerico = "Ocurrio un error interno.";
  errorGeneral: any = { isError: false, errorMessage: '' };
  msgErrorGenerico = 'Ocurrio un error interno.';
  error: any = { isError: false, errorMessage: '' };
  errorFecha: any = { isError: false, errorMessage: '' };
  submitted = false;
  submittedPrestamoEdit = false;
  estadoDeuda = "01";
  estadoCancelado = "02";
  estadoAnulado = "00";
  Prestamosform: FormGroup;
  // MonedaId: Number;
  @Output() seleccionarEvent = new EventEmitter<any>();
  @Input() popUp = false;
  page: any;
  readonly: boolean;

  ngOnInit(): void {
    this.vSessionUser = JSON.parse(localStorage.getItem('user'));
    this.LoadForm();
    this.LoadCombos();
    //this.cargaCampania();
    this.GetListaTipoMonedaPrestamos();
    //this.Serviciosform.controls['FechaFin'].setValue(this.dateUtil.currentDate());
    // this.Serviciosform.controls['FechaInicio'].setValue(this.dateUtil.currentMonthAgo());
    this.Prestamosform.controls['FechaFinPrestamo'].setValue(this.dateUtil.currentDate());
    this.Prestamosform.controls['FechaInicioPrestamo'].setValue(this.dateUtil.currentMonthAgo());
    //this.Serviciosform.controls.MonedaId.setValue(this.vSessionUser.Result.Data.MonedaId);
    this.page = this.route.routeConfig.data.title;
    this.readonly = this.authService.esReadOnly(this.vSessionUser.Result.Data.OpcionesEscritura);
  }

  LoadForm(): void {
    this.Prestamosform = this.fb.group({
      Numero: ['', ''],
      Moneda: ['', ''],
      MonedaId: ['', ''],
      Importe: ['', ''],
      TotalImporte: ['', ''],
      TotalImporteProcesado: ['', ''],
      FechaRegistro: ['', ''],
      rucOrganizacion: ['', ''],
      RazonSocialEmpresaCliente: ['', ''],
      estado: ['', ''],
      Estado: ['', ''],
      ///////////////Prestamos Y Devoluciones ////////////////////
      FechaPrestamo: ['', ''],
      DetalleServicioPrestamos: ['', ''],
      ImportePrestamo: ['', ''],
      EstadoPrestamo: ['', ''],
      FondoPrestamo: ['', ''],
      ObservacionesPrestamo: ['', ''],
      ObservacionAnulacion: ['', ''],
      SaldoPrestamo: ['', ''],
      NumeroPrestamo: ['', ''],
      FechaInicioPrestamo: ['', ''],
      FechaFinPrestamo: ['', ''],
      MonedaPrestamos: ['', '']
    });
    // this.ordenProcesoform.setValidators(this.comparisonValidator())
  }

  public comparisonValidator(): ValidatorFn {
    return (group: FormGroup): ValidationErrors => {
      if (!group.value.fechaInicio || !group.value.fechaFin) {
        this.errorGeneral = { isError: true, errorMessage: 'Por favor seleccionar ambas fechas.' };
      } else if (!group.controls["estado"].value) {
        this.errorGeneral = { isError: true, errorMessage: 'Por favor seleccionar un estado.' };
      } else {
        this.errorGeneral = { isError: false, errorMessage: '' };
      }
      return;
    };
  }
  get f() {
    return this.Prestamosform.controls;
  }


  LoadCombos(): void {
    this.GetlistTipoEstadoPrestamo();
    this.GetlistTipoEstadoFondos();
    //  this.GetListTipoServicio();
    // this.GetListTipoComprobante();
  }



  async GetlistTipoEstadoPrestamo() {
    const res = await this.maestroService.obtenerMaestros('EstadoPrestamoPlanta').toPromise();
    if (res.Result.Success) {
      this.listTipoEstadoPrestamo = res.Result.Data;
    }
  }


  async GetlistTipoEstadoFondos() {
    const res = await this.maestroService.obtenerMaestros('FondoPrestamo').toPromise();
    if (res.Result.Success) {
      this.listTipoEstadoFondos = res.Result.Data;
    }
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


  Buscar(): void {
    this.Search();
  }

  Search(): void {
    if (!this.Prestamosform.invalid) {
      this.spinner.show(undefined,
        {
          type: 'ball-triangle-path',
          size: 'medium',
          bdColor: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          fullScreen: true
        });
      const request = this.getRequest();
      this.ServiciosPrestamosService.Consultar(request).subscribe((res: any) => {
        this.spinner.hide();
        if (res.Result.Success) {
          res.Result.Data.forEach(x => {
            //x.FechaInicioProceso = this.dateUtil.formatDate(x.FechaInicioProceso)
            //x.FechaRegistro =  this.dateUtil.formatDate(x.FechaRegistro);
            //x.FechaFinProceso =  this.dateUtil.formatDate(x.FechaFinProceso);
            x.FechaRegistro = this.dateUtil.formatDate(x.FechaRegistro);
            x.FechaComprobante = this.dateUtil.formatDate(x.FechaComprobante);
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

  getRequest(): any {

    return {


      Numero: this.Prestamosform.controls["NumeroPrestamo"].value ? this.Prestamosform.controls["NumeroPrestamo"].value : '',
      FondoPrestamoId: this.Prestamosform.controls["FondoPrestamo"].value ? this.Prestamosform.controls["FondoPrestamo"].value : '',
      MonedaId: this.Prestamosform.controls["MonedaPrestamos"].value ? this.Prestamosform.controls["MonedaPrestamos"].value : '',
      EstadoId: this.Prestamosform.controls["EstadoPrestamo"].value ? this.Prestamosform.controls["EstadoPrestamo"].value : '',
      FechaInicio: this.Prestamosform.controls["FechaInicioPrestamo"].value ? this.Prestamosform.controls["FechaInicioPrestamo"].value : '',
      FechaFin: this.Prestamosform.controls["FechaFinPrestamo"].value ? this.Prestamosform.controls["FechaFinPrestamo"].value : '',
      EmpresaId: this.vSessionUser.Result.Data.EmpresaId


    };
  }


  anular(){
    if (this.selected.length > 0) 
    {
     if (this.selected[0].EstadoId == this.estadoCancelado)
     {
      this.alertUtil.alertWarning("Advertencia"," No se puede anular un Prestamo en estado Cancelado.");
      return;
     }

     if (this.selected[0].EstadoId == this.estadoAnulado)
     {
      this.alertUtil.alertWarning("Advertencia","No se puede anular un Prestamo en estado Anulado");
      return;
     }

    if(this.selected[0].EstadoId == this.estadoDeuda && this.selected[0].TotalImporteProcesado>0)
    {
      
      this.alertUtil.alertWarning("Advertencia","No se puede anular un Prestamo que tienen Asociados");
      return;
    }
   // if (this.selected[0].EstadoId == this.selected[0].estadoAnulado) {
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
        form.AnularPrestamo();
      }
    });
  }     
   

}

  AnularPrestamo() {
    this.spinner.show(undefined,
      {
        type: 'ball-triangle-path',
        size: 'medium',
        bdColor: 'rgba(0, 0, 0, 0.8)',
        color: '#fff',
        fullScreen: true
      });
    this.ServiciosPrestamosService.Anular(
      {
        "PrestamoPlantaId": this.selected[0].PrestamoPlantaId,
        "Importe": this.selected[0].Importe,
        "Usuario": this.vSessionUser.Result.Data.NombreUsuario,
      })
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            this.alertUtil.alertOk('Anulado!', 'Servicio Planta.');
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




  compareTwoDates() {
    /*
    var anioFechaInicio = new Date(this.ordenProcesoform.controls['fechaInicio'].value).getFullYear()
    var anioFechaFin = new Date(this.ordenProcesoform.controls['fechaFin'].value).getFullYear()

    if (new Date(this.ordenProcesoform.controls['fechaFin'].value) < new Date(this.ordenProcesoform.controls['fechaInicio'].value)) {
      this.error = { isError: true, errorMessage: 'La fecha fin no puede ser anterior a la fecha inicio' };
      this.ordenProcesoform.controls['fechaFin'].setErrors({ isError: true })
    } else if (this.dateUtil.restarAnio(anioFechaInicio, anioFechaFin) > 2) {
      this.error = { isError: true, errorMessage: 'El Rango de fechas no puede ser mayor a 2 años' };
      this.ordenProcesoform.controls['fechaFin'].setErrors({ isError: true })
    } else {
      this.error = { isError: false, errorMessage: '' };
    }
    */
  }


  compareFechas() {
    /*
    var anioFechaInicio = new Date(this.ordenProcesoform.controls['fechaInicio'].value).getFullYear()
    var anioFechaFin = new Date(this.ordenProcesoform.controls['fechaFin'].value).getFullYear()
    if (new Date(this.ordenProcesoform.controls['fechaInicio'].value) > new Date(this.ordenProcesoform.controls['fechaFin'].value)) {
      this.errorFecha = { isError: true, errorMessage: 'La fecha inicio no puede ser mayor a la fecha fin' };
      this.ordenProcesoform.controls['fechaInicio'].setErrors({ isError: true })
    } else if (this.dateUtil.restarAnio(anioFechaInicio, anioFechaFin) > 2) {
      this.errorFecha = { isError: true, errorMessage: 'El Rango de fechas no puede ser mayor a 2 años' };
      this.ordenProcesoform.controls['fechaInicio'].setErrors({ isError: true })
    } else {
      this.errorFecha = { isError: false, errorMessage: '' };
    }*/
  }
  async GetListaTipoMonedaPrestamos() {
    let res = await this.maestroService.obtenerMaestros('Moneda').toPromise();
    if (res.Result.Success) {
      this.listTipoMonedaPrestamos = res.Result.Data;
    }
  }

  Nuevo(): void {
    this.router.navigate(['/planta/operaciones/serviciosprestamos-edit']);
    // this.router.navigate([`/planta/operaciones/servicios-edit/${this.MonedaId}`]);
  }

  Seleccionar(selected) {
    this.seleccionarEvent.emit(selected)
  }
}