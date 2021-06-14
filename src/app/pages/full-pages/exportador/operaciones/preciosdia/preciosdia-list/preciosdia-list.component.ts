import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { DateUtil } from '../../../../../../services/util/date-util';
import { ProductoPrecioDiaService } from '../../../../../../services/preciosdia.service';
import { MaestroService } from '../../../../../../services/maestro.service';
import { ExcelService } from '../../../../../../shared/util/excel.service';
import { MaestroUtil } from '../../../../../../services/util/maestro-util';

@Component({
  selector: 'app-preciosdia',
  templateUrl: './preciosdia-list.component.html',
  styleUrls: ['./preciosdia-list.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PreciosDiaComponent implements OnInit {

  constructor(private fb: FormBuilder, private dateUtil: DateUtil,
    private preciodia: ProductoPrecioDiaService,
    private spinner: NgxSpinnerService,
    private maestroService: MaestroService,
    private router: Router,
    private excelService: ExcelService,
    private maestroUtil: MaestroUtil) { }

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

  ngOnInit(): void {
    this.LoadForm();
    this.LoadCombos();
    this.preciosdiaform.controls['fechaInicio'].setValue(this.dateUtil.currentMonthAgo());
    this.preciosdiaform.controls['fechaFin'].setValue(this.dateUtil.currentDate());
  }

  LoadForm(): void {
    this.preciosdiaform = this.fb.group({
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
      producto: ['', ''],
      subproducto: ['', ''],
      estado: ['', Validators.required]
    });
  }

  get f() {
    return this.preciosdiaform.controls;
  }

  LoadCombos(): void {
    this.GetListProducto();
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
      this.listEstado = res.Result.Data;
    }
  }

  compareTwoDates() {
    var anioFechaInicio = new Date(this.preciosdiaform.controls['fechaInicio'].value).getFullYear()
    var anioFechaFin = new Date(this.preciosdiaform.controls['fechaFin'].value).getFullYear()

    if (new Date(this.preciosdiaform.controls['fechaFin'].value) < new Date(this.preciosdiaform.controls['fechaInicio'].value)) {
      this.error = { isError: true, errorMessage: 'La fecha fin no puede ser anterior a la fecha inicio' };
      this.preciosdiaform.controls['fechaFin'].setErrors({ isError: true })
    } else if (this.dateUtil.restarAnio(anioFechaInicio, anioFechaFin) > 2) {
      this.error = { isError: true, errorMessage: 'El Rango de fechas no puede ser mayor a 2 años' };
      this.preciosdiaform.controls['fechaFin'].setErrors({ isError: true })
    } else {
      this.error = { isError: false, errorMessage: '' };
    }
  }

  compareFechas() {
    var anioFechaInicio = new Date(this.preciosdiaform.controls['fechaInicio'].value).getFullYear()
    var anioFechaFin = new Date(this.preciosdiaform.controls['fechaFin'].value).getFullYear()
    if (new Date(this.preciosdiaform.controls['fechaInicio'].value) > new Date(this.preciosdiaform.controls['fechaFin'].value)) {
      this.errorFecha = { isError: true, errorMessage: 'La fecha inicio no puede ser mayor a la fecha fin' };
      this.preciosdiaform.controls['fechaInicio'].setErrors({ isError: true })
    } else if (this.dateUtil.restarAnio(anioFechaInicio, anioFechaFin) > 2) {
      this.errorFecha = { isError: true, errorMessage: 'El Rango de fechas no puede ser mayor a 2 años' };
      this.preciosdiaform.controls['fechaInicio'].setErrors({ isError: true })
    } else {
      this.errorFecha = { isError: false, errorMessage: '' };
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
      ProductoId: this.preciosdiaform.value.producto ?? '',
      SubProductoId: this.preciosdiaform.value.subproducto ?? '',
      EstadoId: this.preciosdiaform.value.estado ?? '',
      FechaInicio: this.preciosdiaform.value.fechaInicio ?? '',
      FechaFin: this.preciosdiaform.value.fechaFin ?? '',
      EmpresaId: 1
    };
  }

  Search(): void {
    if (!this.preciosdiaform.invalid && !this.errorGeneral.isError) {
      this.spinner.show();
      const request = this.getRequest();
      this.preciodia.Consultar(request).subscribe((res: any) => {
        this.spinner.hide();
        if (res.Result.Success) {
          res.Result.Data.forEach(x => {
            x.FechaRegistro = this.dateUtil.formatDate(new Date(x.FechaRegistro));
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
    this.router.navigate(['/exportador/operaciones/preciosdia/create']);
  }

}
