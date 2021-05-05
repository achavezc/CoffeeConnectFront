import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { DateUtil } from '../../../../../../../services/util/date-util';
import { MaestroService } from '../../../../../../../services/maestro.service';
import { ActivatedRoute, Router } from '@angular/router';

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
  listEstadoPlanDesen1: any[];
  listEstadoPlanDesen2: any[];
  listUnidadMedida: any[];
  listTipos: any[];
  selectedProyecto: any;
  selectedEstado: any;
  selectedMoneda: any;
  selectedEstadoPlanDesen1: any;
  selectedEstadoPlanDesen2: any;
  selectedUnidadMedida: any;
  selectedTipo: any;
  vCodePartner: number;
  vCodeProject: number;

  constructor(private fb: FormBuilder,
    private dateUtil: DateUtil,
    private maestroServicio: MaestroService,
    private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit(): void {
    this.vCodePartner = this.route.snapshot.params["partner"] ? Number(this.route.snapshot.params["partner"]) : 0
    this.vCodeProject = this.route.snapshot.params["project"] ? Number(this.route.snapshot.params["project"]) : 0
    this.LoadForm();
    this.proyectosEditForm.controls.desem1Desde.setValue(this.dateUtil.currentDate());
    this.proyectosEditForm.controls.desem2Desde.setValue(this.dateUtil.currentDate());
    this.proyectosEditForm.controls.desem1Hasta.setValue(this.dateUtil.currentDate());
    this.proyectosEditForm.controls.desem2Hasta.setValue(this.dateUtil.currentDate());
    this.proyectosEditForm.controls.fechaCobro.setValue(this.dateUtil.currentDate());
    this.proyectosEditForm.controls.fechaCobro2.setValue(this.dateUtil.currentDate());
    this.proyectosEditForm.controls.desde.setValue(this.dateUtil.currentDate());
    this.proyectosEditForm.controls.hasta.setValue(this.dateUtil.currentDate());
    this.LoadDropDowns();
  }

  LoadForm(): void {
    this.proyectosEditForm = this.fb.group({
      orgIntermediaria: [],
      fechaRegistro: [],
      proyecto: [],
      estado: [],
      moneda: [],
      monto: [],
      periodo: [],
      nroHectareas: [],
      desem1Monto: [],
      desem1Desde: [],
      desem1Hasta: [],
      fechaCobro: [],
      estadoPlanDesen1: [],
      desem2Monto: [],
      desem2Desde: [],
      desem2Hasta: [],
      estadoPlanDesen2: [],
      fechaCobro2: [],
      fotoCafetal: [],
      expediente: [],
      fotoMantaBeneficioHumedo: [],
      fotoVivienda: [],
      dniActualizado: [],
      tituloPropiedad: [],
      docuTransfeCompraVenta: [],
      certificadoPosesion: [],
      unidadMedida: [],
      tipo: [],
      totalEntregar: [],
      entregados: [],
      totalXEntregar: [],
      pedidoFinal: [],
      desde: [],
      hasta: [],
      txtArea1: [],
      seleccionado: []
    });
  }

  get f() {
    return this.proyectosEditForm.controls;
  }

  LoadDropDowns(): void {
    this.LoadProjects();
    this.LoadUnidadMedida();
    this.LoadTipos();
    this.LoadStates();
  }

  async LoadProjects() {
    const res = await this.maestroServicio.obtenerMaestros('OrganizacionProyectos').toPromise();
    if (res.Result.Success) {
      this.listProyectos = res.Result.Data;
    }
  }

  async LoadStates() {
    const res = await this.maestroServicio.obtenerMaestros('EstadoMaestro').toPromise();
    if (res.Result.Success) {
      this.listEstados = res.Result.Data;
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

  Cancel(): void {
    this.router.navigate([`/agropecuario/operaciones/socio/proyectos/list/${this.vCodePartner}`]);
  }
}
