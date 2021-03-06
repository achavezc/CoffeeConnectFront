import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';

import { NotaCompraService } from '../../../../../../services/nota-compra.service';

@Component({
  selector: 'app-nota-compra-edit',
  templateUrl: './nota-compra-edit.component.html',
  styleUrls: ['./nota-compra-edit.component.scss']
})
export class NotaCompraEditComponent implements OnInit {

  constructor(private route: ActivatedRoute,
    private router: Router,
    private notaCompraService: NotaCompraService,
    private fb: FormBuilder) { }

  notaCompraEditForm: any;
  vId: number;

  ngOnInit(): void {
    this.vId = this.route.snapshot.params['id'];
    if (this.vId) {
      this.vId = parseInt(this.route.snapshot.params['id']);
      this.LoadForm();
      this.SearchById();
    } else {
      this.router.navigate['/acopio/operaciones/notasdecompra-list'];
    }
  }

  LoadForm(): void {
    this.notaCompraEditForm = this.fb.group({
      nombre: [],
      nroNotaCompra: [],
      direccion: [],
      fecha: [],
      ruc: [],
      estado: [],
      nombreProveedor: [],
      departamento: [],
      docIdentidad: [],
      provincia: [],
      tipo: [],
      distrito: [],
      codigo: [],
      zona: [],
      finca: [],
      tipoDP: [],
      fechaCosecha: [],
      subTipo: [],
      tipoProduccion: [],
      unidadMedida: [],
      exportableAT: [],
      cantidadPC: [],
      descarteAT: [],
      kilosBrutosPC: [],
      cascarillaAT: [],
      taraPC: [],
      totalAT: [],
      kilosNetosPC: [],
      dsctoHumedadPC: [],
      humedadAT: [],
      kilosNetosDescontarPC: [],
      kiloNetoPagarPC: [],
      monedaAT: [],
      qqKgPC: [],
      precioDiaAT: [],
      precioGuardadoAT: [],
      precioPagadoAT: [],
      importeAT: []
    });
  }

  SearchById(): void {
    this.notaCompraService.SearchById({ NotaCompraId: this.vId })
      .subscribe((res: any) => {
        this.notaCompraEditForm.controls.nombre.setValue(res.Result.Data.RazonSocial);
      }, (err: any) => {
        console.log(err);
      })
  }

}
