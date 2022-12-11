import { Component, OnInit, ViewChild, ViewEncapsulation, Input, EventEmitter, Output } from "@angular/core";
import { DatatableComponent, ColumnMode } from "@swimlane/ngx-datatable";
import { MaestroUtil } from '../../../../../../services/util/maestro-util';
import { DateUtil } from '../../../../../../services/util/date-util';
import { NotaIngresoAlmacenPlantaService } from '../../../../../../services/nota-ingreso-almacen-planta-service';
import{NotaIngresoProductoTerminadoAlmacenPlantaService}from'../../../../../../Services/nota-ingreso-producto.service';
import { HeaderExcel } from '../../../../../../services/models/headerexcel.model';
import { ExcelService } from '../../../../../../shared/util/excel.service';
import { Observable } from 'rxjs';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from "@angular/router";
import {AuthService} from './../../../../../../services/auth.service';

@Component({
  selector: "app-notaingresoproducto-list",
  templateUrl: "./notaingresoproducto-list.component.html",
  styleUrls: [
    "./notaingresoproducto-list.component.scss",
    "/assets/sass/libs/datatables.scss",
  ],
  encapsulation: ViewEncapsulation.None
})

export class NotaIngresoProductoTerminadoListComponent implements OnInit {

  @ViewChild('vform') validationForm: FormGroup;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  submitted = false;
  listaEstadoProducto: Observable<any[]>;
  listaMotivo: Observable<any[]>;
  listaProducto: Observable<any[]>;
  listaSubProducto: any[];
  listaCertificacion: Observable<any[]>;
  selectedEstadoProducto: any;
  selectedMotivo: any;
  selectedAlmacen: any;
  selectedProducto: any;
  selectedSubProducto: any;
  selectedCertificacion: any;
  notaIngresoProductoAlmacenForm: FormGroup;
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
    private excelService: ExcelService,
    private spinner: NgxSpinnerService,
    private notaIngresoAlmacenPlantaService: NotaIngresoAlmacenPlantaService,
    private NotaIngresoProductoTerminadoAlmacenPlantaService:NotaIngresoProductoTerminadoAlmacenPlantaService,
    private authService : AuthService
  ) {
    this.singleSelectCheck = this.singleSelectCheck.bind(this);
  }
  ngOnInit(): void {
    this.cargarForm();
    //this.cargarcombos();
    this.vSessionUser = JSON.parse(localStorage.getItem('user'));
    //this.notaIngresoAlmacenForm.controls['fechaFin'].setValue(this.dateUtil.currentDate());
    //this.notaIngresoAlmacenForm.controls['fechaInicio'].setValue(this.dateUtil.currentMonthAgo());

    this.notaIngresoProductoAlmacenForm.controls.fechaInicio.setValue(this.dateUtil.currentMonthAgo());
    this.notaIngresoProductoAlmacenForm.controls.fechaFin.setValue(this.dateUtil.currentDate());
    //this.notaIngresoProductoAlmacenForm.controls.fechaGuiaRemisionInicio.setValue(this.dateUtil.currentMonthAgo());
    //this.notaIngresoProductoAlmacenForm.controls.fechaGuiaRemisionFin.setValue(this.dateUtil.currentDate());

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
    return this.notaIngresoProductoAlmacenForm.controls;
   
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
    this.notaIngresoProductoAlmacenForm = new FormGroup(
      {

        Numero: new FormControl('', []),
        numeroIngresoAlmacen: new FormControl('', []),
        //numeroControlCalidad: new FormControl('', []),
        numeroNotaIngreso: new FormControl('', []),
        numeroGuiRemision: new FormControl('', []),
        fechaGuiaRemisionInicio: new FormControl('', []),
        fechaGuiaRemisionFin: new FormControl('', []),
        codigoOrganizacion: new FormControl('', []),
        motivo: new FormControl('', []),
        fechaInicio: new FormControl('', [Validators.required]),
        ruc: new FormControl('', [Validators.minLength(8), Validators.maxLength(20), Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$')]),
        rzsocial: new FormControl('', [Validators.minLength(5), Validators.maxLength(100)]),
        estado: new FormControl('', [Validators.required]),
        fechaFin: new FormControl('', [Validators.required,]),
        producto: new FormControl('', []),
        almacen: new FormControl('', []),
       // rendimientoInicio: new FormControl('', []),
       // rendimientoFin: new FormControl('', []),
       // puntajeFinalFin: new FormControl('', []),
       // puntajeFinalInicio: new FormControl('', []),
       // certificacion: new FormControl('', []),
        numeroIngresoPlanta: new FormControl('', []),
        subproducto: new FormControl('', [])




      });
      await this.cargarcombos()
    this.notaIngresoProductoAlmacenForm.setValidators(this.comparisonValidator());
    
  }

  async cargarcombos() {
    var form = this;
    this.maestroUtil.obtenerMaestros("EstadoNotaIngresoProductoTerminadoAlmacenPlanta", function (res) {
      if (res.Result.Success) {
        form.listaEstadoProducto = res.Result.Data;
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
        form.listaMotivo = res.Result.Data;
      }
    });

    await this.LoadFormPopup();
  }

  async LoadFormPopup() {
    if (this.popUp) {
      this.selectedEstadoProducto = '01';
      this.notaIngresoProductoAlmacenForm.controls["estado"].setValue('01');
      this.notaIngresoProductoAlmacenForm.controls.estado.disable();
     

      this.notaIngresoProductoAlmacenForm.controls["estado"].setValue('01');
      //this.selectedProducto = '02';
      //this.cargarProducto(this.selectedProducto);
      this.notaIngresoProductoAlmacenForm.controls.estado.disable();
      //this.notaIngresoProductoAlmacenForm.controls.producto.disable();


    }
  }

 cargarProducto(codigo:any)
  {
    
    this.maestroUtil.obtenerMaestros("SubProductoPlanta", function (res) 
    {
      if (res.Result.Success) {
        if (res.Result.Data.length > 0) {
          this.listaSubProducto = res.Result.Data.filter(x => x.Val1 == codigo);
        } else {
          this.listaSubProducto = [];
        }
      }
    });
   } 



   changeProduct(event: any): void 
   {   
   
    this.cargarProducto(event.Codigo);
   
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
    this.router.navigate(['/planta/operaciones/notaingresoproducto-edit']);
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

  Exportar() {
    this.buscar(true);
  }

  /*buscar() {
    if (this.notaIngresoProductoAlmacenForm.invalid || this.errorGeneral.isError) {
      this.submitted = true;
      return;
    } else {

      debugger
      var fechaGuiaRemisionInicio;

      if(this.notaIngresoProductoAlmacenForm.controls['fechaGuiaRemisionInicio'].value!='')
      {
        fechaGuiaRemisionInicio = this.notaIngresoProductoAlmacenForm.controls['fechaGuiaRemisionInicio'].value;
      }

      var fechaFinGuiaRemision;

      if(this.notaIngresoProductoAlmacenForm.controls['fechaGuiaRemisionFin'].value!='')
      {
        fechaFinGuiaRemision = this.notaIngresoProductoAlmacenForm.controls['fechaGuiaRemisionFin'].value;
      }
      

      this.submitted = false;
      var objRequest = {
        "Numero": this.notaIngresoProductoAlmacenForm.controls['Numero'].value,
        "NumeroNotaIngresoPlanta": this.notaIngresoProductoAlmacenForm.controls['numeroNotaIngreso'].value,
        "NumeroGuiaRemision": this.notaIngresoProductoAlmacenForm.controls['numeroGuiRemision'].value,
        "RazonSocialEmpresaOrigen": this.notaIngresoProductoAlmacenForm.controls['rzsocial'].value,
        "RucEmpresaOrigen": this.notaIngresoProductoAlmacenForm.controls['ruc'].value,
        "EstadoId": this.notaIngresoProductoAlmacenForm.controls['estado'].value,
        "FechaInicio": this.notaIngresoProductoAlmacenForm.controls['fechaInicio'].value,
        "FechaFin": this.notaIngresoProductoAlmacenForm.controls['fechaFin'].value,
        "ProductoId": this.notaIngresoProductoAlmacenForm.controls['producto'].value,
        "SubProductoId": this.notaIngresoProductoAlmacenForm.controls['subproducto'].value,
         "MotivoIngresoId":this.notaIngresoProductoAlmacenForm.controls['motivo'].value,
         "EmpresaId": this.vSessionUser.Result.Data.EmpresaId,
         "AlmacenId": this.notaIngresoProductoAlmacenForm.controls['almacen'].value,
        "FechaInicioGuiaRemision": fechaGuiaRemisionInicio,
        "FechaFinGuiaRemision": fechaFinGuiaRemision,
        
        //"NumeroControlCalidad": this.notaIngresoProductoAlmacenForm.controls['numeroControlCalidad'].value,
        // "NumeroOrganizacion": this.notaIngresoProductoAlmacenForm.controls['codigoOrganizacion'].value,
       // "RendimientoPorcentajeInicio": Number(this.notaIngresoProductoAlmacenForm.controls['rendimientoInicio'].value),
       // "RendimientoPorcentajeFin": Number(this.notaIngresoProductoAlmacenForm.controls['rendimientoFin'].value),
        //"PuntajeAnalisisSensorialInicio": Number(this.notaIngresoProductoAlmacenForm.controls['puntajeFinalInicio'].value),
       // "PuntajeAnalisisSensorialFin": Number(this.notaIngresoProductoAlmacenForm.controls['puntajeFinalFin'].value),
       // "CertificacionId": this.notaIngresoProductoAlmacenForm.controls['certificacion'].value,
       




      }
      this.spinner.show(undefined,
        {
          type: 'ball-triangle-path',
          size: 'medium',
          bdColor: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          fullScreen: true
        });

      


      this.NotaIngresoProductoTerminadoAlmacenPlantaService.Consultar(objRequest)
        .subscribe(res => {
          this.spinner.hide();
          if (res.Result.Success) {
            if (res.Result.ErrCode == "") {
              res.Result.Data.forEach(obj => 
                { 
                obj.FechaGuiaRemisionString = this.dateUtil.formatDate(obj.FechaGuiaRemision);
                obj.FechaRegistroString = this.dateUtil.formatDate(obj.FechaRegistro);

                var valorRoundedKilosNetos46 = Math.round((obj.KilosNetos46 + Number.EPSILON) * 100) / 100
                obj.KilosNetos46 = valorRoundedKilosNetos46

                var valorRoundedKilosNetos = Math.round((obj.KilosNetos + Number.EPSILON) * 100) / 100
                obj.KilosNetos = valorRoundedKilosNetos

                var valorRoundedKilosBrutos = Math.round((obj.KilosBrutos + Number.EPSILON) * 100) / 100
                obj.KilosBrutos = valorRoundedKilosBrutos



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
    if (this.notaIngresoProductoAlmacenForm.invalid || this.errorGeneral.isError) {
      this.submitted = true;
      return;
    } else { 
     // debugger
      var fechaGuiaRemisionInicio;

      if(this.notaIngresoProductoAlmacenForm.controls['fechaGuiaRemisionInicio'].value!='')
      {
        fechaGuiaRemisionInicio = this.notaIngresoProductoAlmacenForm.controls['fechaGuiaRemisionInicio'].value;
      }

      var fechaFinGuiaRemision;

      if(this.notaIngresoProductoAlmacenForm.controls['fechaGuiaRemisionFin'].value!='')
      {
        fechaFinGuiaRemision = this.notaIngresoProductoAlmacenForm.controls['fechaGuiaRemisionFin'].value;
      }
      

      this.submitted = false;
      var objRequest = {
        "Numero": this.notaIngresoProductoAlmacenForm.controls['Numero'].value,
        "NumeroNotaIngresoPlanta": this.notaIngresoProductoAlmacenForm.controls['numeroNotaIngreso'].value,
        "NumeroGuiaRemision": this.notaIngresoProductoAlmacenForm.controls['numeroGuiRemision'].value,
        "RazonSocialEmpresaOrigen": this.notaIngresoProductoAlmacenForm.controls['rzsocial'].value,
        "RucEmpresaOrigen": this.notaIngresoProductoAlmacenForm.controls['ruc'].value,
        "EstadoId": this.notaIngresoProductoAlmacenForm.controls['estado'].value,
        "FechaInicio": this.notaIngresoProductoAlmacenForm.controls['fechaInicio'].value,
        "FechaFin": this.notaIngresoProductoAlmacenForm.controls['fechaFin'].value,
        "ProductoId": this.notaIngresoProductoAlmacenForm.controls['producto'].value,
        "SubProductoId": this.notaIngresoProductoAlmacenForm.controls['subproducto'].value,
         "MotivoIngresoId":this.notaIngresoProductoAlmacenForm.controls['motivo'].value,
         "EmpresaId": this.vSessionUser.Result.Data.EmpresaId,
         "AlmacenId": this.notaIngresoProductoAlmacenForm.controls['almacen'].value,
        "FechaInicioGuiaRemision": fechaGuiaRemisionInicio,
        "FechaFinGuiaRemision": fechaFinGuiaRemision,

      }
      this.spinner.show(undefined,
        {
          type: 'ball-triangle-path',
          size: 'medium',
          bdColor: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          fullScreen: true
        });
        this.NotaIngresoProductoTerminadoAlmacenPlantaService.Consultar(objRequest)
        .subscribe(res => {
          this.spinner.hide();
          if (res.Result.Success) {
            if (res.Result.ErrCode == "") {
              res.Result.Data.forEach(obj => {
                obj.FechaGuiaRemisionString = this.dateUtil.formatDate(obj.FechaGuiaRemision, "/");
                obj.FechaRegistroString = this.dateUtil.formatDate(obj.FechaRegistro, "/");
                obj.FechaRegistro = this.dateUtil.formatDate(obj.FechaRegistro, "/");
                var valorRoundedKilosNetos46 = Math.round((obj.KilosNetos46 + Number.EPSILON) * 100) / 100
                obj.KilosNetos46 = valorRoundedKilosNetos46

                var valorRoundedKilosNetos = Math.round((obj.KilosNetos + Number.EPSILON) * 100) / 100
                obj.KilosNetos = valorRoundedKilosNetos

                var valorRoundedKilosBrutos = Math.round((obj.KilosBrutos + Number.EPSILON) * 100) / 100
                obj.KilosBrutos = valorRoundedKilosBrutos

              });
              if (!exportExcel) {
              this.tempData = res.Result.Data;
              this.rows = [...this.tempData];
              this.selected = [];
            }  else {
              let vArrHeaderExcel: HeaderExcel[] = [
                new HeaderExcel("Número", "center"),
                new HeaderExcel("Número Nota Ingreso Planta", "center"),
                new HeaderExcel("Nro Guia Remisión", "center"),
                new HeaderExcel("Fecha Guia Remision", "center", "dd/mm/yyyy"),
                new HeaderExcel("Fecha Registro", "center", "dd/mm/yyyy"),
                new HeaderExcel("Razon Social Empresa Origen","center"),
                new HeaderExcel("Producto", "center"),
                new HeaderExcel("Sub Producto", "center"),
                new HeaderExcel("Motivo Ingreso", "center"),
                new HeaderExcel("Cantidad", "center"),
                new HeaderExcel("KGN", "right"),
                new HeaderExcel("Kilos Brutos", "right"),
                new HeaderExcel("Kilos Netos", "right"),
                new HeaderExcel("Kilos Netos 46","right"),
                new HeaderExcel("Cantidad Salida Almacen", "center"),
                new HeaderExcel("Kilos Netos Salida Almacen", "center"),
                new HeaderExcel("Cantidad Disponible", "center"),
                new HeaderExcel("Kilos Netos Disponibles", "right"),
                new HeaderExcel("Almacen", "center"),
                new HeaderExcel("Estado", "center")
              ];

              let vArrData: any[] = [];
              for (let i = 0; i < res.Result.Data.length; i++) {
                vArrData.push([
                  res.Result.Data[i].Numero,
                  res.Result.Data[i].NumeroNotaIngresoPlanta,
                  res.Result.Data[i].NumeroGuiaRemision,
                  res.Result.Data[i].FechaGuiaRemisionString,
                  res.Result.Data[i].FechaRegistroString,
                  res.Result.Data[i].RazonSocialEmpresaOrigen,
                  res.Result.Data[i].Producto,
                  res.Result.Data[i].SubProducto,
                  res.Result.Data[i].MotivoIngreso,
                  res.Result.Data[i].Cantidad,
                  res.Result.Data[i].KGN,
                  res.Result.Data[i].KilosBrutos,
                  res.Result.Data[i].KilosNetos,
                  res.Result.Data[i].KilosNetos46,
                  res.Result.Data[i].CantidadSalidaAlmacen,
                  res.Result.Data[i].KilosNetosSalidaAlmacen,
                  res.Result.Data[i].CantidadDisponible,
                  res.Result.Data[i].KilosNetosDisponibles,
                  res.Result.Data[i].Almacen,
                  res.Result.Data[i].Estado
                ]);
              }
              this.excelService.ExportJSONAsExcel(vArrHeaderExcel, vArrData, 'NotaIngresoProductoTerminado ');
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

  Agregar(selected: any) {
    this.agregarEvent.emit(selected)
  }
}