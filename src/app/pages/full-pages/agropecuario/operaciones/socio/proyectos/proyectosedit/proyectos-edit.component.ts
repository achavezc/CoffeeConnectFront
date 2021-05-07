import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import swal from 'sweetalert2';
import { NgxSpinnerService } from "ngx-spinner";

import { DateUtil } from '../../../../../../../services/util/date-util';
import { MaestroService } from '../../../../../../../services/maestro.service';
import { SocioProyectoService } from '../../../../../../../services/socio-proyecto.service';
import { AlertUtil } from '../../../../../../../services/util/alert-util';

@Component({
  selector: 'app-proyectos-edit',
  templateUrl: './proyectos-edit.component.html',
  styleUrls: ['./proyectos-edit.component.scss']
})
export class ProyectosEditComponent implements OnInit {

  proyectosEditForm: FormGroup;
  listProyectos: any[];
  listEstados: any[];
  listMonedas: any[];
  listUnidadMedida: any[];
  listTipos: any[];
  listRequirements: any[];
  selectedProyecto: any;
  selectedEstado: any;
  selectedMoneda: any;
  selectedUnidadMedida: any;
  selectedRequirements: any;
  selectedTipo: any;
  flagAgroBanco = true;
  flagAgroRural = true;
  flagDevida = true;
  flagInia = true;
  flagAgroideas = true;
  vCodePartner: number;
  vCodeProject: number;
  vSession: any;
  vMsgGenerico = 'Ocurrio un error interno.';
  vMsgGeneral = { isError: false, msgError: '' };

  constructor(private fb: FormBuilder,
    private dateUtil: DateUtil,
    private maestroServicio: MaestroService,
    private route: ActivatedRoute,
    private router: Router,
    private socioProyectoService: SocioProyectoService,
    private spinner: NgxSpinnerService,
    private alertUtil: AlertUtil) { }

  ngOnInit(): void {
    this.vCodePartner = this.route.snapshot.params["partner"] ? Number(this.route.snapshot.params["partner"]) : 0;
    this.vCodeProject = this.route.snapshot.params["project"] ? Number(this.route.snapshot.params["project"]) : 0;
    this.vSession = JSON.parse(localStorage.getItem("user"));
    this.LoadForm();
    this.AddRequiredConditionals();
    // this.proyectosEditForm.controls.fechaIniPrimerDesembolso.setValue(this.dateUtil.currentDate());
    // this.proyectosEditForm.controls.fechaFinPrimerDesembolso.setValue(this.dateUtil.currentDate());
    // this.proyectosEditForm.controls.fechaInicioSegundoDesembolso.setValue(this.dateUtil.currentDate());
    // this.proyectosEditForm.controls.fechaFinSegundoDesembolso.setValue(this.dateUtil.currentDate());
    // this.proyectosEditForm.controls.fechaCobroPrimerDesembolso.setValue(this.dateUtil.currentDate());
    // this.proyectosEditForm.controls.fechaCobroSegundoDesembolso.setValue(this.dateUtil.currentDate());
    // this.proyectosEditForm.controls.fechaInicioCapacitacion.setValue(this.dateUtil.currentDate());
    // this.proyectosEditForm.controls.fechaFinCapacitacion.setValue(this.dateUtil.currentDate());
    this.LoadDropDowns();
    if (this.vCodeProject <= 0) {
      this.proyectosEditForm.controls.fechaRegistro.setValue(this.dateUtil.currentDate());
    } else {

    }
  }

  LoadForm(): void {
    this.proyectosEditForm = this.fb.group({
      idSocioProyecto: [],
      idEmpresa: [],
      orgIntermediaria: [],
      fechaRegistro: [],
      proyecto: [, Validators.required],
      estado: [, Validators.required],
      moneda: [],
      monto: [],
      periodoDesde: [],
      periodoHasta: [],
      nroHectareas: [],
      montoPrimerDesembolso: [],
      fechaIniPrimerDesembolso: [],
      fechaFinPrimerDesembolso: [],
      fechaCobroPrimerDesembolso: [],
      cobradoPrimerDesembolso: [],
      montoSegundoDesembolso: [],
      fechaInicioSegundoDesembolso: [],
      fechaFinSegundoDesembolso: [],
      cobradoSegundoDesembolso: [],
      fechaCobroSegundoDesembolso: [],
      unidadMedida: [],
      tipoInsumo: [],
      cantidadInsumo: [],
      cantInsumoEntregado: [],
      totalXEntregar: [],
      cantInsumoPedidoFinal: [],
      fechaInicioCapacitacion: [],
      fechaFinCapacitacion: [],
      obsCapacitacion: [],
      adopcionTecnologias: [],
      requisitos: []
    });
  }

  get f() {
    return this.proyectosEditForm.controls;
  }

  LoadDropDowns(): void {
    this.LoadProjects();
    this.LoadStates();
    this.LoadCurrencys();
    this.LoadUnidadMedida();
    this.LoadTipos();
    this.LoadRequirements();
  }

  async LoadProjects() {
    const res = await this.maestroServicio.obtenerMaestros('Proyecto').toPromise();
    if (res.Result.Success) {
      this.listProyectos = res.Result.Data;
    }
  }

  async LoadStates() {
    const res = await this.maestroServicio.obtenerMaestros('EstadoMaestro').toPromise();
    if (res.Result.Success) {
      this.listEstados = res.Result.Data;
      if (this.vCodeProject <= 0) {
        this.proyectosEditForm.controls.estado.setValue('01');
      }
    }
  }

  async LoadCurrencys() {
    const res = await this.maestroServicio.obtenerMaestros('Moneda').toPromise();
    if (res.Result.Success) {
      this.listMonedas = res.Result.Data;
    }
  }

  async LoadUnidadMedida() {
    const res = await this.maestroServicio.obtenerMaestros('UnidadMedida').toPromise();
    if (res.Result.Success) {
      this.listUnidadMedida = res.Result.Data;
    }
  }

  async LoadTipos() {
    const res = await this.maestroServicio.obtenerMaestros('InsumosProyecto').toPromise();
    if (res.Result.Success) {
      this.listTipos = res.Result.Data;
    }
  }

  async LoadRequirements() {
    const res = await this.maestroServicio.obtenerMaestros('RequisitosProyecto').toPromise();
    if (res.Result.Success) {
      this.listRequirements = res.Result.Data;
    }
  }

  ChangeProject(event: any): void {
    this.flagAgroBanco = true;
    this.flagAgroRural = true;
    this.flagDevida = true;
    this.flagAgroideas = true;
    this.flagInia = true;

    if (event.Codigo === '01') {
      this.flagAgroRural = false;
      this.flagDevida = false;
    } else if (event.Codigo === '02') {
      this.flagAgroideas = false;
    } else if (event.Codigo === '03') {
      this.flagAgroBanco = false;
    } else if (event.Codigo === '05') {
      this.flagAgroRural = false;
      this.flagDevida = false;
      this.flagInia = false;
    } else if (event.Codigo === '04') {
      this.flagInia = false;
      this.flagDevida = false;
    }
  }

  AddRequiredConditionals(): void {
    const money = this.proyectosEditForm.controls.moneda;
    const monto = this.proyectosEditForm.controls.monto;
    const periodoDesde = this.proyectosEditForm.controls.periodoDesde;
    const periodoHasta = this.proyectosEditForm.controls.periodoHasta;
    const cantHectareas = this.proyectosEditForm.controls.nroHectareas;
    const uniMedida = this.proyectosEditForm.controls.unidadMedida;
    const tipo = this.proyectosEditForm.controls.tipoInsumo;
    const totalEntregar = this.proyectosEditForm.controls.cantidadInsumo

    this.proyectosEditForm.controls.proyecto.valueChanges.subscribe((p: any) => {
      if (p === '03') {
        money.setValidators(Validators.required);
        monto.setValidators(Validators.required);
        periodoDesde.setValidators(Validators.required);
        periodoHasta.setValidators(Validators.required);
        cantHectareas.setValidators(Validators.required);
        uniMedida.clearValidators();
        tipo.clearValidators();
        totalEntregar.clearValidators();
      } else if (p === '01' || p === '05') {
        uniMedida.setValidators(Validators.required);
        tipo.setValidators(Validators.required);
        totalEntregar.setValidators(Validators.required);
        money.clearValidators();
        monto.clearValidators();
        periodoDesde.clearValidators();
        periodoHasta.clearValidators();
        cantHectareas.clearValidators();
      }
      money.updateValueAndValidity();
      monto.updateValueAndValidity();
      periodoDesde.updateValueAndValidity();
      periodoHasta.updateValueAndValidity();
      cantHectareas.updateValueAndValidity();
      uniMedida.updateValueAndValidity();
      tipo.updateValueAndValidity();
      totalEntregar.updateValueAndValidity();
    });
  }

  GetRequest(): any {
    const form = this.proyectosEditForm.value;
    const request = {
      SocioProyectoId: form.idSocioProyecto ? form.idSocioProyecto : 0,
      EmpresaId: this.vSession.Result.Data.EmpresaId,
      OrganizacionProyectoAnterior: form.fechaRegistro ? form.fechaRegistro : '',
      FechaProyectoAnterior: form.orgIntermediaria ? form.orgIntermediaria : null,
      ProyectoId: form.proyecto ? form.proyecto : '',
      MonedaId: form.moneda ? form.moneda : '',
      Monto: form.monto ? form.monto : 0,
      PeriodoDesde: form.periodoDesde ? form.periodoDesde : null,
      PeriodoHasta: form.periodoHasta ? form.periodoHasta : null,
      CantidadHectareas: form.nroHectareas ? form.nroHectareas : null,
      MontoPrimerDesembolso: form.montoPrimerDesembolso ? form.montoPrimerDesembolso : null,
      FechaInicioPrimerDesembolso: form.fechaIniPrimerDesembolso ? form.fechaIniPrimerDesembolso : null,
      FechaFinPrimerDesembolso: form.fechaFinPrimerDesembolso ? form.fechaFinPrimerDesembolso : null,
      CobradoPrimerDesembolso: form.cobradoPrimerDesembolso == true ? true : false,
      FechaCobroPrimerDesembolso: form.fechaCobroPrimerDesembolso ? form.fechaCobroPrimerDesembolso : null,
      MontoSegundoDesembolso: form.montoSegundoDesembolso ? form.montoSegundoDesembolso : null,
      FechaInicioSegundoDesembolso: form.fechaInicioSegundoDesembolso ? form.fechaInicioSegundoDesembolso : null,
      FechaFinSegundoDesembolso: form.fechaFinSegundoDesembolso ? form.fechaFinSegundoDesembolso : null,
      CobradoSegundoDesembolso: form.cobradoSegundoDesembolso == true ? true : false,
      FechaCobroSegundoDesembolso: form.fechaCobroSegundoDesembolso ? form.fechaCobroSegundoDesembolso : null,
      UnidadMedidaId: form.unidadMedida ? form.unidadMedida : '',
      TipoInsumoId: form.tipoInsumo ? form.tipoInsumo : '',
      CantidadInsumo: form.cantidadInsumo ? form.cantidadInsumo : null,
      CantidadInsumoEntregado: form.cantInsumoEntregado ? form.cantInsumoEntregado : null,
      CantidadInsumoPedidoFinal: form.cantInsumoPedidoFinal ? form.cantInsumoPedidoFinal : null,
      ObservacionCapacitacion: form.obsCapacitacion ? form.obsCapacitacion : '',
      FechaInicioCapacitacion: form.fechaInicioCapacitacion ? form.fechaInicioCapacitacion : null,
      FechaFinCapacitacion: form.fechaFinCapacitacion ? form.fechaFinCapacitacion : null,
      AdopcionTecnologias: form.adopcionTecnologias == true ? true : false,
      Requisitos: form.requisitos ? form.requisitos.join('|') : '',
      Usuario: this.vSession.Result.Data.NombreUsuario
    }
    return request;
  }

  Save(): void {
    if (!this.proyectosEditForm.invalid) {
      const form = this;
      if (this.vCodeProject <= 0) {
        swal.fire({
          title: 'Confirmación',
          text: `¿Está seguro de continuar con la creación del nuevo proyecto?.`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#2F8BE6',
          cancelButtonColor: '#F55252',
          confirmButtonText: 'Si',
          customClass: {
            confirmButton: 'btn btn-primary',
            cancelButton: 'btn btn-danger ml-1'
          },
          buttonsStyling: false,
        }).then((result) => {
          if (result.value) {
            form.Create();
          }
        });
      } else if (this.vCodeProject > 0) {
        swal.fire({
          title: 'Confirmación',
          text: `¿Está seguro de continuar con la modificación del proyecto?.`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#2F8BE6',
          cancelButtonColor: '#F55252',
          confirmButtonText: 'Si',
          customClass: {
            confirmButton: 'btn btn-primary',
            cancelButton: 'btn btn-danger ml-1'
          },
          buttonsStyling: false,
        }).then((result) => {
          if (result.value) {
            form.Update();
          }
        });
      }
    }
  }

  Create(): void {
    this.spinner.show();
    const request = this.GetRequest();
    this.socioProyectoService.Create(request).subscribe((res: any) => {
      this.spinner.hide();
      if (res.Result.Success) {
        this.vMsgGeneral = { isError: false, msgError: '' };
        this.alertUtil.alertOkCallback('Confirmación!', 'Proyecto creado exitosamente.',
          () => {
            this.Cancel();
          });
      } else {
        this.vMsgGeneral = { isError: true, msgError: res.Result.Message };
      }
    }, (err: any) => {
      console.log(err);
      this.spinner.hide();
      this.vMsgGeneral = { isError: true, msgError: this.vMsgGenerico };
    });
  }

  Update(): void {

  }

  Cancel(): void {
    this.router.navigate([`/agropecuario/operaciones/socio/proyectos/list/${this.vCodePartner}`]);
  }
}
