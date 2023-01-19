import { Component, OnInit, ViewEncapsulation, ViewChild,Output,EventEmitter , Input} from '@angular/core';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn,FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router, ActivatedRoute } from '@angular/router';
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { DateUtil } from '../../../../../../services/util/date-util';
import { OrdenProcesoServicePlanta } from '../../../../../../Services/orden-proceso-planta.service';
import{ServicioPlantaService}from'../../../../../../Services/ServicioPlanta.services';
import { MaestroService } from '../../../../../../services/maestro.service';
import {AuthService} from '../../../../../../services/auth.service';

@Component({
  selector: 'app-servicios-list',
  templateUrl: './servicios-list.component.html',
  styleUrls: ['./servicios-list.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ServiciosListComponent implements OnInit {

  constructor(private fb: FormBuilder, private dateUtil: DateUtil,
    private OrdenProcesoServicePlanta: OrdenProcesoServicePlanta,
    private ServicioPlantaService:ServicioPlantaService,
    private spinner: NgxSpinnerService,
    private maestroService: MaestroService,
    private router: Router,
    private route: ActivatedRoute,
    private authService : AuthService) { }

  @ViewChild(DatatableComponent) table: DatatableComponent;

  listEstado: [] = [];
  selectedEstado: any;
  listTipoServicio: [] = [];
  selectedTipoServicio: any;
  listaCampania:any[];
  selectedCampania:any;
  listTipoMoneda:[]=[];
  SelectedTipoMoneda:any;

  listTipoComprobante: [] = [];
  selectedTipoComprobante: any;


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
  Serviciosform: FormGroup;
 // MonedaId: Number;
  @Output() seleccionarEvent = new EventEmitter<any>();
  @Input() popUp = false;
  page: any;
  readonly: boolean;
  
  ngOnInit(): void {
    this.vSessionUser = JSON.parse(localStorage.getItem('user'));
    this.LoadForm();
    this.LoadCombos();
    this.cargaCampania();
    this.GetListaTipoMoneda();
    //this.Serviciosform.controls['FechaFin'].setValue(this.dateUtil.currentDate());
   // this.Serviciosform.controls['FechaInicio'].setValue(this.dateUtil.currentMonthAgo());
    this.Serviciosform.controls['FechaFin'].setValue(this.dateUtil.currentDate());
    this.Serviciosform.controls['FechaInicio'].setValue(this.dateUtil.currentMonthAgo()); 
    //this.Serviciosform.controls.MonedaId.setValue(this.vSessionUser.Result.Data.MonedaId);
    this.page = this.route.routeConfig.data.title;
    this.readonly= this.authService.esReadOnly(this.vSessionUser.Result.Data.OpcionesEscritura);
  }

  LoadForm(): void {
    this.Serviciosform = this.fb.group({
       Numero: ['',''],
       NumeroOperacionRelacionada: ['', ''],
       NumeroOperacion: ['', ''],          
       TipoServicio: ['', ''],
       TipoComprobante: ['', ''],
       SerieComprobanteServicio: ['',''],
       NumeroComprobanteServicio: ['',''],
       Moneda: ['', ''],
       MonedaId:['',''],
      // RazonSocial : ['', ''],
      // Ruc:['',''],
       Campania: new FormControl('',[]),
       rucOrganizacion: ['',],
       nombreOrganizacion: [],
       estado :['',''],
       FechaInicio :['',''],
       FechaFin:['','']
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
    return this.Serviciosform.controls;
  }
  async cargaCampania() 
  {

    var data = await this.maestroService.ConsultarCampanias("01").toPromise();
    if (data.Result.Success) {
      this.listaCampania = data.Result.Data;
    }

  }

  LoadCombos(): void {
    this.GetEstado();
    this.GetListTipoServicio();
    this.GetListTipoComprobante();
  }

  async GetEstado() {
    const res = await this.maestroService.obtenerMaestros('EstadoServicioPlanta').toPromise();
    if (res.Result.Success) {
      this.listEstado = res.Result.Data;
    }
  }

  async GetListTipoServicio() {
    let res = await this.maestroService.obtenerMaestros('TipoServicioPlanta').toPromise();
    if (res.Result.Success) {
      this.listTipoServicio = res.Result.Data;
    }
  }

  async GetListTipoComprobante() {
    let res = await this.maestroService.obtenerMaestros('TipoComprobantePlanta').toPromise();
    if (res.Result.Success) {
      this.listTipoComprobante = res.Result.Data;
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
      
        Numero: this.Serviciosform.value.Numero,
        NumeroOperacionRelacionada:this.Serviciosform.value.NumeroOperacion,       
        TipoServicioId : this.Serviciosform.value.TipoServicio,
        TipoComprobanteId : this.Serviciosform.value.TipoComprobante,
        SerieComprobante: this.Serviciosform.controls["SerieComprobanteServicio"].value ? this.Serviciosform.controls["SerieComprobanteServicio"].value : '',
        NumeroComprobante: this.Serviciosform.controls["NumeroComprobanteServicio"].value ? this.Serviciosform.controls["NumeroComprobanteServicio"].value : '',
        RazonSocialEmpresaCliente : this.Serviciosform.value.nombreOrganizacion,
        RucEmpresaCliente :this.Serviciosform.value.rucOrganizacion,
        CodigoCampania:this.Serviciosform.value.Campania,
        FechaInicio:this.Serviciosform.value.FechaInicio,
        FechaFin:this.Serviciosform.value.FechaFin,
        EstadoId:  this.Serviciosform.controls["estado"].value,
        EmpresaId: this.vSessionUser.Result.Data.EmpresaId 
    };
  }

  Search(): void {
    if (!this.Serviciosform.invalid && !this.errorGeneral.isError) {
      this.spinner.show();
      const request = this.getRequest();
      this.ServicioPlantaService.Consultar(request).subscribe((res: any) => {
        this.spinner.hide();
        if (res.Result.Success) {
          res.Result.Data.forEach(x => {
         // x.FechaInicioProceso = this.dateUtil.formatDate(x.FechaInicioProceso)
         // x.FechaRegistro =  this.dateUtil.formatDate(x.FechaRegistro);
         // x.FechaFinProceso =  this.dateUtil.formatDate(x.FechaFinProceso);
          x.FechaDocumento = this.dateUtil.formatDate(x.FechaDocumento);
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
  async GetListaTipoMoneda () {
    let res = await this.maestroService.obtenerMaestros('Moneda').toPromise();
    if (res.Result.Success) {
      this.listTipoMoneda = res.Result.Data;
    }
  }


  Buscar(): void {
    this.Search();
  }
  
  Nuevo(): void {
    this.router.navigate(['/planta/operaciones/servicios-edit']);
   // this.router.navigate([`/planta/operaciones/servicios-edit/${this.MonedaId}`]);
  }

  Seleccionar(selected)
  {
    this.seleccionarEvent.emit(selected)
  }
}