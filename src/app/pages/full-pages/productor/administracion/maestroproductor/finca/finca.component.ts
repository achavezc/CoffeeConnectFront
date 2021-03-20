import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { DatatableComponent } from "@swimlane/ngx-datatable";

import { ProductorFincaService } from '../../../../../../services/productor-finca.service';
import { ProductorService } from '../../../../../../services/productor.service';

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
    private spinner: NgxSpinnerService) { }

  fincaForm: FormGroup;
  vId: number;
  rows = [];
  tempRows = [];
  limitRef = 10;
  @ViewChild(DatatableComponent) table: DatatableComponent;

  ngOnInit(): void {
    this.vId = this.route.snapshot.params['id'] ? parseInt(this.route.snapshot.params['id']) : 0;
    if (this.vId > 0) {
      this.LoadForm();
      this.LoadDataForm();
    } else {

    }
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
    this.router.navigate(['/productor/administracion/productor/finca/create'],
      { queryParams: { codProductor: this.vId } });
  }

  Cancel(): void {
    this.router.navigate(['/productor/administracion/productor/list']);
  }
}
