import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { DateUtil } from '../../../../../../services/util/date-util';
import { DetalleCatalogoService } from '../../../../../../services/detallecatalogo.service';
import { MaestroService } from '../../../../../../services/maestro.service';
import { ExcelService } from '../../../../../../shared/util/excel.service';
import { MaestroUtil } from '../../../../../../services/util/maestro-util';

@Component({
  selector: 'app-detallecatalogo',
  templateUrl: './detallecatalogo-list.component.html',
  styleUrls: ['./detallecatalogo-list.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DetalleCatalogoComponent implements OnInit {

  constructor(private fb: FormBuilder, private dateUtil: DateUtil,
    private detalleCatalogoService: DetalleCatalogoService,
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
    //this.preciosdiaform.controls['fechaInicio'].setValue(this.dateUtil.currentMonthAgo());
    //this.preciosdiaform.controls['fechaFin'].setValue(this.dateUtil.currentDate());
  }

  LoadForm(): void {
    this.preciosdiaform = this.fb.group({
      //fechaInicio: ['', Validators.required],
      //fechaFin: ['', Validators.required],
      producto: ['', Validators.required],
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
    let res = await this.detalleCatalogoService.ConsultarCatalogoTablas().toPromise();
    if (res.Result.Success) {
      form.listProducto = res.Result.Data;
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
      IdCatalogo: this.preciosdiaform.value.producto ?? '',
      EstadoId: this.preciosdiaform.value.estado ?? '',
      EmpresaId: 1
    };
  }

  Search(): void {
    if (!this.preciosdiaform.invalid && !this.errorGeneral.isError) {
      this.spinner.show();
      const request = this.getRequest();
      this.detalleCatalogoService.Consultar(request).subscribe((res: any) => {
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
    this.router.navigate(['/acopio/operaciones/detallecatalogo-edit']);
  }

}
