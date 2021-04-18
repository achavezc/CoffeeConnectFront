import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-orden-proceso-edit',
  templateUrl: './orden-proceso-edit.component.html',
  styleUrls: ['./orden-proceso-edit.component.scss']
})
export class OrdenProcesoEditComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private modalService: NgbModal) { }

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
  }

  get f() {
    return this.ordenProcesoEditForm.controls;
  }

  GetDataModal(event: any): void {
    // this.contratoEditForm.controls.idCliente.setValue(event[0].ClienteId);
    // this.contratoEditForm.controls.codCliente.setValue(event[0].Numero);
    // this.contratoEditForm.controls.cliente.setValue(event[0].RazonSocial);
    this.modalService.dismissAll();
  }

  openModal(modalEmpresa: any): void {
    this.modalService.open(modalEmpresa, { windowClass: 'dark-modal', size: 'xl', centered: true });
  }
}
