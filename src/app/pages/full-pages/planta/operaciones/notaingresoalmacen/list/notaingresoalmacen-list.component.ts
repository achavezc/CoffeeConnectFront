import { Component, OnInit, ViewChild, ViewEncapsulation, Input, EventEmitter, Output } from "@angular/core";
import { DatatableComponent, ColumnMode } from "@swimlane/ngx-datatable";
import { MaestroUtil } from '../../../../../../services/util/maestro-util';
import { DateUtil } from '../../../../../../services/util/date-util';
import { NotaIngresoAlmacenPlantaService } from '../../../../../../services/nota-ingreso-almacen-planta-service';
import { Observable } from 'rxjs';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ExcelService } from '../../../../../../shared/util/excel.service';
import { HeaderExcel } from '../../../../../../services/models/headerexcel.model';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from "@angular/router";
import {AuthService} from './../../../../../../services/auth.service';
import swal from 'sweetalert2';
import { AlertUtil } from '../../../../../../services/util/alert-util';

@Component({
  selector: "app-notaingresoalmacen-list",
  templateUrl: "./notaingresoalmacen-list.component.html",
  styleUrls: [
    "./notaingresoalmacen-list.component.scss",
    "/assets/sass/libs/datatables.scss",
  ],
  encapsulation: ViewEncapsulation.None
})

export class NotaIngresoAlmacenListComponent implements OnInit {

  @ViewChild('vform') validationForm: FormGroup;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  submitted = false;
  listaEstado: Observable<any[]>;
  listaMotivo: Observable<any[]>;
  listaProducto: Observable<any[]>;
  listaSubProducto: any[];
  listaCertificacion: Observable<any[]>;
  selectedEstado: any;
  selectedMotivo: any;
  selectedAlmacen: any;
  selectedProducto: any;
  selectedSubProducto: any;
  selectedCertificacion: any;
  notaIngresoAlmacenForm: FormGroup;
  error: any = { isError: false, errorMessage: '' };
  errorFecha: any = { isError: false, errorMessage: '' };
  errorGeneral: any = { isError: false, errorMessage: '' };
  selected = []
  mensajeErrorGenerico = "Ocurrio un error interno.";
  estadoPesado = "01";
  estadoAnalizado = "02";
  vSessionUser: any;
  listaAlmacen: Observable<any[]>;
  @Input() popUp = false;
  @Output() agregarEvent = new EventEmitter<any>();
  readonly: boolean;

  // row data
  public rows = [];
  public ColumnMode = ColumnMode;
  public limitRef = 10;

  // private
  private tempData = [];

  constructor(
    private router: Router,
    private maestroUtil: MaestroUtil,
    private dateUtil: DateUtil,
    private spinner: NgxSpinnerService,
    private notaIngresoAlmacenPlantaService: NotaIngresoAlmacenPlantaService,
    private authService : AuthService,
    private excelService: ExcelService,
    private alertUtil: AlertUtil
  ) {
    this.singleSelectCheck = this.singleSelectCheck.bind(this);
  }
  ngOnInit(): void {
    this.cargarForm();
    //this.cargarcombos();
    this.vSessionUser = JSON.parse(localStorage.getItem('user'));
    //this.notaIngresoAlmacenForm.controls['fechaFin'].setValue(this.dateUtil.currentDate());
    //this.notaIngresoAlmacenForm.controls['fechaInicio'].setValue(this.dateUtil.currentMonthAgo());

    this.notaIngresoAlmacenForm.controls.fechaInicio.setValue(this.dateUtil.currentMonthAgo());
    this.notaIngresoAlmacenForm.controls.fechaFin.setValue(this.dateUtil.currentDate());
    this.notaIngresoAlmacenForm.controls.fechaGuiaRemisionInicio.setValue(this.dateUtil.currentMonthAgo());
    this.notaIngresoAlmacenForm.controls.fechaGuiaRemisionFin.setValue(this.dateUtil.currentDate());

    this.readonly= this.authService.esReadOnly(this.vSessionUser.Result.Data.OpcionesEscritura);
  }
  compareTwoDates() {
    /*
    var anioFechaInicio = new Date(this.notaIngresoAlmacenForm.controls['fechaInicio'].value).getFullYear()
    var anioFechaFin = new Date(this.notaIngresoAlmacenForm.controls['fechaFin'].value).getFullYear()

    if (new Date(this.notaIngresoAlmacenForm.controls['fechaFin'].value) < new Date(this.notaIngresoAlmacenForm.controls['fechaInicio'].value)) {
      this.error = { isError: true, errorMessage: 'La fecha fin no puede ser anterior a la fecha inicio' };
      this.notaIngresoAlmacenForm.controls['fechaFin'].setErrors({ isError: true })
    } else if (this.dateUtil.restarAnio(anioFechaInicio, anioFechaFin) > 2) {
      this.error = { isError: true, errorMessage: 'El Rango de fechas no puede ser mayor a 2 años' };
      this.notaIngresoAlmacenForm.controls['fechaFin'].setErrors({ isError: true })
    } else {
      this.error = { isError: false, errorMessage: '' };
    }
  }*/
}
  get f() {
    return this.notaIngresoAlmacenForm.controls;
   
  }

  filterUpdate(event) {
    const val = event.target.value.toLowerCase();
    const temp = this.tempData.filter(function (d) {
      return d.Numero.toLowerCase().indexOf(val) !== -1 || !val;
    });
    this.rows = temp;
    this.table.offset = 0;
  }
  singleSelectCheck(row: any) {
    return this.selected.indexOf(row) === -1;
  }


  updateLimit(limit) {
    this.limitRef = limit.target.value;
  }

 async cargarForm() {
    this.notaIngresoAlmacenForm = new FormGroup(
      {
        numeroIngresoAlmacen: new FormControl('', []),
        numeroControlCalidad: new FormControl('', []),
        numeroNotaIngreso: new FormControl('', []),
        numeroGuiRemision: new FormControl('', []),
        fechaGuiaRemisionInicio: new FormControl('', []),
        fechaGuiaRemisionFin: new FormControl('', []),
        codigoOrganizacion: new FormControl('', []),
        motivo: new FormControl('', []),
        fechaInicio: new FormControl('', [Validators.required]),
        ruc: new FormControl('', [Validators.minLength(8), Validators.maxLength(20), Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$')]),
        rzsocial: new FormControl('', [Validators.minLength(5), Validators.maxLength(100)]),
        //estado: new FormControl('', [Validators.required]),
        estado: new FormControl('', []),
        fechaFin: new FormControl('', [Validators.required,]),
        producto: new FormControl('', []),
        almacen: new FormControl('', []),
        rendimientoInicio: new FormControl('', []),
        rendimientoFin: new FormControl('', []),
        puntajeFinalFin: new FormControl('', []),
        puntajeFinalInicio: new FormControl('', []),
        certificacion: new FormControl('', []),
        numeroIngresoPlanta: new FormControl('', []),
        subproducto: new FormControl('', [])
      });
      await this.cargarcombos()
    this.notaIngresoAlmacenForm.setValidators(this.comparisonValidator());
    
  }

  async cargarcombos() {
    var form = this;
    this.maestroUtil.obtenerMaestros("EstadoNotaIngresoAlmacenPlanta", function (res) {
      if (res.Result.Success) {
        form.listaEstado = res.Result.Data;
      }
    });
    this.maestroUtil.obtenerMaestros("ProductoPlanta", function (res) {
      if (res.Result.Success) {
        form.listaProducto = res.Result.Data;
      }
    });

    this.maestroUtil.obtenerMaestros("TipoCertificacionPlanta", function (res) {
      if (res.Result.Success) {
        form.listaCertificacion = res.Result.Data;
      }
    });
    this.maestroUtil.obtenerMaestros("AlmacenPlanta", function (res) {
      if (res.Result.Success) {
        form.listaAlmacen = res.Result.Data;
      }
    });
    this.maestroUtil.obtenerMaestros("MotivoIngresoPlanta", function (res) {
      if (res.Result.Success) {
        form.listaMotivo = res.Result.Data.filter(x => x.Codigo != '04');
      }
    });

    await this.LoadFormPopup();
  }


  anular() {
    if (this.selected.length > 0) {
    
      if (this.selected[0].EstadoId == '01' && this.selected[0].Cantidad == this.selected[0].CantidadDisponible) {
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
            form.anularNotaIngresoAlmacen();
          }
        });
      } 
    }
  }
  anularNotaIngresoAlmacen(){
    this.spinner.show(undefined,
      {
        type: 'ball-triangle-path',
        size: 'medium',
        bdColor: 'rgba(0, 0, 0, 0.8)',
        color: '#fff',
        fullScreen: true
      });
    this.notaIngresoAlmacenPlantaService.Anular(
      this.selected[0].NotaIngresoAlmacenPlantaId,
      this.vSessionUser.Result.Data.NombreUsuario
      )
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            this.alertUtil.alertOk('Anulado!', 'Nota de Ingreso Almacen Anulado.');
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
  }

  async LoadFormPopup() {
    if (this.popUp) {
      this.selectedEstado = '01';
      this.notaIngresoAlmacenForm.controls["estado"].setValue('01');
      this.notaIngresoAlmacenForm.controls.estado.disable();
    }
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

  nuevo() {
    this.router.navigate(['/planta/operaciones/notaingresoalmacen-edit']);
  }
  compareFechas() {
   /*
    var anioFechaInicio = new Date(this.notaIngresoAlmacenForm.controls['fechaInicio'].value).getFullYear()
    var anioFechaFin = new Date(this.notaIngresoAlmacenForm.controls['fechaFin'].value).getFullYear()
    if (new Date(this.notaIngresoAlmacenForm.controls['fechaInicio'].value) > new Date(this.notaIngresoAlmacenForm.controls['fechaFin'].value)) {
      this.errorFecha = { isError: true, errorMessage: 'La fecha inicio no puede ser mayor a la fecha fin' };
      this.notaIngresoAlmacenForm.controls['fechaInicio'].setErrors({ isError: true })
    } else if (this.dateUtil.restarAnio(anioFechaInicio, anioFechaFin) > 2) {
      this.errorFecha = { isError: true, errorMessage: 'El Rango de fechas no puede ser mayor a 2 años' };
      this.notaIngresoAlmacenForm.controls['fechaInicio'].setErrors({ isError: true })
    } else {
      this.errorFecha = { isError: false, errorMessage: '' };
    }*/
  }

  exportar() {
    this.buscar(true);
  }

  /*buscar() {
    if (this.notaIngresoAlmacenForm.invalid || this.errorGeneral.isError) {
      this.submitted = true;
      return;
    } else {

      this.submitted = false;
      var objRequest = {
        "Numero": this.notaIngresoAlmacenForm.controls['numeroIngresoAlmacen'].value,
        "NumeroNotaIngresoPlanta": this.notaIngresoAlmacenForm.controls['numeroNotaIngreso'].value,
        "NumeroControlCalidad": this.notaIngresoAlmacenForm.controls['numeroControlCalidad'].value,
        "NumeroGuiaRemision": this.notaIngresoAlmacenForm.controls['numeroGuiRemision'].value,
        "NumeroOrganizacion": this.notaIngresoAlmacenForm.controls['codigoOrganizacion'].value,
        "RazonSocialOrganizacion": this.notaIngresoAlmacenForm.controls['rzsocial'].value,
        "RucOrganizacion": this.notaIngresoAlmacenForm.controls['ruc'].value,
        "ProductoId": this.notaIngresoAlmacenForm.controls['producto'].value,
        "SubProductoId": this.notaIngresoAlmacenForm.controls['subproducto'].value,
        "EstadoId": this.notaIngresoAlmacenForm.controls['estado'].value,
        "FechaInicioGuiaRemision": this.notaIngresoAlmacenForm.controls['fechaGuiaRemisionInicio'].value,
        "FechaFinGuiaRemision": this.notaIngresoAlmacenForm.controls['fechaGuiaRemisionFin'].value,

        "FechaInicio": this.notaIngresoAlmacenForm.controls['fechaInicio'].value,
        "FechaFin": this.notaIngresoAlmacenForm.controls['fechaFin'].value,
        "AlmacenId": this.notaIngresoAlmacenForm.controls['almacen'].value,
        "RendimientoPorcentajeInicio": Number(this.notaIngresoAlmacenForm.controls['rendimientoInicio'].value),
        "RendimientoPorcentajeFin": Number(this.notaIngresoAlmacenForm.controls['rendimientoFin'].value),
        "PuntajeAnalisisSensorialInicio": Number(this.notaIngresoAlmacenForm.controls['puntajeFinalInicio'].value),
        "PuntajeAnalisisSensorialFin": Number(this.notaIngresoAlmacenForm.controls['puntajeFinalFin'].value),
        "CertificacionId": this.notaIngresoAlmacenForm.controls['certificacion'].value,
        "EmpresaId": this.vSessionUser.Result.Data.EmpresaId

      }
      this.spinner.show(undefined,
        {
          type: 'ball-triangle-path',
          size: 'medium',
          bdColor: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          fullScreen: true
        });
      this.notaIngresoAlmacenPlantaService.Consultar(objRequest)
        .subscribe(res => {
          this.spinner.hide();
          if (res.Result.Success) {
            if (res.Result.ErrCode == "") {
              res.Result.Data.forEach(obj => {
                var fecha = new Date(obj.FechaRegistro);
                obj.FechaRegistro = this.dateUtil.formatDate(fecha, "/");


                var fechaGuia = new Date(obj.FechaGuiaRemision);
                obj.FechaGuiaRemision = this.dateUtil.formatDate(fechaGuia, "/");

             

              });
              this.tempData = res.Result.Data;
              this.rows = [...this.tempData];
              this.selected = [];
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
  }*/



  
  buscar(exportExcel?: boolean) {
    if (this.notaIngresoAlmacenForm.invalid || this.errorGeneral.isError) {
      this.submitted = true;
      return;
    } else {
      //debugger
      this.submitted = false;
      var objRequest = {
        "Numero": this.notaIngresoAlmacenForm.controls['numeroIngresoAlmacen'].value,
        "NumeroNotaIngresoPlanta": this.notaIngresoAlmacenForm.controls['numeroNotaIngreso'].value,
        "NumeroControlCalidad": this.notaIngresoAlmacenForm.controls['numeroControlCalidad'].value,
        "NumeroGuiaRemision": this.notaIngresoAlmacenForm.controls['numeroGuiRemision'].value,
        "NumeroOrganizacion": this.notaIngresoAlmacenForm.controls['codigoOrganizacion'].value,
        "RazonSocialOrganizacion": this.notaIngresoAlmacenForm.controls['rzsocial'].value,
        "RucOrganizacion": this.notaIngresoAlmacenForm.controls['ruc'].value,
        "ProductoId": this.notaIngresoAlmacenForm.controls['producto'].value,
        "SubProductoId": this.notaIngresoAlmacenForm.controls['subproducto'].value,
        "EstadoId": this.notaIngresoAlmacenForm.controls['estado'].value,
        "FechaInicioGuiaRemision": this.notaIngresoAlmacenForm.controls['fechaGuiaRemisionInicio'].value,
        "FechaFinGuiaRemision": this.notaIngresoAlmacenForm.controls['fechaGuiaRemisionFin'].value,

        "FechaInicio": this.notaIngresoAlmacenForm.controls['fechaInicio'].value,
        "FechaFin": this.notaIngresoAlmacenForm.controls['fechaFin'].value,
        "AlmacenId": this.notaIngresoAlmacenForm.controls['almacen'].value,
        "RendimientoPorcentajeInicio": Number(this.notaIngresoAlmacenForm.controls['rendimientoInicio'].value),
        "RendimientoPorcentajeFin": Number(this.notaIngresoAlmacenForm.controls['rendimientoFin'].value),
        "PuntajeAnalisisSensorialInicio": Number(this.notaIngresoAlmacenForm.controls['puntajeFinalInicio'].value),
        "PuntajeAnalisisSensorialFin": Number(this.notaIngresoAlmacenForm.controls['puntajeFinalFin'].value),
        "CertificacionId": this.notaIngresoAlmacenForm.controls['certificacion'].value,
        "EmpresaId": this.vSessionUser.Result.Data.EmpresaId

      }
      this.spinner.show(undefined,
        {
          type: 'ball-triangle-path',
          size: 'medium',
          bdColor: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          fullScreen: true
        });
        this.notaIngresoAlmacenPlantaService.Consultar(objRequest)
        .subscribe(res => {
          this.spinner.hide();
          if (res.Result.Success) {
            if (res.Result.ErrCode == "") {
              res.Result.Data.forEach(obj => {
                var fecha = new Date(obj.FechaRegistro);
                obj.FechaRegistro = this.dateUtil.formatDate(fecha, "/");


                var fechaGuia = new Date(obj.FechaGuiaRemision);
                obj.FechaGuiaRemision = this.dateUtil.formatDate(fechaGuia, "/");

              });
              if (!exportExcel) {
              this.tempData = res.Result.Data;
              this.rows = [...this.tempData];
              this.selected = [];
            }  else {
              let vArrHeaderExcel: HeaderExcel[] = [
                //new HeaderExcel("N° Control Calidad", "center"),
                new HeaderExcel("N° Nota Ingreso a Almacen", "center"),
                new HeaderExcel("N° Control Calidad", "center"),
                new HeaderExcel("N° Nota Ingreso", "center"),
                new HeaderExcel("Nro Guia Remisión", "center"),

                new HeaderExcel("Fecha Guia Remision","center", "dd/mm/yyyy"),
                new HeaderExcel("Fecha Ingreso", "center", "dd/mm/yyyy"),
                new HeaderExcel("Razon Social","center"),
                new HeaderExcel("Tipo Producto", "center"),
                new HeaderExcel("Certificacion", "center"),
                new HeaderExcel("Estado de Humedad", "right"),
                new HeaderExcel("Motivo", "center"),

                new HeaderExcel("Cantidad Almacén", "center"),
                new HeaderExcel("Peso Bruto Almacén", "right"),
                new HeaderExcel("Tara Almacén", "right"),
                new HeaderExcel("Kilos Netos Almacén", "right"),


                new HeaderExcel("% Rendimiento", "right"),
                new HeaderExcel("% Humedad CC", "right"),
                new HeaderExcel("Puntaje Final", "right"),

                new HeaderExcel("Cantidad Orden Proceso", "right"),
                new HeaderExcel("Kilos Netos Orden Proceso", "right"),
                new HeaderExcel("Cantidad Disponible", "right"),
                new HeaderExcel("Kilos Netos Disponibles", "right"),
                new HeaderExcel("Estado", "center"),
                new HeaderExcel("Almacen","center")

              ];

              let vArrData: any[] = [];
              for (let i = 0; i < res.Result.Data.length; i++) {
                vArrData.push([
                  res.Result.Data[i].Numero,
                  res.Result.Data[i].NumeroCalidadPlanta,
                  res.Result.Data[i].NumeroNotaIngresoPlanta,

                  res.Result.Data[i].NumeroGuiaRemision,
                  res.Result.Data[i].FechaGuiaRemision,
                  res.Result.Data[i].FechaRegistro,

                  res.Result.Data[i].RazonSocialEmpresaOrigen,
                  res.Result.Data[i].Producto,
                  res.Result.Data[i].Certificacion,
                  res.Result.Data[i].SubProducto,
                  res.Result.Data[i].MotivoIngreso,
                  res.Result.Data[i].Cantidad,
                  res.Result.Data[i].PesoBruto,

                  res.Result.Data[i].Tara,
                  res.Result.Data[i].KilosNetos,
                  res.Result.Data[i].RendimientoPorcentaje,

                  res.Result.Data[i].HumedadPorcentajeAnalisisFisico,
                  res.Result.Data[i].PuntajeFinal,

                  res.Result.Data[i].CantidadOrdenProceso,
                  res.Result.Data[i].KilosNetosOrdenProceso,
                  res.Result.Data[i].CantidadDisponible,
                  res.Result.Data[i].KilosNetosDisponibles,
                  res.Result.Data[i].Estado,
                  res.Result.Data[i].Almacen
                ]);
              }
              this.excelService.ExportJSONAsExcel(vArrHeaderExcel, vArrData, 'NotaIngresoAlmacen');
            }
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
  }


  generarResumen()
   {

    debugger
    if (this.notaIngresoAlmacenForm.invalid || this.errorGeneral.isError) 
    {
      this.submitted = true;
      return;
    } 
    else 
    {
    
      this.submitted = false;
      var objRequest = {
        "Numero": this.notaIngresoAlmacenForm.controls['numeroIngresoAlmacen'].value,
        "NumeroNotaIngresoPlanta": this.notaIngresoAlmacenForm.controls['numeroNotaIngreso'].value,
        "NumeroControlCalidad": this.notaIngresoAlmacenForm.controls['numeroControlCalidad'].value,
        "NumeroGuiaRemision": this.notaIngresoAlmacenForm.controls['numeroGuiRemision'].value,
        "NumeroOrganizacion": this.notaIngresoAlmacenForm.controls['codigoOrganizacion'].value,
        "RazonSocialOrganizacion": this.notaIngresoAlmacenForm.controls['rzsocial'].value,
        "RucOrganizacion": this.notaIngresoAlmacenForm.controls['ruc'].value,
        "ProductoId": this.notaIngresoAlmacenForm.controls['producto'].value,
        "SubProductoId": this.notaIngresoAlmacenForm.controls['subproducto'].value,
        "EstadoId": "",
        "FechaInicioGuiaRemision": this.notaIngresoAlmacenForm.controls['fechaGuiaRemisionInicio'].value,
        "FechaFinGuiaRemision": this.notaIngresoAlmacenForm.controls['fechaGuiaRemisionFin'].value,
        "FechaInicio": this.notaIngresoAlmacenForm.controls['fechaInicio'].value,
        "FechaFin": this.notaIngresoAlmacenForm.controls['fechaFin'].value,
        "AlmacenId": this.notaIngresoAlmacenForm.controls['almacen'].value,
        "RendimientoPorcentajeInicio": Number(this.notaIngresoAlmacenForm.controls['rendimientoInicio'].value),
        "RendimientoPorcentajeFin": Number(this.notaIngresoAlmacenForm.controls['rendimientoFin'].value),
        "PuntajeAnalisisSensorialInicio": Number(this.notaIngresoAlmacenForm.controls['puntajeFinalInicio'].value),
        "PuntajeAnalisisSensorialFin": Number(this.notaIngresoAlmacenForm.controls['puntajeFinalFin'].value),
        "CertificacionId": this.notaIngresoAlmacenForm.controls['certificacion'].value,
        "EmpresaId": this.vSessionUser.Result.Data.EmpresaId

      }
      this.spinner.show(undefined,
        {
          type: 'ball-triangle-path',
          size: 'medium',
          bdColor: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          fullScreen: true
        });
        this.notaIngresoAlmacenPlantaService.Consultar(objRequest)
        .subscribe(res => {
          this.spinner.hide();
          if (res.Result.Success) 
          {
            if (res.Result.ErrCode == "") 
            {
              res.Result.Data.forEach(obj => {
                var fecha = new Date(obj.FechaRegistro);
                obj.FechaRegistro = this.dateUtil.formatDate(fecha, "/");


                var fechaGuia = new Date(obj.FechaGuiaRemision);
                obj.FechaGuiaRemision = this.dateUtil.formatDate(fechaGuia, "/");

              });
             
              let vArrHeaderExcel: HeaderExcel[] = [
                //new HeaderExcel("N° Control Calidad", "center"),
                new HeaderExcel("Cliente", "center"),
                new HeaderExcel("Producto", "center"),                
                new HeaderExcel("Sacos", "right"),
                new HeaderExcel("Kilos Netos", "right"),
                new HeaderExcel("% Rend", "right"),
                new HeaderExcel("Exp Sacos", "right"),
                new HeaderExcel("Sec (Sac 69)", "right")

              ];

              let vArrData: any[] = [];
              for (let i = 0; i < res.Result.Data.length; i++) 
              {
                if(res.Result.Data[i].EstadoId!='00')
                {
                  var expSacos69;
                  var secSacos69;
                  var porcentajeRendimiento = res.Result.Data[i].ExportablePorcentajeAnalisisFisico;
                  var porcentajeDecarte = res.Result.Data[i].DescartePorcentajeAnalisisFisico;
                  
                  if(porcentajeRendimiento)
                  {
                    expSacos69 =  (res.Result.Data[i].KilosNetos/(porcentajeRendimiento/100))/69;
                  }
                  if(porcentajeDecarte)
                  {
                    secSacos69 =  (res.Result.Data[i].KilosNetos/(porcentajeDecarte/100))/69;
                  }
                  
                  vArrData.push([
                    res.Result.Data[i].RazonSocialEmpresaOrigen,
                    res.Result.Data[i].Producto + ' - ' + res.Result.Data[i].SubProducto,
                    res.Result.Data[i].Cantidad,
                    res.Result.Data[i].KilosNetos,
                    porcentajeRendimiento,
                    expSacos69,
                    secSacos69
                  ]);
                }
              }
              this.excelService.ExportJSONAsExcel(vArrHeaderExcel, vArrData, 'ResumenCafe');
            
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
  }



  changeProduct(event: any): void {
    let form = this;
    if (event) {
      this.maestroUtil.obtenerMaestros("SubProductoPlanta", function (res) {
        if (res.Result.Success) {
          if (res.Result.Data.length > 0) {
            form.listaSubProducto = res.Result.Data.filter(x => x.Val1 == event.Codigo);
          } else {
            form.listaSubProducto = [];
          }
        }
      });
    } else {
      form.listaSubProducto = [];
    }
  }

  Agregar(selected: any) {
    this.agregarEvent.emit(selected)
  }
}