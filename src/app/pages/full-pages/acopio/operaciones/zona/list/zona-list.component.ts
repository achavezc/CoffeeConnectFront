import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { DateUtil } from '../../../../../../services/util/date-util';
import { ZonasService } from '../../../../../../services/zonas.service';
import { MaestroService } from '../../../../../../services/maestro.service';
import { ExcelService } from '../../../../../../shared/util/excel.service';
import { MaestroUtil } from '../../../../../../services/util/maestro-util';

@Component({
  selector: 'app-zona',
  templateUrl: './zona-list.component.html',
  styleUrls: ['./zona-list.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ZonaListComponent implements OnInit {

  constructor(private fb: FormBuilder, private dateUtil: DateUtil,
    private zonasService: ZonasService,
    private spinner: NgxSpinnerService,
    private maestroService: MaestroService,
    private router: Router,
    private excelService: ExcelService,
    private maestroUtil: MaestroUtil) { }

  @ViewChild(DatatableComponent) table: DatatableComponent;
  
  listEstado: [] = [];
  listProvincias: [] = [];
  selectedProvincia: any;
  selectedEstado: any;
  selected = [];
  listDepartamentos: [] = [];
  selectedDepartamento: any;
  listDistritos: [] = [];
  selectedDistrito: any;
  limitRef: number = 10;
  rows = [];
  tempData = [];
  errorGeneral = { isError: false, msgError: '' };
  msgErrorGenerico = 'Ocurrio un error interno.';
  error: any = { isError: false, errorMessage: '' };
  errorFecha: any = { isError: false, errorMessage: '' };
  submitted = false;
  zonasform: FormGroup;
  
  ngOnInit(): void {
    this.LoadForm();
    this.LoadCombos();
  }

  LoadForm(): void {
    this.zonasform = this.fb.group({
      departamento: ['', ''],
      provincia: ['', ''],
      distrito: ['', ''],
      estado: ['','']
    });
  }

  get f() {
    return this.zonasform.controls;
  }

  LoadCombos(): void {
    this.GetListEstado();
    this.GetDepartamentos();
   
  }

 


  async GetListEstado() {
    let res = await this.maestroService.obtenerMaestros('EstadoMaestro').toPromise();
    if (res.Result.Success) {
      this.listEstado= res.Result.Data;
    }
  }
  async GetDepartamentos() {
    const res: any = await this.maestroUtil.GetDepartmentsAsync('PE');
    if (res.Result.Success) {
      this.listDepartamentos = res.Result.Data;
    }
  }
  onChangeDepartament(event: any): void {
    this.spinner.show();
    const form = this;
    this.listProvincias = [];
    this.zonasform.controls.provincia.reset();
    this.maestroUtil.GetProvinces(event.Codigo, event.CodigoPais, (res: any) => {
      this.spinner.hide();
      if (res.Result.Success) {
        form.listProvincias = res.Result.Data;
      }
    });
  }

  async GetProvincias() {
    this.listProvincias = [];
    const res: any = await this.maestroUtil.GetProvincesAsync(this.selectedDepartamento, 'PE');
    if (res.Result.Success) {
      this.listProvincias = res.Result.Data;
    }
  }

  onChangeProvince(event: any): void {
    this.spinner.show();
    const form = this;
    this.listDistritos = [];
    this.zonasform.controls.distrito.reset();
    this.maestroUtil.GetDistricts(this.selectedDepartamento, event.Codigo, event.CodigoPais,
      (res: any) => {
        this.spinner.hide();
        if (res.Result.Success) {
          form.listDistritos = res.Result.Data;
        }
      });
  }

  async GetDistritos() {
    this.listDistritos = [];
    const res: any = await this.maestroUtil.GetDistrictsAsync(this.selectedDepartamento, this.selectedProvincia, 'PE');
    if (res.Result.Success) {
      this.listDistritos = res.Result.Data;
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
        CodigoDistrito: this.zonasform.value.distrito,
        EstadoId: this.zonasform.value.estado,
        EmpresaId: 1
    };
  }

  Search(): void {
    if (!this.zonasform.invalid && !this.errorGeneral.isError) {
      this.spinner.show();
      const request = this.getRequest();
      this.zonasService.Consultar(request).subscribe((res: any) => {
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
    this.router.navigate(['/acopio/operaciones/zona-edit']);
  }

}
