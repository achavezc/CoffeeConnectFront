import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ActivatedRoute,Router } from '@angular/router';
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { DateUtil } from '../../../../../../services/util/date-util';
import { TransporteService } from '../../../../../../services/transporte.service';
import {AuthService} from './../../../../../../services/auth.service';

@Component({
  selector: 'app-transporte',
  templateUrl: './transporte-list.component.html',
  styleUrls: ['./transporte-list.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TransporteListComponent implements OnInit {

  constructor(private fb: FormBuilder, private dateUtil: DateUtil,
    private transporteService: TransporteService,
    private spinner: NgxSpinnerService,
    private route: ActivatedRoute,
    private router: Router,
    private authService : AuthService) { }

  @ViewChild(DatatableComponent) table: DatatableComponent;

  selected = [];
  limitRef: number = 10;
  rows = [];
  tempData = [];
  errorGeneral = { isError: false, msgError: '' };
  msgErrorGenerico = 'Ocurrio un error interno.';
  error: any = { isError: false, errorMessage: '' };
  submitted = false;
  idEmpresaTransporte = 0;
  readonly: boolean;
  vSessionUser: any;
  
  ngOnInit(): void {
    this.route.queryParams
    .subscribe(params => {
        if (Number(params.idEmpresaTransporte)) {
            this.idEmpresaTransporte = Number(params.idEmpresaTransporte);
            this.Search();
        }
    });
    this.vSessionUser = JSON.parse(localStorage.getItem('user'));
    this.readonly= this.authService.esReadOnly(this.vSessionUser.Result.Data.OpcionesEscritura);
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
        EmpresaTransporteId: this.idEmpresaTransporte,
    };
  }

  Search(): void {
      this.spinner.show();
      const request = this.getRequest();
      this.transporteService.Consultar(request).subscribe((res: any) => {
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
  
  }

  Buscar(): void {
    this.Search();
  }

  Cancelar(): void {
    this.router.navigate(['/acopio/operaciones/empresatransporte-edit'], { queryParams: { id: this.idEmpresaTransporte } });
  }
  
  Nuevo(): void {
    this.router.navigate(['/acopio/operaciones/transporte-edit'], { queryParams: { idEmpresaTransporte: this.idEmpresaTransporte } });
  }

}
