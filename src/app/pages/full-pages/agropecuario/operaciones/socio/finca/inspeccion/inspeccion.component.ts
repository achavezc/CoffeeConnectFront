import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";
import { ActivatedRoute, Router } from '@angular/router';
import {AuthService} from './../../../../../../../services/auth.service';
import { DateUtil } from '../../../../../../../services/util/date-util';
import { InspeccionInternaService } from '../../../../../../../services/inspeccion-interna.service';
import { MaestroUtil } from '../../../../../../../services/util/maestro-util';

@Component({
  selector: 'app-inspeccion',
  templateUrl: './inspeccion.component.html',
  styleUrls: ['./inspeccion.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class InspeccionComponent implements OnInit {

  socioFincaInspeccionForm: FormGroup;
  listEstados: any[];
  selectedEstado: any;
  errorGeneral = { isError: false, errorMessage: '' };
  selected = [];
  rows = [];
  limitRef = 10;
  msgErrGenerico = "Ha ocurrido un error interno.";
  userSession: any;
  codeFincaPartner: any;
  codePartner: any;
  codeProducer: any;
  readonly: boolean;

  constructor(private fb: FormBuilder,
    private dateUtil: DateUtil,
    private inspeccionInternaService: InspeccionInternaService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private route: ActivatedRoute,
    private maestroUtil: MaestroUtil,
    private authService : AuthService) { }

  ngOnInit(): void {
    this.userSession = JSON.parse(localStorage.getItem('user'));
    this.codePartner = this.route.snapshot.params['partner'] ? parseInt(this.route.snapshot.params['partner']) : 0
    this.codeProducer = this.route.snapshot.params['producer'] ? parseInt(this.route.snapshot.params['producer']) : 0
    this.codeFincaPartner = this.route.snapshot.params['fincapartner'] ? parseInt(this.route.snapshot.params['fincapartner']) : 0
    this.LoadForm();
    this.socioFincaInspeccionForm.controls.fechaInicio.setValue(this.dateUtil.currentMonthAgo());
    this.socioFincaInspeccionForm.controls.fechaFinal.setValue(this.dateUtil.currentDate());
    this.LoadState();
    ////this.readonly= this.authService.esReadOnly(this.userSession.Result.Data.OpcionesEscritura);
  }

  LoadForm() {
    this.socioFincaInspeccionForm = this.fb.group({
      nroFicha: [''],
      fechaInicio: ['', Validators.required],
      fechaFinal: ['', Validators.required],
      estado: ['', Validators.required]
    });
  }

  get f() {
    return this.socioFincaInspeccionForm.controls;
  }

  LoadState(): void {
    this.maestroUtil.obtenerMaestros('EstadoMaestro', (res: any) => {
      if (res.Result.Success) {
        this.listEstados = res.Result.Data;
      }
    });
  }

  GetRequestSearch(): any {
    const request = {
      Numero: this.socioFincaInspeccionForm.value.nroFicha,
      EstadoId: this.socioFincaInspeccionForm.value.estado,
      EmpresaId: this.userSession.Result.Data.EmpresaId,
      SocioFincaId:this.codeFincaPartner,
      FechaInicio: this.socioFincaInspeccionForm.value.fechaInicio,
      FechaFin: this.socioFincaInspeccionForm.value.fechaFinal
    }
    return request;
  }

  Buscar() {
    if (!this.socioFincaInspeccionForm.invalid) {
      this.spinner.show();
      this.errorGeneral = { isError: false, errorMessage: '' };
      const request = this.GetRequestSearch();
      this.inspeccionInternaService.Search(request)
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

  onSelectCheck(row: any) {
    return this.selected.indexOf(row) === -1;
  }

  updateLimit(event: any) {

  }

  filterUpdate(event: any) {

  }

  New() {
    this.router.navigate([`/agropecuario/operaciones/socio/finca/inspeccion/create/${this.codePartner}/${this.codeProducer}/${this.codeFincaPartner}`]);
  }

  Cancel() {
    this.router.navigate([`/agropecuario/operaciones/socio/finca/list/${this.codePartner}/${this.codeProducer}`]);
  }
}
