import { Component, Input, OnInit } from '@angular/core';
import { MaestroUtil } from '../../../../../../../services/util/maestro-util';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn } from '@angular/forms';

@Component({
  selector: 'app-pesadoCafe',
  templateUrl: './pesadoCafe.component.html',
  styleUrls: ['./pesadoCafe.component.scss']
})
export class PesadoCafeComponent implements OnInit {

  listaUnidadMedida: any[];
  selectedUnidadMedida: any;
  @Input() consultaMateriaPrimaFormEdit: FormGroup;
  @Input() submittedEdit;
  constructor(private maestroUtil: MaestroUtil) {
  }

  ngOnInit(): void {
    this.cargarcombos();
    this.cargarForm();
  }
  get fedit() {
    return this.consultaMateriaPrimaFormEdit.controls;
  }
  cargarcombos() {
    var form = this;
    this.maestroUtil.obtenerMaestros("UnidadMedida", function (res) {
      if (res.Result.Success) {
        form.listaUnidadMedida = res.Result.Data;
      }
    });
  }
  cargarForm() {
    this.consultaMateriaPrimaFormEdit = new FormGroup(
      {
        unidadMedida: new FormControl('', [Validators.required]),
        cantidad: new FormControl('', [Validators.required]),
        kilosBruto: new FormControl('', [Validators.required])
      });
  }



}
