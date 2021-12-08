import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { host } from '../../../../../shared/hosts/main.host';
import { KardexService } from '../../../../../services/kardex.service';

@Component({
  selector: 'app-kardex',
  templateUrl: './kardex.component.html',
  styleUrls: ['./kardex.component.scss']
})
export class KardexComponent implements OnInit {

  frmKardex: FormGroup;
  errorGeneral = { errorMessage: '', isError: false };

  constructor(private fb: FormBuilder,
    private kardexService: KardexService) { }

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
    /*
    this.kardexService.Descargar().subscribe((res) => {
      // this.blob = new Blob([data], { type: 'application/pdf' });

      var downloadURL = window.URL.createObjectURL(res);
      var link = document.createElement('a');
      link.href = downloadURL;
      link.download = "help.pdf";
      link.click();
    }, (err) => {
      console.log(err);
    });
    */
     let link = document.createElement('a');
     document.body.appendChild(link);
     link.href = `${host}kardex/GenerarKardex?fechaInicio=01-10-2020&fechaFin=01-11-2022&empresaId=1`;
     //http://localhost:62742/api/Kardex/GenerarKardex
     link.download = "KardexPergamino.pdf"
     link.target = "_blank";
     link.click();
     link.remove();
  }

}
