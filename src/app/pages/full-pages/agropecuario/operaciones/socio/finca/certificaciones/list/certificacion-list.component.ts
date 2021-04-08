import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ValidatorFn, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { CertificacionService } from '../../../../../../../../services/certificacion.service';
import { AlertUtil } from '../../../../../../../../services/util/alert-util';

@Component({
  selector: 'app-certificacion-list',
  templateUrl: './certificacion-list.component.html',
  styleUrls: ['./certificacion-list.component.scss']
})
export class CertificacionListComponent implements OnInit {

  constructor(private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private certificacionService: CertificacionService,
    private alertUtil: AlertUtil,
    private router: Router
    ) { }
  certificacionForm: FormGroup;
  limitRef = 10;
  rows = [];
  vId : Number = 0; 
  tempRows = [];
  objParams: any;
  vMsgErrGenerico = "Ha ocurrido un error interno.";
  selected = [];
  

  ngOnInit(): void {
  
    this.route.queryParams.subscribe((params) => {
      if (params) {
      // this.LoadForm();
        if (params.SocioFincaId != null) {
          this.vId = Number(params.SocioFincaId);
          this.SearchCertificacionesById();
        } 
      }
    });
  }

  SearchCertificacionesById(): void {
    this.spinner.show();
    this.certificacionService.SearchCertificacionById({ SocioFincaId: this.vId })
      .subscribe((res: any) => {
        this.spinner.hide();
        if (res.Result.Success) {
          this.tempRows = res.Result.Data;
          this.rows = this.tempRows;
        } else {
          this.alertUtil.alertError("ERROR!", res.Result.Message);
        }
      }, (err: any) => {
        console.log(err);
        this.spinner.hide();
        this.alertUtil.alertError("ERROR!", this.vMsgErrGenerico);
      });
  }

  updateLimit(event: any): void {

  }

  filterUpdate(event: any): void {

  }
  onSelectCheck(row: any) {
    return this.selected.indexOf(row) === -1;
  }

  New(){
    this.router.navigate([`/agropecuario/operaciones/socio/finca/certificaciones/create`], { queryParams: { SocioFincaId: this.vId}})
  }
}
