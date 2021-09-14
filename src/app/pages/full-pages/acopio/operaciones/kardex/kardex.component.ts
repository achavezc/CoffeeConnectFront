import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { host } from '../../../../../shared/hosts/main.host';

@Component({
  selector: 'app-kardex',
  templateUrl: './kardex.component.html',
  styleUrls: ['./kardex.component.scss']
})
export class KardexComponent implements OnInit {

  frmKardex: FormGroup;
  errorGeneral = { errorMessage: '', isError: false };

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.LoadForm();
  }

  LoadForm() {
    this.frmKardex = this.fb.group({
      fechaRecepcion: [],
      nroGuiaRecepcion: [],
      fechaNotaCompra: []
    });
  }

  get f() {
    return this.frmKardex.controls;
  }

  Generar() {
    let link = document.createElement('a');
    document.body.appendChild(link);
    link.href = `${host}Kardex/GenerarKardex`;
    // link.download = "NotaCompra.pdf"
    link.target = "_blank";
    link.click();
    link.remove();
  }

}
