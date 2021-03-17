import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ValidatorFn, ValidationErrors } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';

import { MaestroUtil } from '../../../../../../services/util/maestro-util';
import { DateUtil } from '../../../../../../services/util/date-util';
import { AlertUtil } from '../../../../../../services/util/alert-util';
import { SocioService } from '../../../../../../services/socio.service';
import { SocioFincaService } from '../../../../../../services/socio-finca.service';

@Component({
  selector: 'app-finca',
  templateUrl: './finca.component.html',
  styleUrls: ['./finca.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FincaComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private maestroUtil: MaestroUtil,
    private dateUtil: DateUtil,
    private spinner: NgxSpinnerService,
    private alertUtil: AlertUtil,
    private socioService: SocioService,
    private router: Router,
    private socioFincaService: SocioFincaService,
    private route: ActivatedRoute) { }

  fincaSocioForm: FormGroup;
  limitRef = 10;
  rows = [];
  tempRows = [];
  vId: number;
  @ViewChild(DatatableComponent) table: DatatableComponent;

  ngOnInit(): void {
    this.vId = this.route.snapshot.params['id'] ? parseInt(this.route.snapshot.params['id']) : 0
    this.LoadForm();
    if (this.vId > 0) {
      this.SearchSocioById();
    } else {

    }
  }

  LoadForm(): void {
    this.fincaSocioForm = this.fb.group({
      codSocio: [],
      nombreRazonSocial: []
    });
  }

  updateLimit(event: any): void {

  }

  filterUpdate(event: any): void {

  }

  SearchSocioById(): void {
    this.spinner.show();
    this.socioFincaService.SearchSocioById({ SocioId: this.vId })
      .subscribe((res: any) => {
        this.spinner.hide();
        if (res.Result.Success) {
          this.tempRows = res.Result.Data;
          this.rows = this.tempRows;
        }
      }, (err: any) => {
        console.log(err);
        this.spinner.hide();
      });
  }

  New(): void {
    this.router.navigate(['/agropecuario/operaciones/socio/finca/create']);
  }

  Delete(): void {

  }

  Certifications(): void {

  }

  Inspections(): void {

  }

  Diagnosis(): void {

  }

  Cancel(): void {
    this.router.navigate(['/agropecuario/operaciones/socio/list']);
  }

}
