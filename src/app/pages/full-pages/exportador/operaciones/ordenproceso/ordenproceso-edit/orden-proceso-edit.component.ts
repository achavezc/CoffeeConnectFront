import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { DateUtil } from '../../../../../../services/util/date-util';
import { MaestroService } from '../../../../../../services/maestro.service';

@Component({
  selector: 'app-orden-proceso-edit',
  templateUrl: './orden-proceso-edit.component.html',
  styleUrls: ['./orden-proceso-edit.component.scss']
})
export class OrdenProcesoEditComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private modalService: NgbModal,
    private dateUtil: DateUtil,
    private maestroService: MaestroService) { }

  ordenProcesoEditForm: FormGroup;
  listDestinos = [];
  listTipoProceso = [];
  listTipoProduccion = [];
  listCertificacion = [];
  selectedDestino: any;
  selectedTipoProceso: any;
  selectedTipoProduccion: any;
  selectedCertificacion: any;

  ngOnInit(): void {
    this.LoadForm();
    this.ordenProcesoEditForm.controls.fecFinProcesoPlanta.setValue(this.dateUtil.currentDate());
  }

  LoadForm(): void {
    this.ordenProcesoEditForm = this.fb.group({
      razonSocialCabe: [],
      nroOrden: [],
      direccionCabe: [],
      fechaCabe: [],
      nroRucCabe: [],
      idContrato: [],
      nroContrato: [],
      idCliente: [],
      codCliente: [],
      cliente: [],
      destino: [],
      fecFinProcesoPlanta: [],
      tipoProceso: [],
      tipoProduccion: [],
      certificacion: [],
      totalSacosUtilizar: [],
      porcenRendimiento: [],
      unidadMedida: [],
      producto: [],
      cantidad: [],
      calidad: [],
      pesoSacoKG: [],
      grado: [],
      totalKilosBruto: [],
      cantidadDefectos: [],
      cantContenedores: [],
      responsableComercial: []
    });
    this.GetTipoProduccion();
  }

  get f() {
    return this.ordenProcesoEditForm.controls;
  }

  async GetTipoProduccion() {
    const res = await this.maestroService.obtenerMaestros('TipoProduccion').toPromise();
    if (res.Result.Success) {
      this.listTipoProduccion = res.Result.Data;
    }
  }

  async GetCertificacion() {
    const res = await this.maestroService.obtenerMaestros('TipoCertificacion').toPromise();
    if (res.Result.Success) {
      this.listCertificacion = res.Result.Data;
    }
  }

  GetDataModal(event: any): void {
    const obj = event[0];
    if (obj) {
      if (obj.ContratoId) {
        this.ordenProcesoEditForm.controls.idContrato.setValue(obj.ContratoId);
      }

      if (obj.Numero) {
        this.ordenProcesoEditForm.controls.nroContrato.setValue(obj.Numero);
      }

      if (obj.ClienteId) {
        this.ordenProcesoEditForm.controls.idCliente.setValue(obj.ClienteId);
      }

      if (obj.NumeroCliente) {
        this.ordenProcesoEditForm.controls.codCliente.setValue(obj.NumeroCliente);
      }

      if (obj.Cliente) {
        this.ordenProcesoEditForm.controls.cliente.setValue(obj.Cliente);
      }

      if (obj.TipoProduccionId) {
        this.GetTipoProduccion();
        this.ordenProcesoEditForm.controls.tipoProduccion.setValue(obj.TipoProduccionId);
      }

      if (obj.Producto) {
        this.ordenProcesoEditForm.controls.producto.setValue(obj.Producto);
      }

      if (obj.Calidad) {
        this.ordenProcesoEditForm.controls.calidad.setValue(obj.Calidad);
      }
    }
    this.modalService.dismissAll();
  }

  openModal(modalEmpresa: any): void {
    this.modalService.open(modalEmpresa, { windowClass: 'dark-modal', size: 'xl', centered: true });
  }
}
