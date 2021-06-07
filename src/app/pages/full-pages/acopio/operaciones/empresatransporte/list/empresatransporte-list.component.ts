import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { DateUtil } from '../../../../../../services/util/date-util';
import { EmpresaTransporteService } from '../../../../../../services/empresatransporte.service';
import { MaestroService } from '../../../../../../services/maestro.service';
import { ExcelService } from '../../../../../../shared/util/excel.service';
import { MaestroUtil } from '../../../../../../services/util/maestro-util';

@Component({
  selector: 'app-empresatransporte',
  templateUrl: './empresatransporte-list.component.html',
  styleUrls: ['./empresatransporte-list.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class EmpresaTransporteListComponent implements OnInit {

  constructor(private fb: FormBuilder, private dateUtil: DateUtil,
    private empresaTransporteService: EmpresaTransporteService,
    private spinner: NgxSpinnerService,
    private maestroService: MaestroService,
    private router: Router,
    private excelService: ExcelService,
    private maestroUtil: MaestroUtil) { }

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
  empresaTransporteform: FormGroup;
  
  ngOnInit(): void {
    this.LoadForm();
    this.LoadCombos();
  }

  LoadForm(): void {
    this.empresaTransporteform = this.fb.group({
      nombreRazonSocial: ['', ''],
      ruc: ['', ''],
      estado: ['', '']
    });
  }

  get f() {
    return this.empresaTransporteform.controls;
  }

  LoadCombos(): void {
    this.GetListEstado();
   
  }

 
  async GetListProducto() {
    let form = this;
    let res = await this.maestroService.obtenerMaestros('Producto').toPromise();
    if (res.Result.Success) {
      form.listProducto = res.Result.Data;
    }
  }
  changeProduct(event: any): void {
    let form = this;
    if (event) {
      this.maestroUtil.obtenerMaestros("SubProducto", function (res) {
        if (res.Result.Success) {
          if (res.Result.Data.length > 0) {
            form.listSubProducto = res.Result.Data.filter(x => x.Val1 == event.Codigo);
          } else {
            form.listSubProducto = [];
          }
        }
      });
    } else {
      form.listSubProducto = [];
    }
  }


  async GetListEstado() {
    let res = await this.maestroService.obtenerMaestros('EstadoMaestro').toPromise();
    if (res.Result.Success) {
      this.listEstado= res.Result.Data;
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
        RazonSocial: this.empresaTransporteform.value.nombreRazonSocial,
        Ruc: this.empresaTransporteform.value.ruc,
        EstadoId: this.empresaTransporteform.value.estado,
        EmpresaId: 1
    };
  }

  Search(): void {
    if (!this.empresaTransporteform.invalid && !this.errorGeneral.isError) {
      this.spinner.show();
      const request = this.getRequest();
      this.empresaTransporteService.Consultar(request).subscribe((res: any) => {
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
    this.router.navigate(['/acopio/operaciones/empresatransporte-edit']);
  }

}
