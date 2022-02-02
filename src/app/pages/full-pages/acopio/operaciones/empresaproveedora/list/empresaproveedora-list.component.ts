import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { DateUtil } from '../../../../../../services/util/date-util';
import { EmpresaProveedoraService } from '../../../../../../services/empresaproveedora.service';
import { MaestroService } from '../../../../../../services/maestro.service';
import {AuthService} from './../../../../../../services/auth.service';

@Component({
  selector: 'app-empresatransporte',
  templateUrl: './empresaproveedora-list.component.html',
  styleUrls: ['./empresaproveedora-list.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EmpresaProveedoraListComponent implements OnInit {

  constructor(private fb: FormBuilder, private dateUtil: DateUtil,
    private empresaProveedoraService: EmpresaProveedoraService,
    private spinner: NgxSpinnerService,
    private maestroService: MaestroService,
    private router: Router,
    private authService : AuthService) { }

  @ViewChild(DatatableComponent) table: DatatableComponent;
  
  listEstado: [] = [];
  listClasificacion: [] = [];
  selectedClasificacion: any;
  selectedEstado: any;
  selected = [];
  limitRef: number = 10;
  rows = [];
  tempData = [];
  errorGeneral = { isError: false, msgError: '' };
  msgErrorGenerico = 'Ocurrio un error interno.';
  error: any = { isError: false, errorMessage: '' };
  errorFecha: any = { isError: false, errorMessage: '' };
  submitted = false;
  empresaProveedoraform: FormGroup;
  vSessionUser: any;
  readonly: boolean;
  
  ngOnInit(): void {
    this.LoadForm();
    this.LoadCombos();
    this.vSessionUser = JSON.parse(localStorage.getItem('user'));
    this.readonly= this.authService.esReadOnly(this.vSessionUser.Result.Data.OpcionesEscritura);
  }

  LoadForm(): void {
    this.empresaProveedoraform = this.fb.group({
      nombreRazonSocial: ['', ''],
      ruc: ['', ''],
      estado: ['', ''],
      clasificacion: ['','']
    });
  }

  get f() {
    return this.empresaProveedoraform.controls;
  }

  LoadCombos(): void {
    this.GetListEstado();
    this.GetClasificacion();
   
  }

 


  async GetListEstado() {
    let res = await this.maestroService.obtenerMaestros('EstadoMaestro').toPromise();
    if (res.Result.Success) {
      this.listEstado= res.Result.Data;
    }
  }
  
  async GetClasificacion() {
    let res = await this.maestroService.obtenerMaestros('ClasificacionEmpresaProveedoraAcreedora').toPromise();
    if (res.Result.Success) {
      this.listClasificacion= res.Result.Data;
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
        RazonSocial: this.empresaProveedoraform.value.nombreRazonSocial,
        Ruc: this.empresaProveedoraform.value.ruc,
        EstadoId: this.empresaProveedoraform.value.estado,
        EmpresaId: this.vSessionUser.Result.Data.EmpresaId,
        ClasificacionId: this.empresaProveedoraform.value.clasificacion
    };
  }

  Search(): void {
    if (!this.empresaProveedoraform.invalid && !this.errorGeneral.isError) {
      this.spinner.show();
      const request = this.getRequest();
      this.empresaProveedoraService.Consultar(request).subscribe((res: any) => {
        this.spinner.hide();
        if (res.Result.Success) {
          res.Result.Data.forEach(x => {
          x.FechaRegistro =  this.dateUtil.formatDate(new Date(x.FechaRegistro));
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
    this.router.navigate(['/acopio/operaciones/empresaproveedora-edit']);
  }

}
