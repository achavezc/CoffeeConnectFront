import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";

import { DiagnosticoService } from '../../../../../../../services/diagnostico.service';
import { DateUtil } from '../../../../../../../services/util/date-util';
import { MaestroUtil } from '../../../../../../../services/util/maestro-util';

@Component({
  selector: 'app-diagnostico',
  templateUrl: './diagnostico.component.html',
  styleUrls: ['./diagnostico.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DiagnosticoComponent implements OnInit {

  socioFincaDiagnosticoForm: FormGroup;
  listEstados = [];
  selectedEstado: any;
  errorGeneral = { isError: false, errorMessage: '' };
  limitRef = 10;
  rows = [];
  selected = [];
  userSession: any;
  codePartner: Number;
  codeProducer: Number;
  codeFincaPartner: Number;
  msgErrGenerico = "Ha ocurrido un error interno.";

  constructor(private fb: FormBuilder,
    private diagnosticoService: DiagnosticoService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private route: ActivatedRoute,
    private dateUtil: DateUtil,
    private maestroUtil: MaestroUtil) { }

  ngOnInit(): void {
    this.userSession = JSON.parse(localStorage.getItem('user'));
    this.codePartner = this.route.snapshot.params['partner'] ? parseInt(this.route.snapshot.params['partner']) : 0
    this.codeProducer = this.route.snapshot.params['producer'] ? parseInt(this.route.snapshot.params['producer']) : 0
    this.codeFincaPartner = this.route.snapshot.params['fincapartner'] ? parseInt(this.route.snapshot.params['fincapartner']) : 0
    this.LoadForm();
    this.socioFincaDiagnosticoForm.controls.fechaInicio.setValue(this.dateUtil.currentMonthAgo());
    this.socioFincaDiagnosticoForm.controls.fechaFinal.setValue(this.dateUtil.currentDate());
  }

  LoadForm(): void {
    this.socioFincaDiagnosticoForm = this.fb.group({
      nroFicha: [''],
      fechaInicio: ['', Validators.required],
      fechaFinal: ['', Validators.required],
      estado: [, Validators.required]
    });
    this.LoadStatus();
  }

  get f() {
    return this.socioFincaDiagnosticoForm.controls;
  }

  LoadStatus(): void {
    this.maestroUtil.obtenerMaestros('EstadoMaestro', (res: any) => {
      if (res.Result.Success) {
        this.listEstados = res.Result.Data;
      }
    });
  }

  updateLimit(e: any) {

  }

  filterUpdate(e: any) {

  }

  GetRequest(): any {
    const request = {
      Numero: this.socioFincaDiagnosticoForm.value.nroFicha,
      EstadoId: this.socioFincaDiagnosticoForm.value.estado,
      EmpresaId: this.userSession.Result.Data.EmpresaId,
      FechaInicio: this.socioFincaDiagnosticoForm.value.fechaInicio,
      FechaFin: this.socioFincaDiagnosticoForm.value.fechaFinal
    }
    return request;
  }

  Buscar(): void {
    if (!this.socioFincaDiagnosticoForm.invalid) {
      this.spinner.show();
      this.errorGeneral = { isError: false, errorMessage: '' };
      const request = this.GetRequest();
      this.diagnosticoService.Search(request)
        .subscribe((res: any) => {
          this.spinner.hide();
          if (res.Result.Success) {
            res.Result.Data.forEach((obj: any) => {
              obj.FechaRegistroString = this.dateUtil.formatDate(new Date(obj.FechaRegistro));
            });
            this.rows = res.Result.Data;
          } else {
            this.errorGeneral = { isError: true, errorMessage: res.Result.Message };
          }
        }, (err: any) => {
          console.log(err);
          this.errorGeneral = { isError: true, errorMessage: this.msgErrGenerico };
          this.spinner.hide();
        });
    }
  }

  New(): void {
    this.router.navigate([`/agropecuario/operaciones/socio/finca/diagnostico/create/${this.codePartner}/${this.codeProducer}/${this.codeFincaPartner}`]);
  }

  Cancel(): void {
    this.router.navigate([`/agropecuario/operaciones/socio/finca/list/${this.codePartner}/${this.codeProducer}`]);
  }

}
