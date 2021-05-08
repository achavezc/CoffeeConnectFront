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
    this.LoadDropDowns();
    if (this.vCodeProject <= 0) {
      this.proyectosEditForm.controls.fechaRegistro.setValue(this.dateUtil.currentDate());
    } else {
      this.GetProjectById();
    }
  }

  LoadForm(): void {
    this.proyectosEditForm = this.fb.group({
      idSocioProyecto: [],
      idSocio: [],
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

  ResetControlsForm(): void {
    this.proyectosEditForm.controls.moneda.reset();
    this.proyectosEditForm.controls.monto.reset();
    this.proyectosEditForm.controls.periodoDesde.reset();
    this.proyectosEditForm.controls.periodoHasta.reset();
    this.proyectosEditForm.controls.nroHectareas.reset();
    this.proyectosEditForm.controls.montoPrimerDesembolso.reset();
    this.proyectosEditForm.controls.fechaIniPrimerDesembolso.reset();
    this.proyectosEditForm.controls.fechaFinPrimerDesembolso.reset();
    this.proyectosEditForm.controls.fechaCobroPrimerDesembolso.reset();
    this.proyectosEditForm.controls.cobradoPrimerDesembolso.reset();
    this.proyectosEditForm.controls.montoSegundoDesembolso.reset();
    this.proyectosEditForm.controls.fechaInicioSegundoDesembolso.reset();
    this.proyectosEditForm.controls.fechaFinSegundoDesembolso.reset();
    this.proyectosEditForm.controls.cobradoSegundoDesembolso.reset();
    this.proyectosEditForm.controls.fechaCobroSegundoDesembolso.reset();
    this.proyectosEditForm.controls.unidadMedida.reset();
    this.proyectosEditForm.controls.tipoInsumo.reset();
    this.proyectosEditForm.controls.cantidadInsumo.reset();
    this.proyectosEditForm.controls.cantInsumoEntregado.reset();
    this.proyectosEditForm.controls.totalXEntregar.reset();
    this.proyectosEditForm.controls.cantInsumoPedidoFinal.reset();
    this.proyectosEditForm.controls.fechaInicioCapacitacion.reset();
    this.proyectosEditForm.controls.fechaFinCapacitacion.reset();
    this.proyectosEditForm.controls.obsCapacitacion.reset();
    this.proyectosEditForm.controls.adopcionTecnologias.reset();
    this.proyectosEditForm.controls.requisitos.reset();
  }

  ChangeProject(event: any): void {
    this.RefreshFlagsProjects(event.Codigo);
    this.ResetControlsForm();
  }

  RefreshFlagsProjects(Codigo: any): void {
    this.flagAgroBanco = true;
    this.flagAgroRural = true;
    this.flagDevida = true;
    this.flagAgroideas = true;
    this.flagInia = true;

    if (Codigo === '01') {
      this.flagAgroRural = false;
      this.flagDevida = false;
    } else if (Codigo === '02') {
      this.flagAgroideas = false;
    } else if (Codigo === '03') {
      this.flagAgroBanco = false;
    } else if (Codigo === '05') {
      this.flagAgroRural = false;
      this.flagDevida = false;
      this.flagInia = false;
    } else if (Codigo === '04') {
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
      uniMedida.clearValidators();
      tipo.clearValidators();
      totalEntregar.clearValidators();
      money.clearValidators();
      monto.clearValidators();
      periodoDesde.clearValidators();
      periodoHasta.clearValidators();
      cantHectareas.clearValidators();

      if (p === '03') {
        money.setValidators(Validators.required);
        monto.setValidators(Validators.required);
        periodoDesde.setValidators(Validators.required);
        periodoHasta.setValidators(Validators.required);
        cantHectareas.setValidators(Validators.required);
      } else if (p === '01' || p === '05') {
        uniMedida.setValidators(Validators.required);
        tipo.setValidators(Validators.required);
        totalEntregar.setValidators(Validators.required);
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

  CalculateTotalEntregar(): void {
    const totalEntregar = this.proyectosEditForm.value.cantidadInsumo ? this.proyectosEditForm.value.cantidadInsumo : 0;
    const insuEntregado = this.proyectosEditForm.value.cantInsumoEntregado ? this.proyectosEditForm.value.cantInsumoEntregado : 0;
    this.proyectosEditForm.controls.totalXEntregar.setValue(totalEntregar - insuEntregado);
  }

  GetProjectById(): void {
    this.spinner.show();
    this.socioProyectoService.SearchById(this.vCodeProject)
      .subscribe((res: any) => {
        if (res.Result.Success) {
          this.vMsgGeneral = { isError: false, msgError: '' };
          this.AutocompleteForm(res.Result.Data);
        } else {
          this.vMsgGeneral = { isError: true, msgError: res.Result.Message };
        }
      }, (err: any) => {
        console.log(err);
        this.vMsgGeneral = { isError: true, msgError: this.vMsgGenerico };
        this.spinner.hide();
      });
  }

  async AutocompleteForm(data: any) {
    if (data) {
      if (data.SocioProyectoId) {
        this.proyectosEditForm.controls.idSocioProyecto.setValue(data.SocioProyectoId);
      }
      if (data.SocioId) {
        this.proyectosEditForm.controls.idSocio.setValue(data.SocioId);
      }
      if (data.EmpresaId) {
        this.proyectosEditForm.controls.idEmpresa.setValue(data.EmpresaId);
      }
      // this.proyectosEditForm.controls.orgIntermediaria.setValue(data.);
      if (data.FechaRegistro && data.FechaRegistro.substring(0, 10) != "0001-01-01") {
        this.proyectosEditForm.controls.fechaRegistro.setValue(data.FechaRegistro.substring(0, 10));
      }
      if (data.ProyectoId) {
        await this.LoadProjects();
        this.proyectosEditForm.controls.proyecto.setValue(data.ProyectoId);
        this.RefreshFlagsProjects(data.ProyectoId);
      }
      if (data.EstadoId) {
        await this.LoadStates();
        this.proyectosEditForm.controls.estado.setValue(data.EstadoId);
      }
      if (data.MonedaId) {
        await this.LoadCurrencys();
        this.proyectosEditForm.controls.moneda.setValue(data.MonedaId);
      }
      if (data.Monto) {
        this.proyectosEditForm.controls.monto.setValue(data.Monto);
      }
      if (data.PeriodoDesde) {
        this.proyectosEditForm.controls.periodoDesde.setValue(data.PeriodoDesde);
      }
      if (data.PeriodoHasta) {
        this.proyectosEditForm.controls.periodoHasta.setValue(data.PeriodoHasta);
      }
      if (data.CantidadHectareas) {
        this.proyectosEditForm.controls.nroHectareas.setValue(data.CantidadHectareas);
      }
      if (data.MontoPrimerDesembolso) {
        this.proyectosEditForm.controls.montoPrimerDesembolso.setValue(data.MontoPrimerDesembolso);
      }
      if (data.FechaInicioPrimerDesembolso && data.FechaInicioPrimerDesembolso.substring(0, 10) != "0001-01-01") {
        this.proyectosEditForm.controls.fechaIniPrimerDesembolso.setValue(data.FechaInicioPrimerDesembolso.substring(0, 10));
      }
      if (data.FechaFinPrimerDesembolso && data.FechaFinPrimerDesembolso.substring(0, 10) != "0001-01-01") {
        this.proyectosEditForm.controls.fechaFinPrimerDesembolso.setValue(data.FechaFinPrimerDesembolso.substring(0, 10));
      }
      if (data.FechaCobroPrimerDesembolso && data.FechaCobroPrimerDesembolso.substring(0, 10) != "0001-01-01") {
        this.proyectosEditForm.controls.fechaCobroPrimerDesembolso.setValue(data.FechaCobroPrimerDesembolso.substring(0, 10));
      }
      if (data.CobradoPrimerDesembolso) {
        this.proyectosEditForm.controls.cobradoPrimerDesembolso.setValue(data.CobradoPrimerDesembolso);
      }
      if (data.MontoSegundoDesembolso) {
        this.proyectosEditForm.controls.montoSegundoDesembolso.setValue(data.MontoSegundoDesembolso);
      }
      if (data.FechaInicioSegundoDesembolso && data.FechaInicioSegundoDesembolso.substring(0, 10) != "0001-01-01") {
        this.proyectosEditForm.controls.fechaInicioSegundoDesembolso.setValue(data.FechaInicioSegundoDesembolso.substring(0, 10));
      }
      if (data.FechaFinSegundoDesembolso && data.FechaFinSegundoDesembolso.substring(0, 10) != "0001-01-01") {
        this.proyectosEditForm.controls.fechaFinSegundoDesembolso.setValue(data.FechaFinSegundoDesembolso.substring(0, 10));
      }
      if (data.CobradoSegundoDesembolso) {
        this.proyectosEditForm.controls.cobradoSegundoDesembolso.setValue(data.CobradoSegundoDesembolso);
      }
      if (data.FechaCobroSegundoDesembolso && data.FechaCobroSegundoDesembolso.substring(0, 10) != "0001-01-01") {
        this.proyectosEditForm.controls.fechaCobroSegundoDesembolso.setValue(data.FechaCobroSegundoDesembolso.substring(0, 10));
      }
      if (data.UnidadMedidaId) {
        await this.LoadUnidadMedida();
        this.proyectosEditForm.controls.unidadMedida.setValue(data.UnidadMedidaId);
      }
      if (data.TipoInsumoId) {
        await this.LoadTipos();
        this.proyectosEditForm.controls.tipoInsumo.setValue(data.TipoInsumoId);
      }
      if (data.CantidadInsumo) {
        this.proyectosEditForm.controls.cantidadInsumo.setValue(data.CantidadInsumo);
      }
      if (data.CantidadInsumoEntregado) {
        this.proyectosEditForm.controls.cantInsumoEntregado.setValue(data.CantidadInsumoEntregado);
      }
      this.CalculateTotalEntregar();
      // this.proyectosEditForm.controls.totalXEntregar.setValue(data.);
      if (data.CantidadInsumoPedidoFinal) {
        this.proyectosEditForm.controls.cantInsumoPedidoFinal.setValue(data.CantidadInsumoPedidoFinal);
      }
      if (data.FechaInicioCapacitacion && data.FechaInicioCapacitacion.substring(0, 10) != "0001-01-01") {
        this.proyectosEditForm.controls.fechaInicioCapacitacion.setValue(data.FechaInicioCapacitacion.substring(0, 10));
      }
      if (data.FechaFinCapacitacion && data.FechaFinCapacitacion.substring(0, 10) != "0001-01-01") {
        this.proyectosEditForm.controls.fechaFinCapacitacion.setValue(data.FechaFinCapacitacion.substring(0, 10));
      }
      if (data.ObservacionCapacitacion) {
        this.proyectosEditForm.controls.obsCapacitacion.setValue(data.ObservacionCapacitacion);
      }
      if (data.AdopcionTecnologias) {
        this.proyectosEditForm.controls.adopcionTecnologias.setValue(data.AdopcionTecnologias);
      }
      if (data.Requisitos) {
        await this.LoadRequirements();
        this.proyectosEditForm.controls.requisitos.setValue(data.Requisitos.split('|').map(String));
      }
    }
    this.spinner.hide();
  }

  GetRequest(): any {
    const form = this.proyectosEditForm.value;
    const request = {
      SocioProyectoId: form.idSocioProyecto ? form.idSocioProyecto : 0,
      SocioId: this.vCodePartner,
      EmpresaId: this.vSession.Result.Data.EmpresaId,
      OrganizacionProyectoAnterior: form.orgIntermediaria ? form.orgIntermediaria : '',
      FechaProyectoAnterior: null,
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
      Usuario: this.vSession.Result.Data.NombreUsuario,
      EstadoId: form.estado ? form.estado : ''
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
    this.spinner.show();
    const request = this.GetRequest();
    this.socioProyectoService.Update(request).subscribe((res: any) => {
      this.spinner.hide();
      if (res.Result.Success) {
        this.vMsgGeneral = { isError: false, msgError: '' };
        this.alertUtil.alertOkCallback('Confirmación!', 'Proyecto actualizado exitosamente.',
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

  Cancel(): void {
    this.router.navigate([`/agropecuario/operaciones/socio/proyectos/list/${this.vCodePartner}`]);
  }
}
