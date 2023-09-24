import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import {AuthService} from './../../../../../../services/auth.service';
import { ProductorFincaService } from '../../../../../../services/productor-finca.service';
import { ProductorService } from '../../../../../../services/productor.service';
import { HeaderExcel } from '../../../../../../services/models/headerexcel.model';
import { ExcelService } from '../../../../../../shared/util/excel.service';

@Component({
  selector: 'app-finca',
  templateUrl: './finca.component.html',
  styleUrls: ['./finca.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FincaComponent implements OnInit {

  constructor(private router: Router,
    private route: ActivatedRoute,
    private productorFincaService: ProductorFincaService,
    private productorService: ProductorService,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private excelService: ExcelService,
    private authService : AuthService) { }

  fincaForm: FormGroup;
  vId: number;
  rows = [];
  tempRows = [];
  limitRef = 10;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  nameProductor : any;
  readonly: boolean;
  vSessionUser: any;

  ngOnInit(): void {
    this.vId = this.route.snapshot.params['id'] ? parseInt(this.route.snapshot.params['id']) : 0;
    this.nameProductor = this.route.snapshot.params['title'];
    if (this.vId > 0) {
      this.LoadForm();
      this.LoadDataForm();
    } else {

    }
    this.vSessionUser = JSON.parse(localStorage.getItem('user'));
    ////this.readonly= this.authService.esReadOnly(this.vSessionUser.Result.Data.OpcionesEscritura);
  }

  filterUpdate(event: any): void {
    const val = event.target.value.toLowerCase();
    const temp = this.tempRows.filter(function (d) {
      return d.Numero.toLowerCase().indexOf(val) !== -1 || !val;
    });
    this.rows = temp;
    this.table.offset = 0;
  }

  updateLimit(event: any): void {
    this.limitRef = event.target.value;
  }

  LoadForm(): void {
    this.fincaForm = this.fb.group({
      codProductor: [],
      nombreRazonSocial: []
    });
  }

  async LoadDataForm() {
    this.spinner.show();
    const request = { ProductorId: this.vId };
    const resSearchById = await this.productorService.SearchById(request).toPromise();
    if (resSearchById.Result.Success) {
      this.fincaForm.controls.codProductor.setValue(resSearchById.Result.Data.Numero);
      this.fincaForm.controls.nombreRazonSocial.setValue(resSearchById.Result.Data.NombreRazonSocial);
    }

    const resSearchProducerById = await this.productorFincaService.SearchProducerById(request).toPromise();
    if (resSearchProducerById.Result.Success) {
      this.tempRows = resSearchProducerById.Result.Data;
      this.rows = resSearchProducerById.Result.Data;
    }
    this.spinner.hide();
  }

  New(): void {
    this.router.navigate(['/productor/administracion/productor/finca/create', {title: this.nameProductor}],
      { queryParams: { codProductor: this.vId } });
  }

  Export(): void {
    this.spinner.show();
    const request = { ProductorId: this.vId };
    this.productorFincaService.SearchProducerById(request)
      .subscribe((res: any) => {
        this.spinner.hide();
        if (res.Result.Success) {
          const vArrHeaderExcel: HeaderExcel[] = [
            new HeaderExcel("Nombre"),
            new HeaderExcel("Departamento"),
            new HeaderExcel("Provincia"),
            new HeaderExcel("Distrito"),
            new HeaderExcel("Zona"),
            new HeaderExcel("Estado")
          ];

          let vArrData: any[] = [];
          for (let i = 0; i < res.Result.Data.length; i++) {
            vArrData.push([
              res.Result.Data[i].Nombre,
              res.Result.Data[i].Departamento,
              res.Result.Data[i].Provincia,
              res.Result.Data[i].Distrito,
              res.Result.Data[i].Zona,
              res.Result.Data[i].Estado
            ]);
          }
          this.excelService.ExportJSONAsExcel(vArrHeaderExcel, vArrData, 'Productor_Fincas');
        } else {

        }
      }, (err: any) => {
        console.log(err);
        this.spinner.hide();
      });
  }

  Cancel(): void {
    this.router.navigate(['/productor/administracion/productor/list']);
  }
}
