import { Component, OnInit, ViewChild, ViewEncapsulation, Input, EventEmitter, Output } from "@angular/core";
import { DatatableComponent, ColumnMode } from "@swimlane/ngx-datatable";
import { MaestroUtil } from '../../../../../../services/util/maestro-util';
import { AlertUtil } from '../../../../../../services/util/alert-util';
import { DateUtil } from '../../../../../../services/util/date-util';
import { PlantaService } from '../../../../../../services/planta.service';
import { NotaIngresoAlmacenPlantaService } from '../../../../../../services/nota-ingreso-almacen-planta-service';
import { Observable } from 'rxjs';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";
import swal from 'sweetalert2';
import { ExcelService } from '../../../../../../shared/util/excel.service';
import { HeaderExcel } from '../../../../../../services/models/headerexcel.model';
import { Router,ActivatedRoute } from "@angular/router"
import { MaestroService } from '../../../../../../services/maestro.service';
import {AuthService} from './../../../../../../services/auth.service';

@Component({
  selector: "app-notaingreso-list",
  templateUrl: "./notaingreso-list.component.html",
  styleUrls: [
    "./notaingreso-list.component.scss",
    "/assets/sass/libs/datatables.scss",
  ],
  encapsulation: ViewEncapsulation.None
})
export class NotaIngresoListComponent implements OnInit {
  @ViewChild('vform') validationForm: FormGroup;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  submitted = false;
  listaEstado: Observable<any[]>;
  //variables nuevas
  listaCampania:Observable<any>[];
  listaConcepto:Observable<any>[];
  //variables nuevas
  listaTipoDocumento: Observable<any[]>;
  listaProducto: Observable<any[]>;
  listaSubProducto: Observable<any[]>;
  listaMotivo: Observable<any[]>;
  selectedTipoDocumento: any;
  selectedEstado: any;
  //variables nuevas
  selectedCampania:any;
  selectedConcepto:any;
  //variables nuevas
  selectedMotivo: any;
  selectedProducto: any;
  selectedSubProducto: any;
  consultaNotaIngresoPlantaForm: FormGroup;
  error: any = { isError: false, errorMessage: '' };
  errorFecha: any = { isError: false, errorMessage: '' };
  errorGeneral: any = { isError: false, errorMessage: '' };
  selected = []
  mensajeErrorGenerico = "Ocurrio un error interno.";
  estadoPesado = "01";
  estadoAnalizado = "02";
  vSessionUser: any;
  @Input() popUp = false;
  @Input() estadoPes = false;
  @Output() agregarEvent = new EventEmitter<any>();
  readonly: boolean;
  page: any;

  // row data
  public rows = [];
  public ColumnMode = ColumnMode;
  public limitRef = 10;

  // private
  private tempData = [];
  constructor(
    private router: Router,
    private maestroUtil: MaestroUtil,
    private alertUtil: AlertUtil,
    private dateUtil: DateUtil,
    private plantaService: PlantaService,
    private notaIngresoAlmacenPlantaService: NotaIngresoAlmacenPlantaService,
    private spinner: NgxSpinnerService,
    private maestroService: MaestroService,
    private excelService: ExcelService,
    private authService : AuthService,
    private route: ActivatedRoute) {
    this.singleSelectCheck = this.singleSelectCheck.bind(this);
  }
  ngOnInit(): void {
    
    this.cargarForm();
    this.buscar();
    this.consultaNotaIngresoPlantaForm.controls.fechaInicio.setValue(this.dateUtil.currentMonthAgo());
    this.consultaNotaIngresoPlantaForm.controls.fechaFin.setValue(this.dateUtil.currentDate());
    //this.consultaNotaIngresoPlantaForm.controls.fechaGuiaRemisionInicio.setValue(this.dateUtil.currentMonthAgo());
    //this.consultaNotaIngresoPlantaForm.controls.fechaGuiaRemisionFin.setValue(this.dateUtil.currentDate());
    this.vSessionUser = JSON.parse(localStorage.getItem("user"));
    this.readonly= this.authService.esReadOnly(this.vSessionUser.Result.Data.OpcionesEscritura);
    
  }

  get f() {
    return this.consultaNotaIngresoPlantaForm.controls;
  }

  filterUpdate(event) {
    /*
    const val = event.target.value.toLowerCase();
    const temp = this.tempData.filter(function (d) {
      return d.Numero.toLowerCase().indexOf(val) !== -1 || !val;
    });
    this.rows = temp;
    this.table.offset = 0;
    */
  }
  singleSelectCheck(row: any) {
    return this.selected.indexOf(row) === -1;
  }


  updateLimit(limit) {
    this.limitRef = limit.target.value;
  }

  async cargarForm() {
    this.consultaNotaIngresoPlantaForm = new FormGroup(
      {
        notaIngreso: new FormControl('', [Validators.minLength(1), Validators.maxLength(20) ]),
        codigoOrganizacion: new FormControl('', []),
        numeroGuiaRemision: new FormControl('', [Validators.minLength(1), Validators.maxLength(100)]),
        fechaInicio: new FormControl('', [Validators.required]),
        fechaFin: new FormControl('', [Validators.required,]),
        organizacion: new FormControl('', [Validators.minLength(1), Validators.maxLength(100)]),
        ruc: new FormControl('', []),
        tipoProducto: new FormControl('', []),
        subProducto: new FormControl('', []),
        estado: new FormControl('', [Validators.required]),
        //campos agregados
        Campania: new FormControl('',[]),
        Concepto:new FormControl('',[]),
        //campos agregados 
        motivo: new FormControl('', []),
        fechaGuiaRemisionInicio: new FormControl('', []),
        fechaGuiaRemisionFin: new FormControl('', [])
      });
    this.consultaNotaIngresoPlantaForm.setValidators(this.comparisonValidator())

    await this.cargarcombos()
  }

  async LoadFormPopup() {
    this.page = this.route.routeConfig.data.title;
    if (this.popUp) {
      switch (this.page) {
        case "AnticiposList":
          this.selectedEstado = '02';
          //this.selectedCampaña=
          this.consultaNotaIngresoPlantaForm.controls['motivo'].disable();
          this.selectedMotivo = "01";
          
          break;
        case "ControlCalidadPlantaEdit":
          this.selectedEstado = '01';
          this.selectedProducto = '01';
          
          break;
        default:
          this.selectedEstado = '03';
          break;
      }
      this.consultaNotaIngresoPlantaForm.controls['estado'].disable();
      this.consultaNotaIngresoPlantaForm.controls['tipoProducto'].disable();
      
    }
  }

  async cargarcombos() {
    var form = this;
    this.maestroUtil.obtenerMaestros("ProductoPlanta", function (res) 
    {
      if (res.Result.Success) {
        form.listaProducto = res.Result.Data;
        /*if (form.popUp) {
          form.consultaNotaIngresoPlantaForm.controls.estado.setValue("03");
          form.consultaNotaIngresoPlantaForm.controls.estado.disable();
          form.consultaNotaIngresoPlantaForm.setValidators(this.comparisonValidator())
        }*/
      }
    });


    this.maestroUtil.obtenerMaestros("EstadoNotaIngresoPlanta", function (res) {
      if (res.Result.Success) {
        form.listaEstado = res.Result.Data;
      }
    });

    this.maestroUtil.obtenerMaestros("MotivoIngresoPlanta", function (res) {
      if (res.Result.Success) {
        form.listaMotivo = res.Result.Data.filter(x => x.Val1  == 'S');

       

      }
    });
     this.cargaCampania();
     //this.cargaConceptos();
    await this.LoadFormPopup();
  }

  async cargaCampania() 
  {

    var data = await this.maestroService.ConsultarCampanias("01").toPromise();
    if (data.Result.Success) {
      this.listaCampania = data.Result.Data;
    }

  }
    
  GetListConceptos(event: any): void {
    this.cargaConceptos(event.Codigo);
  }
  async cargaConceptos(codigo: any) {

    var data = await this.maestroService.ConsultarConceptos("01").toPromise();
    if (data.Result.Success) {
     // this.listaConcepto = data.Result.Data;
      this.listaConcepto = data.Result.Data.filter(obj => obj.Val1 == codigo);
    }

  }


  changeSubProducto(e) {
    let filterProducto = e.Codigo;
    this.cargarSubProducto(filterProducto);
  }

  async cargarSubProducto(codigo: any) {

    var data = await this.maestroService.obtenerMaestros("SubProductoPlanta").toPromise();
    if (data.Result.Success) {
      this.listaSubProducto = data.Result.Data.filter(obj => obj.Val1 == codigo);
    }

  }

  /*buscar() 
  {
    
    if (this.consultaNotaIngresoPlantaForm.invalid || this.errorGeneral.isError) {
      this.submitted = true;
      return;
    } else {

      this.submitted = false;
      var objRequest = {
        "Numero": this.consultaNotaIngresoPlantaForm.controls['notaIngreso'].value,
        "NumeroGuiaRemision": this.consultaNotaIngresoPlantaForm.controls['numeroGuiaRemision'].value,
        "RazonSocialOrganizacion": this.consultaNotaIngresoPlantaForm.controls['organizacion'].value,
        "RucOrganizacion": this.consultaNotaIngresoPlantaForm.controls['ruc'].value,
        "ProductoId": this.consultaNotaIngresoPlantaForm.controls['tipoProducto'].value,
        "SubProductoId": this.consultaNotaIngresoPlantaForm.controls['subProducto'].value,
        "MotivoIngresoId": this.consultaNotaIngresoPlantaForm.controls['motivo'].value,
        "EstadoId": this.consultaNotaIngresoPlantaForm.controls['estado'].value,
    ///nuevos campos 
    
    "CodigoCampania": this.consultaNotaIngresoPlantaForm.controls['Campania'].value,
    "CodigoTipoConcepto": this.consultaNotaIngresoPlantaForm.controls['Concepto'].value,
    ///nuevos campos
       "EmpresaId": this.vSessionUser.Result.Data.EmpresaId,
        "FechaInicio": this.consultaNotaIngresoPlantaForm.controls['fechaInicio'].value,
        "FechaFin": this.consultaNotaIngresoPlantaForm.controls['fechaFin'].value,
        "FechaGuiaRemisionInicio": this.consultaNotaIngresoPlantaForm.controls['fechaGuiaRemisionInicio'].value,
        "FechaGuiaRemisionFin" : this.consultaNotaIngresoPlantaForm.controls['fechaGuiaRemisionFin'].value

      }
      this.spinner.show(undefined,
        {
          type: 'ball-triangle-path',
          size: 'medium',
          bdColor: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          fullScreen: true
        });
      this.plantaService.Consultar(objRequest)
        .subscribe(res => {
          this.spinner.hide();
          if (res.Result.Success) {
            if (res.Result.ErrCode == "") {
              res.Result.Data.forEach(obj => {
                obj.FechaRegistroCadena = this.dateUtil.formatDate(new Date(obj.FechaRegistro), "/");
                obj.FechaGuiaRemisionCadena =  this.dateUtil.formatDate(new Date(obj.FechaGuiaRemision), "/");
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
    if (this.consultaNotaIngresoPlantaForm.invalid || this.errorGeneral.isError) {
      this.submitted = true;
      return;
    } else {
      //debugger
      var fechaGuiaRemisionInicio
      var fechaGuiaRemisionFin   

      if(this.consultaNotaIngresoPlantaForm.controls['fechaGuiaRemisionInicio'].value!='' && this.consultaNotaIngresoPlantaForm.controls['fechaGuiaRemisionFin'].value!='')
      {
        fechaGuiaRemisionInicio = this.consultaNotaIngresoPlantaForm.controls['fechaGuiaRemisionInicio'].value;
        fechaGuiaRemisionFin = this.consultaNotaIngresoPlantaForm.controls['fechaGuiaRemisionFin'].value
      }

      this.submitted = false;
      var objRequest = {
        "Numero": this.consultaNotaIngresoPlantaForm.controls['notaIngreso'].value,
        "NumeroGuiaRemision": this.consultaNotaIngresoPlantaForm.controls['numeroGuiaRemision'].value,
        "RazonSocialOrganizacion": this.consultaNotaIngresoPlantaForm.controls['organizacion'].value,
        "RucOrganizacion": this.consultaNotaIngresoPlantaForm.controls['ruc'].value,
        "ProductoId": this.consultaNotaIngresoPlantaForm.controls['tipoProducto'].value,
        "SubProductoId": this.consultaNotaIngresoPlantaForm.controls['subProducto'].value,
        "MotivoIngresoId": this.consultaNotaIngresoPlantaForm.controls['motivo'].value,
        "EstadoId": this.consultaNotaIngresoPlantaForm.controls['estado'].value,
    ///nuevos campos 
    
    "CodigoCampania": this.consultaNotaIngresoPlantaForm.controls['Campania'].value,
    "CodigoTipoConcepto": this.consultaNotaIngresoPlantaForm.controls['Concepto'].value,
    ///nuevos campos
       "EmpresaId": this.vSessionUser.Result.Data.EmpresaId,
        "FechaInicio": this.consultaNotaIngresoPlantaForm.controls['fechaInicio'].value,
        "FechaFin": this.consultaNotaIngresoPlantaForm.controls['fechaFin'].value,
        "FechaGuiaRemisionInicio": fechaGuiaRemisionInicio,
        "FechaGuiaRemisionFin" : fechaGuiaRemisionFin

      }
      this.spinner.show(undefined,
        {
          type: 'ball-triangle-path',
          size: 'medium',
          bdColor: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          fullScreen: true
        });
        this.plantaService.Consultar(objRequest)
        .subscribe(res => {
          this.spinner.hide();
          if (res.Result.Success) {
            if (res.Result.ErrCode == "") {
              res.Result.Data.forEach(obj => {
                obj.FechaRegistroCadena = this.dateUtil.formatDate(new Date(obj.FechaRegistro), "/");
                obj.FechaGuiaRemision =  this.dateUtil.formatDate(new Date(obj.FechaGuiaRemision), "/");
              });
              if (!exportExcel) {
              this.tempData = res.Result.Data;
              this.rows = [...this.tempData];
              this.selected = [];
            }  else {
              let vArrHeaderExcel: HeaderExcel[] = [
                //new HeaderExcel("N° Control Calidad", "center"),
                new HeaderExcel("N° Nota Ingreso", "center"),
                new HeaderExcel("Campaña", "center"),
                new HeaderExcel("Concepto", "center"),
                new HeaderExcel("Nro Guia Remisión","center"),
                new HeaderExcel("Fecha Guia Remision", "center", "dd/mm/yyyy"),
                new HeaderExcel("Fecha Ingreso","center", "dd/mm/yyyy"),
                new HeaderExcel("Organizacion", "center"),
                new HeaderExcel("Tipo Producto", "center"),
                new HeaderExcel("Certificacion", "right"),
                new HeaderExcel("Estado de Humedad", "right"),
                new HeaderExcel("Motivo", "center"),
                new HeaderExcel("Cantidad Recibida", "right"),
                new HeaderExcel("Peso Bruto Kg Recibida", "right"),
                new HeaderExcel("Kilos Netos Recibidos", "right"),
                new HeaderExcel("% Humedad Recepción", "right"),
                new HeaderExcel("Cantidad Procesada", "right"),
                new HeaderExcel("Kilos Netos Procesado", "right"),
                new HeaderExcel("Cantidad Rechazada", "right"),
                new HeaderExcel("Kilos Netos Rechazados", "right"),
                new HeaderExcel("Cantidad Disponible", "right"),
                new HeaderExcel("Kilos Netos Disponibles", "right"),
                new HeaderExcel("Estado", "right")

              ];

              let vArrData: any[] = [];
              for (let i = 0; i < res.Result.Data.length; i++) {
                vArrData.push([
                  res.Result.Data[i].Numero,
                  res.Result.Data[i].CodigoCampania,
                  res.Result.Data[i].DescripcionConcepto,
                  res.Result.Data[i].NumeroGuiaRemision,
                  res.Result.Data[i].FechaGuiaRemisionCadena,
                  res.Result.Data[i].FechaRegistroCadena,
                  res.Result.Data[i].RazonSocial,
                  res.Result.Data[i].Producto,
                  res.Result.Data[i].Certificacion,
                  res.Result.Data[i].SubProducto,
                  res.Result.Data[i].MotivoIngreso,
                  res.Result.Data[i].Cantidad,
                  res.Result.Data[i].KilosBrutos,
                  res.Result.Data[i].KilosNetos,
                  res.Result.Data[i].HumedadPorcentaje,
                  res.Result.Data[i].CantidadProcesada,
                  res.Result.Data[i].KilosNetosProcesado,
                  res.Result.Data[i].CantidadRechazada,
                  res.Result.Data[i].KilosNetosRechazados,
                  res.Result.Data[i].CantidadDisponible,
                  res.Result.Data[i].KilosNetosDisponibles,
                  res.Result.Data[i].Estado
                ]);
              }
              this.excelService.ExportJSONAsExcel(vArrHeaderExcel, vArrData, 'NotaIngreso');
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




  compareTwoDates() {
   
   
   /*
    var anioFechaInicio = new Date(this.consultaNotaIngresoPlantaForm.controls['fechaInicio'].value).getFullYear()
    var anioFechaFin = new Date(this.consultaNotaIngresoPlantaForm.controls['fechaFin'].value).getFullYear()

    if (new Date(this.consultaNotaIngresoPlantaForm.controls['fechaFin'].value) < new Date(this.consultaNotaIngresoPlantaForm.controls['fechaInicio'].value)) {
      this.error = { isError: true, errorMessage: 'La fecha fin no puede ser anterior a la fecha inicio' };
      this.consultaNotaIngresoPlantaForm.controls['fechaFin'].setErrors({ isError: true })
    } else if (this.dateUtil.restarAnio(anioFechaInicio, anioFechaFin) > 2) {
      this.error = { isError: true, errorMessage: 'El Rango de fechas no puede ser mayor a 2 años' };
      this.consultaNotaIngresoPlantaForm.controls['fechaFin'].setErrors({ isError: true })
    } else {
      this.error = { isError: false, errorMessage: '' };
    }*/
  }

  compareFechas() {
    /*
    var anioFechaInicio = new Date(this.consultaNotaIngresoPlantaForm.controls['fechaInicio'].value).getFullYear()
    var anioFechaFin = new Date(this.consultaNotaIngresoPlantaForm.controls['fechaFin'].value).getFullYear()
    if (new Date(this.consultaNotaIngresoPlantaForm.controls['fechaInicio'].value) > new Date(this.consultaNotaIngresoPlantaForm.controls['fechaFin'].value)) {
      this.errorFecha = { isError: true, errorMessage: 'La fecha inicio no puede ser mayor a la fecha fin' };
      this.consultaNotaIngresoPlantaForm.controls['fechaInicio'].setErrors({ isError: true })
    } else if (this.dateUtil.restarAnio(anioFechaInicio, anioFechaFin) > 2) {
      this.errorFecha = { isError: true, errorMessage: 'El Rango de fechas no puede ser mayor a 2 años' };
      this.consultaNotaIngresoPlantaForm.controls['fechaInicio'].setErrors({ isError: true })
    } else {
      this.errorFecha = { isError: false, errorMessage: '' };
    }
    */
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
    this.router.navigate(['/planta/operaciones/notaingreso-edit']);
  }

  
  anular() {
    if (this.selected.length > 0) {
      if (this.selected[0].Cantidad != this.selected[0].CantidadDisponible){
       this.alertUtil.alertWarning("Advertencia","No se puede Anular la operacion Procesada");
      return;
      }
      if (this.selected[0].EstadoId == this.estadoPesado) {
        var form = this;
        swal.fire({
          title: '¿Estas seguro?',
          text: "¿Estas seguro de anular la guia?",
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
            form.anularGuia();
          }  
        });
      } else {
        this.alertUtil.alertError("Error", "Solo se puede anular guias con estado pesado")
      }
    }
  }

  enviar() {
    if (this.selected.length > 0) {
      if (this.selected[0].EstadoId == this.estadoPesado && this.selected[0].ProductoId=='02' ) {
        var form = this;
        swal.fire({
          title: '¿Estas seguro?',
          text: "¿Estas seguro de enviar a almacen?",
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
            form.enviarAlmacen();
          }
        });
      } else {
        this.alertUtil.alertError("Error", "Solo se puede enviar a almacén Notas de Ingreso de Café Exportable en estado Registrado")
      }
    }
  }

  anularGuia() {
    this.spinner.show(undefined,
      {
        type: 'ball-triangle-path',
        size: 'medium',
        bdColor: 'rgba(0, 0, 0, 0.8)',
        color: '#fff',
        fullScreen: true
      });
    this.plantaService.Anular(
      {
        "NotaIngresoPlantaId": this.selected[0].NotaIngresoPlantaId,
        "Usuario": this.vSessionUser.Result.Data.NombreUsuario
      })
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            this.alertUtil.alertOk('Anulado!', 'Nota Ingreso Anulado.');
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

  enviarAlmacen() {

    this.spinner.show(undefined,
      {
        type: 'ball-triangle-path',
        size: 'medium',
        bdColor: 'rgba(0, 0, 0, 0.8)',
        color: '#fff',
        fullScreen: true
      });

      this.plantaService.EnviarAlmacen(
        {
          "NotaIngresoPlantaId": this.selected[0].NotaIngresoPlantaId,
          "Usuario": this.vSessionUser.Result.Data.NombreUsuario
        })


      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            this.alertUtil.alertOk('Enviado!', 'Enviado Almacen.');
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
  Agregar(selected: any) {
    this.agregarEvent.emit(selected)
  }
  
  exportar() {
   this.buscar(true);

    /*
    try {
      if (this.rows == null || this.rows.length <= 0) {
        this.alertUtil.alertError("Error", "No existen datos a exportar.");
      } else {
        this.filtrosMateriaPrima.Numero = this.consultaNotaIngresoPlantaForm.controls['numeroGuia'].value
        this.filtrosMateriaPrima.NombreRazonSocial = this.consultaNotaIngresoPlantaForm.controls['nombre'].value
        this.filtrosMateriaPrima.TipoDocumentoId = this.consultaNotaIngresoPlantaForm.controls['tipoDocumento'].value
        this.filtrosMateriaPrima.NumeroDocumento = this.consultaNotaIngresoPlantaForm.controls['numeroDocumento'].value
        this.filtrosMateriaPrima.ProductoId = this.consultaNotaIngresoPlantaForm.controls['producto'].value
        this.filtrosMateriaPrima.CodigoSocio = this.consultaNotaIngresoPlantaForm.controls['codigoSocio'].value
        this.filtrosMateriaPrima.EstadoId = this.consultaNotaIngresoPlantaForm.controls['estado'].value
        this.filtrosMateriaPrima.FechaInicio = this.consultaNotaIngresoPlantaForm.controls['fechaInicio'].value
        this.filtrosMateriaPrima.FechaFin = this.consultaNotaIngresoPlantaForm.controls['fechaFin'].value

        let vArrHeaderExcel: HeaderExcel[] = [];

        this.spinner.show(undefined,
          {
            type: 'ball-triangle-path',
            size: 'medium',
            bdColor: 'rgba(0, 0, 0, 0.8)',
            color: '#fff',
            fullScreen: true
          });
        this.acopioService.consultarMateriaPrima(this.filtrosMateriaPrima)
          .subscribe(res => {
            this.spinner.hide();
            if (res.Result.Success) {
              if (res.Result.ErrCode == "") {
                this.tempData = res.Result.Data;

                vArrHeaderExcel = [
                  new HeaderExcel("Número Guia", "center"),
                  new HeaderExcel("Código Socio", "center"),
                  new HeaderExcel("Tipo Documento", "center"),
                  new HeaderExcel("Número Documento", "right", "#"),
                  new HeaderExcel("Nombre o Razón Social"),
                  new HeaderExcel("Fecha Registro", "center", "dd/mm/yyyy"),
                  new HeaderExcel("Estado", "center")
                ];

                let vArrData: any[] = [];
                for (let i = 0; i < this.tempData.length; i++) {
                  vArrData.push([
                    this.tempData[i].Numero,
                    this.tempData[i].CodigoSocio,
                    this.tempData[i].TipoDocumento,
                    this.tempData[i].NumeroDocumento,
                    this.tempData[i].NombreRazonSocial,
                    new Date(this.tempData[i].FechaRegistro),
                    this.tempData[i].Estado
                  ]);
                }
                this.excelService.ExportJSONAsExcel(vArrHeaderExcel, vArrData, 'DatosMateriaPrima');
              } else if (res.Result.Message != "" && res.Result.ErrCode != "") {
                this.errorGeneral = { isError: true, errorMessage: res.Result.Message };
              } else {
                this.errorGeneral = { isError: true, errorMessage: this.mensajeErrorGenerico };
              }
            }
          },
            err => {
              this.spinner.hide();
              console.log(err);
              this.errorGeneral = { isError: true, errorMessage: this.mensajeErrorGenerico };
            }
          );
      }
    }
    catch (err) {
      alert('Ha ocurrio un error en la descarga delExcel.');
    }
    */
  }


}
