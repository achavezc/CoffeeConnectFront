import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { DateUtil } from '../../../../../../services/util/date-util';
import { UbigeoService } from '../../../../../../services/ubigeo.service';
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
    private ubigeoService: UbigeoService,
    private spinner: NgxSpinnerService,
    private maestroService: MaestroService,
    private router: Router,
    private authService : AuthService) { }

  preciosdiaform: FormGroup;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  listSubProducto: [] = [];
  listEstado: [] = [];
  listProducto: [] = [];
  selectedSubProducto: any;
  selectedEstado: any;
  selectedProducto: any;
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
    this.vSessionUser = JSON.parse(localStorage.getItem('user'));
    this.readonly= this.authService.esReadOnly(this.vSessionUser.Result.Data.OpcionesEscritura);
  }

  LoadForm(): void {
    this.preciosdiaform = this.fb.group({
      
      producto: ['', Validators.required],
      estado: ['', Validators.required]
    });
  }

  get f() {
    return this.preciosdiaform.controls;
  }

  LoadCombos(): void {
    this.GetPaises();
    this.GetListEstado();

  }



  
  async GetPaises() {
    const res: any = await this.maestroService.ConsultarPaisAsync().toPromise();
    if (res.Result.Success) {
      this.listProducto = res.Result.Data;
    }
  }



  async GetListEstado() {
    let res = await this.maestroService.obtenerMaestros('EstadoMaestro').toPromise();
    if (res.Result.Success) {
      this.listEstado = res.Result.Data;
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
      CodigoPais: this.preciosdiaform.value.producto ?? '',
      EmpresaId: 1
    };
  }

  Search(): void {
    if (!this.preciosdiaform.invalid && !this.errorGeneral.isError) {
      this.spinner.show();
      const request = this.getRequest();
      this.ubigeoService.Consultar(request).subscribe((res: any) => {
        this.spinner.hide();
        if (res.Result.Success) {
          /*res.Result.Data.forEach(x => {
            x.FechaRegistro = this.dateUtil.formatDate(new Date(x.FechaRegistro));
          });*/
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
    this.router.navigate(['/acopio/operaciones/ciudades-edit']);
  }

}