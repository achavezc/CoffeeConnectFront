import { Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { DatatableComponent, ColumnMode } from "@swimlane/ngx-datatable";
import { MaestroUtil } from '../../../../../../services/util/maestro-util';
import { AlertUtil } from '../../../../../../services/util/alert-util';
import { DateUtil } from '../../../../../../services/util/date-util';
import { AcopioService, FiltrosMateriaPrima } from '../../../../../../services/acopio.service';
import { NotaIngresoAlmacenService } from '../../../../../../services/nota-ingreso-almacen.service';
import { Observable } from 'rxjs';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ExcelService } from '../../../../../../shared/util/excel.service';
import { NgxSpinnerService } from "ngx-spinner";
import { HeaderExcel } from '../../../../../../services/models/headerexcel.model';
import swal from 'sweetalert2';
import { Router } from "@angular/router"

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
    submitted = false;
    listaEstado: Observable<any[]>;
    listaTipoDocumento: Observable<any[]>;
    listaProducto: Observable<any[]>;
    listaSubProducto: Observable<any[]>;
    listaCertificacion: Observable<any[]>;
    selectedTipoDocumento: any;
    selectedEstado: any;
    selectedAlmacen: any;
    selectedProducto: any;
    selectedSubProducto: any;
    selectedCertificacion: any;
    notaIngresoAlamcenForm: FormGroup;
    error: any = { isError: false, errorMessage: '' };
    errorFecha: any = { isError: false, errorMessage: '' };
    errorGeneral: any = { isError: false, errorMessage: '' };
    selected = []
    mensajeErrorGenerico = "Ocurrio un error interno.";
    estadoPesado = "01";
    estadoAnalizado = "02";
    @ViewChild(DatatableComponent) table: DatatableComponent;
    vSessionUser: any;
    listaAlmacen: Observable<any[]>;
  
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
        private acopioService: AcopioService,
        private notaIngrersoService: NotaIngresoAlmacenService,
        private filtrosMateriaPrima: FiltrosMateriaPrima,
        private excelService: ExcelService,
        private spinner: NgxSpinnerService) {
        this.singleSelectCheck = this.singleSelectCheck.bind(this);
      }
    ngOnInit(): void {

       
    
    }
    compareTwoDates() {
        var anioFechaInicio = new Date(this.notaIngresoAlamcenForm.controls['fechaInicio'].value).getFullYear()
        var anioFechaFin = new Date(this.notaIngresoAlamcenForm.controls['fechaFin'].value).getFullYear()
    
        if (new Date(this.notaIngresoAlamcenForm.controls['fechaFin'].value) < new Date(this.notaIngresoAlamcenForm.controls['fechaInicio'].value)) {
          this.error = { isError: true, errorMessage: 'La fecha fin no puede ser anterior a la fecha inicio' };
          this.notaIngresoAlamcenForm.controls['fechaFin'].setErrors({ isError: true })
        } else if (this.dateUtil.restarAnio(anioFechaInicio, anioFechaFin) > 2) {
          this.error = { isError: true, errorMessage: 'El Rango de fechas no puede ser mayor a 2 años' };
          this.notaIngresoAlamcenForm.controls['fechaFin'].setErrors({ isError: true })
        } else {
          this.error = { isError: false, errorMessage: '' };
        }
      }
    get f() {
        return this.notaIngresoAlamcenForm.controls;
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
      this.notaIngresoAlamcenForm = new FormGroup(
        {
         numeroIngresoAlmacen: new FormControl('', [Validators.minLength(5), Validators.maxLength(20), Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$')]),
          tipoDocumento: new FormControl('', []),
          nombre: new FormControl('', [Validators.minLength(5), Validators.maxLength(100)]),
          fechaInicio: new FormControl('', [Validators.required]),
          numeroDocumento: new FormControl('', [Validators.minLength(8), Validators.maxLength(20), Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$')]),
          rzsocial: new FormControl('', []),
          estado: new FormControl('', []),
          fechaFin: new FormControl('', [Validators.required,]),
          codigoSocio: new FormControl('', [Validators.minLength(5), Validators.maxLength(20), Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$')]),
          producto: new FormControl('', []),
          almacen: new FormControl('', []),
          rendimientoInicio: new FormControl('', []),
          rendimientoFin: new FormControl('', []),
          puntajeFinalFin: new FormControl('', []),
          puntajeFinalInicio: new FormControl('', [])
        });
      this.notaIngresoAlamcenForm.setValidators(this.comparisonValidator())
    }
  
    public comparisonValidator(): ValidatorFn {
        return (group: FormGroup): ValidationErrors => {
          const numeroGuia = group.controls['numeroGuia'];
          const numeroDocumento = group.controls['numeroDocumento'];
          const codigoSocio = group.controls['codigoSocio'];
          const nombre = group.controls['nombre'];
          const tipoDocumento = group.controls['tipoDocumento'];
          if (numeroGuia.value == "" && numeroDocumento.value == "" && codigoSocio.value == "" && nombre.value == "") {
    
            this.errorGeneral = { isError: true, errorMessage: 'Ingrese por lo menos un campo' };
    
          } else {
            this.errorGeneral = { isError: false, errorMessage: '' };
          }
    
          if (numeroDocumento.value != "" && (tipoDocumento.value == "" || tipoDocumento.value == undefined)) {
    
            this.errorGeneral = { isError: true, errorMessage: 'Seleccione un tipo documento' };
    
          } else if (numeroDocumento.value == "" && (tipoDocumento.value != "" && tipoDocumento.value != undefined)) {
    
            this.errorGeneral = { isError: true, errorMessage: 'Ingrese un numero documento' };
    
          }
    
          return;
        };
      }
    cargarcombos() {
      var form = this;
      this.maestroUtil.obtenerMaestros("EstadoGuiaRecepcion", function (res) {
        if (res.Result.Success) {
          form.listaEstado = res.Result.Data;
        }
      });
      this.maestroUtil.obtenerMaestros("TipoDocumento", function (res) {
        if (res.Result.Success) {
          form.listaTipoDocumento = res.Result.Data;
        }
      });
      this.maestroUtil.obtenerMaestros("Producto", function (res) {
        if (res.Result.Success) {
          form.listaProducto = res.Result.Data;
        }
      });
    }
    nuevo() {
        this.router.navigate(['./operaciones/notaingresoalmacen-edit']);
      }
    compareFechas() {
        var anioFechaInicio = new Date(this.notaIngresoAlamcenForm.controls['fechaInicio'].value).getFullYear()
        var anioFechaFin = new Date(this.notaIngresoAlamcenForm.controls['fechaFin'].value).getFullYear()
        if (new Date(this.notaIngresoAlamcenForm.controls['fechaInicio'].value) > new Date(this.notaIngresoAlamcenForm.controls['fechaFin'].value)) {
          this.errorFecha = { isError: true, errorMessage: 'La fecha inicio no puede ser mayor a la fecha fin' };
          this.notaIngresoAlamcenForm.controls['fechaInicio'].setErrors({ isError: true })
        } else if (this.dateUtil.restarAnio(anioFechaInicio, anioFechaFin) > 2) {
          this.errorFecha = { isError: true, errorMessage: 'El Rango de fechas no puede ser mayor a 2 años' };
          this.notaIngresoAlamcenForm.controls['fechaInicio'].setErrors({ isError: true })
        } else {
          this.errorFecha = { isError: false, errorMessage: '' };
        }
      }
}