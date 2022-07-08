import { Component, OnInit, ViewChild, ViewEncapsulation, Input, EventEmitter, Output } from "@angular/core";
import { DatatableComponent, ColumnMode } from "@swimlane/ngx-datatable";
import { MaestroUtil } from '../../../../../../services/util/maestro-util';
import { DateUtil } from '../../../../../../services/util/date-util';
import { NotaIngresoAlmacenPlantaService } from '../../../../../../services/nota-ingreso-almacen-planta-service';
import { Observable } from 'rxjs';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from "@angular/router";
import {AuthService} from './../../../../../../services/auth.service';

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
  listaProducto: Observable<any[]>;
  listaSubProducto: any[];
  listaCertificacion: Observable<any[]>;
  selectedEstado: any;
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
    private authService : AuthService
  ) {
    this.singleSelectCheck = this.singleSelectCheck.bind(this);
  }
  ngOnInit(): void {
    this.cargarForm();
    this.cargarcombos();
    this.vSessionUser = JSON.parse(localStorage.getItem('user'));
    this.notaIngresoAlmacenForm.controls['fechaFin'].setValue(this.dateUtil.currentDate());
    this.notaIngresoAlmacenForm.controls['fechaInicio'].setValue(this.dateUtil.currentMonthAgo());
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

  cargarForm() {
    this.notaIngresoAlmacenForm = new FormGroup(
      {
        numeroIngresoAlmacen: new FormControl('', [Validators.minLength(5), Validators.maxLength(20), Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$')]),
        codigoOrganizacion: new FormControl('', []),
        fechaInicio: new FormControl('', [Validators.required]),
        ruc: new FormControl('', [Validators.minLength(8), Validators.maxLength(20), Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$')]),
        rzsocial: new FormControl('', [Validators.minLength(5), Validators.maxLength(100)]),
        estado: new FormControl('', [Validators.required]),
        fechaFin: new FormControl('', [Validators.required,]),
        producto: new FormControl('', []),
        almacen: new FormControl('', []),
        rendimientoInicio: new FormControl('', []),
        rendimientoFin: new FormControl('', []),
        puntajeFinalFin: new FormControl('', []),
        puntajeFinalInicio: new FormControl('', []),
        certificacion: new FormControl('', []),
        numeroIngresoPlanta: new FormControl('', [Validators.minLength(5), Validators.maxLength(20), Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$')]),
        subproducto: new FormControl('', [])
      });
    this.notaIngresoAlmacenForm.setValidators(this.comparisonValidator())
  }

  cargarcombos() {
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
  }

  public comparisonValidator(): ValidatorFn {
    return (group: FormGroup): ValidationErrors => {
      if (!group.value.fechaInicio || !group.value.fechaFin) {
        this.errorGeneral = { isError: true, errorMessage: 'Por favor seleccionar ambas fechas.' };
      } else if (!group.value.estado) {
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

  buscar() {
    if (this.notaIngresoAlmacenForm.invalid || this.errorGeneral.isError) {
      this.submitted = true;
      return;
    } else {

      this.submitted = false;
      var objRequest = {
        "Numero": this.notaIngresoAlmacenForm.controls['numeroIngresoAlmacen'].value,
        "NumeroNotaIngresoPlanta": this.notaIngresoAlmacenForm.controls['numeroIngresoPlanta'].value,
        "NumeroOrganizacion": this.notaIngresoAlmacenForm.controls['codigoOrganizacion'].value,
        "RazonSocialOrganizacion": this.notaIngresoAlmacenForm.controls['rzsocial'].value,
        "RucOrganizacion": this.notaIngresoAlmacenForm.controls['ruc'].value,
        "ProductoId": this.notaIngresoAlmacenForm.controls['producto'].value,
        "SubProductoId": this.notaIngresoAlmacenForm.controls['subproducto'].value,
        "EstadoId": '01',
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