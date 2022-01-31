import { Component, OnInit, ViewEncapsulation, ViewChild,Output,EventEmitter , Input} from '@angular/core';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn,FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router, ActivatedRoute } from '@angular/router';
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { DateUtil } from '../../../../../../services/util/date-util';
import { OrdenProcesoServicePlanta } from '../../../../../../Services/orden-proceso-planta.service';
import { MaestroService } from '../../../../../../services/maestro.service';
import {AuthService} from './../../../../../../services/auth.service';

@Component({
  selector: 'app-ordenproceso-list',
  templateUrl: './ordenproceso-list.component.html',
  styleUrls: ['./ordenproceso-list.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OrdenProcesoListComponent implements OnInit {

  constructor(private fb: FormBuilder, private dateUtil: DateUtil,
    private OrdenProcesoServicePlanta: OrdenProcesoServicePlanta,
    private spinner: NgxSpinnerService,
    private maestroService: MaestroService,
    private router: Router,
    private route: ActivatedRoute,
    private authService : AuthService) { }

  @ViewChild(DatatableComponent) table: DatatableComponent;

  listEstado: [] = [];
  selectedEstado: any;
  listTipoProceso: [] = [];
  selectedTipoProceso: any;
  vSessionUser: any;
  selected = [];
  limitRef: number = 10;
  rows = [];
  tempData = [];
  errorGeneral: any = { isError: false, errorMessage: '' };
  msgErrorGenerico = 'Ocurrio un error interno.';
  error: any = { isError: false, errorMessage: '' };
  errorFecha: any = { isError: false, errorMessage: '' };
  submitted = false;
  ordenProcesoform: FormGroup;
  @Output() seleccionarEvent = new EventEmitter<any>();
  @Input() popUp = false;
  page: any;
  readonly: boolean;
  
  ngOnInit(): void {
    this.vSessionUser = JSON.parse(localStorage.getItem('user'));
    this.LoadForm();
    this.LoadCombos();
    this.ordenProcesoform.controls['fechaFin'].setValue(this.dateUtil.currentDate());
    this.ordenProcesoform.controls['fechaInicio'].setValue(this.dateUtil.currentMonthAgo());
    this.page = this.route.routeConfig.data.title;
    this.readonly= this.authService.esReadOnly(this.vSessionUser.Result.Data.OpcionesEscritura);
  }

  LoadForm(): void {
    this.ordenProcesoform = this.fb.group({
        numeroOrden: ['', ''],
        ruc: ['', ''],
        numeroContrato: ['', ''],
        organizacion: ['', ''],
        fechaInicio: ['', ''],
        estado: ['', ''],
        fechaFin: ['', ''],
        tipoProceso: ['', ''],
    });
   // this.ordenProcesoform.setValidators(this.comparisonValidator())
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
  get f() {
    return this.ordenProcesoform.controls;
  }

  LoadCombos(): void {
    this.GetListEstado();
    this.GetListTipoProceso();
  }

  async GetListEstado() {
    const form = this;
    let res = await this.maestroService.obtenerMaestros('EstadoOrdenProceso').toPromise();
    if (res.Result.Success) {
      this.listEstado= res.Result.Data;
      if (this.popUp) {
        switch (this.page) {
          case "LiquidacionProcesoEdit":
            form.selectedEstado = '01';
            break;
          default:
            break;
        }
        this.ordenProcesoform.controls.estado.disable();
      }
    }
  }

  async GetListTipoProceso() {
    let res = await this.maestroService.obtenerMaestros('TipoProceso').toPromise();
    if (res.Result.Success) {
      this.listTipoProceso = res.Result.Data;
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

  getRequest(): any {
      
    return {
        Numero: this.ordenProcesoform.value.numeroOrden,
        RucOrganizacion: this.ordenProcesoform.value.ruc,
        NumeroContrato: this.ordenProcesoform.value.numeroContrato,
        RazonSocialOrganizacion: this.ordenProcesoform.value.organizacion,
        FechaInicio: this.ordenProcesoform.value.fechaInicio,
        FechaFin: this.ordenProcesoform.value.fechaFin,
        TipoProcesoId:  this.ordenProcesoform.controls["tipoProceso"].value,
        EstadoId:  this.ordenProcesoform.controls["estado"].value,
        EmpresaId: this.vSessionUser.Result.Data.EmpresaId
    };
  }

  Search(): void {
    if (!this.ordenProcesoform.invalid && !this.errorGeneral.isError) {
      this.spinner.show();
      const request = this.getRequest();
      this.OrdenProcesoServicePlanta.Consultar(request).subscribe((res: any) => {
        this.spinner.hide();
        if (res.Result.Success) {
          res.Result.Data.forEach(x => {
          x.FechaInicioProceso = this.dateUtil.formatDate(x.FechaInicioProceso)
          x.FechaRegistro =  this.dateUtil.formatDate(x.FechaRegistro);
          x.FechaFinProceso =  this.dateUtil.formatDate(x.FechaFinProceso);
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
  compareTwoDates() {
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
  }

  
  compareFechas() {
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
    }
  }

  Buscar(): void {
    this.Search();
  }
  
  Nuevo(): void {
    this.router.navigate(['/planta/operaciones/ordenproceso/create']);
  }

  Seleccionar(selected)
  {
    this.seleccionarEvent.emit(selected)
  }
}
