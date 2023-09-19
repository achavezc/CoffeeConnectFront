import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { MaestroUtil } from '../../../../../../services/util/maestro-util';
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { DateUtil } from '../../../../../../services/util/date-util';
//import { UbigeoService } from '../../../../../../services/ubigeo.service';
import { MaestroService } from '../../../../../../services/maestro.service';
import {AuthService} from './../../../../../../services/auth.service';

@Component({
  selector: 'app-ciudades',
  templateUrl: './correlativoplanta-list.component.html',
  styleUrls: ['./correlativoplanta-list.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CorrelativoPlantaListComponent implements OnInit {

  constructor(private fb: FormBuilder, private dateUtil: DateUtil,
    //private ubigeoService: UbigeoService,
    private maestroUtil: MaestroUtil,
    private spinner: NgxSpinnerService,
    private maestroService: MaestroService,
    private router: Router,
    private authService : AuthService) { }

  Correlativoplantaform: FormGroup;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  listSubProducto: [] = [];
  
  listaTipo: [] = [];
  listaConcepto:[] =[];
  listaCampania: [] = [];
  listaActivo:[]=[];
  
  selectedSubProducto: any;
  
  selectedTipo: any;
  selectedConcepto:any;
  selectedCampania: any;
  selectedActivo:any;
  
  selected = [];
  limitRef: number = 10;
  rows = [];
  tempData = [];
  errorGeneral = { isError: false, msgError: '' };
  msgErrorGenerico = 'Ocurrio un error interno.';
  error: any = { isError: false, errorMessage: '' };
  errorFecha: any = { isError: false, errorMessage: '' };
  submitted = false;
  vSessionUser: any;
  readonly: boolean;

  ngOnInit(): void {
    this.LoadForm();
    this.LoadCombos();

    //this.vSessionUser = JSON.parse(localStorage.getItem('user'));
    ////this.readonly= this.authService.esReadOnly(this.vSessionUser.Result.Data.OpcionesEscritura);
  }

  LoadForm(): void {
    this.Correlativoplantaform = this.fb.group({
      
      campanhnia:['',],
      codigoTipo:['',],
      CodigoConcepto:['',],
      activo:['',],
    });
  }

  get f() {
    return this.Correlativoplantaform.controls;
  }

  LoadCombos(): void {

    this.GetListTipo();
    this.GetListEstado();

  }
  changeTipos(e) {
    
    let codigo = e.Codigo;
    this.cargaCampania(codigo);
    this.cargaConceptos(codigo);
  }


  
  async cargaCampania(codigo :any) {

    var data = await this.maestroService.ConsultarCampanias(codigo).toPromise();
    if (data.Result.Success) {
      this.listaCampania = data.Result.Data;
    }

  }
    async cargaConceptos(codigo:any) {

    var data = await this.maestroService.ConsultarConceptos(codigo).toPromise();
    if (data.Result.Success) {
      this.listaConcepto = data.Result.Data;
    }

  }

  async GetListTipo() {
    var form = this;
    this.maestroUtil.obtenerMaestros("TipoCorrelativoPlanta", function (res) 
    {
      if (res.Result.Success) {
        form.listaTipo = res.Result.Data;
        /*if (form.popUp) {
          form.consultaNotaIngresoPlantaForm.controls.estado.setValue("03");
          form.consultaNotaIngresoPlantaForm.controls.estado.disable();
          form.consultaNotaIngresoPlantaForm.setValidators(this.comparisonValidator())
        }*/
      }
    });
  }
  async GetListEstado() {
    let res = await this.maestroService.obtenerMaestros('EstadoMaestro').toPromise();
    if (res.Result.Success) {
      this.listaActivo = res.Result.Data;
      this.Correlativoplantaform.get('activo').setValue('01');
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
    var ActivoFinal =false; 
    if(this.Correlativoplantaform.value.activo == "01" )
    {
       ActivoFinal = true;
    }
    return {
      campanhnia: this.Correlativoplantaform.value.campanhnia,
      Codigotipo: this.Correlativoplantaform.value.codigoTipo,
      CodigoConcepto: this.Correlativoplantaform.value.CodigoConcepto,
      activo: ActivoFinal
  };
  }

  Search(): void {
    if (!this.Correlativoplantaform.invalid && !this.errorGeneral.isError) {
      this.spinner.show();
      const request = this.getRequest();
      this.maestroService.ConsultarCorrelativoPlanta(request).subscribe((res: any) => {
        this.spinner.hide();
        if (res.Result.Success) {
          res.Result.Data.forEach(x => {
            if(x.Activo == true ){
              x.ActivoNombre ='Activo';
            }else
            {
            x.ActivoNombre = 'Inactivo'; 
            }
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

  Buscar(): void {
    this.Search();
  }

  Nuevo(): void {
    this.router.navigate(['/acopio/operaciones/correlativoplanta-edit']);
  }

}