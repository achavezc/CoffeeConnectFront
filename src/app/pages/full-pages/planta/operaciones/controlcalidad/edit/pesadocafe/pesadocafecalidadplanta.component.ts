import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { MaestroUtil } from '../../../../../../../services/util/maestro-util';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn, ControlContainer } from '@angular/forms';
//import { EventEmitter } from 'events';

@Component({
  selector: '[formGroup] app-pesadoCafePlanta,[formGroupName] app-pesadoCafePlanta',
  templateUrl: './pesadocafeCalidadPlanta.component.html',
  styleUrls: ['./pesadocafeCalidadplanta.component.scss']
})
export class PesadoCafeCalidadPlantaComponent implements OnInit {
  public pesadoFormGroup: FormGroup;
  listaUnidadMedida: any[];
  selectedUnidadMedida: any;
  listaMotivo: any[];
  selectedMotivo: any;

  listaEmpaque: any[];
  selectedEmpaque: any;
  listaTipo: any[];
  selectedTipo: any;
  listaCalidad: any[];
  selectedCalidad: any;
  listaGrado: any[];
  selectedGrado: any;
  @Input() submittedEdit;
  @Output() miEvento = new EventEmitter<any>();
  CodigoSacao = "01";
  CodigoTipoYute = "01";
  kilos = 7;
  tara = 0.2;
  taraYute = 0.7
  mensaje = "";
  constructor(private maestroUtil: MaestroUtil,
    private controlContainer: ControlContainer
  ) {
  }

  ngOnInit(): void {
    this.cargarcombos();
    this.cargarForm();
    this.pesadoFormGroup = <FormGroup>this.controlContainer.control;
  }

  cargarcombos() {
    var form = this;
    this.maestroUtil.obtenerMaestros("MotivoIngresoPlanta", function (res) {
      if (res.Result.Success) {
        form.listaMotivo = res.Result.Data;
      }
    });

    this.maestroUtil.obtenerMaestros("Empaque", function (res) {
      if (res.Result.Success) {
        form.listaEmpaque = res.Result.Data;
      }
    });

    this.maestroUtil.obtenerMaestros("TipoEmpaque", function (res) {
      if (res.Result.Success) {
        form.listaTipo = res.Result.Data;
      }
    });

    this.maestroUtil.obtenerMaestros("Calidad", function (res) {
      if (res.Result.Success) {
        form.listaCalidad = res.Result.Data;
      }
    });

    this.maestroUtil.obtenerMaestros("Grado", function (res) {
      if (res.Result.Success) {
        form.listaGrado = res.Result.Data;
      }
    });
  }
  cargarForm() {
  }

  changeEmpaque(e) {
    this.calcularTara();
  }
  changeTipo(e) {
    this.calcularTara();
  }
  changeCantidad() {
    this.calcularTara();
  }
  changePesoBruto(){
    this.calcularKilosNetos();
  }

  calcularTara() {
    var cantidad = this.pesadoFormGroup.controls['cantidad'].value;
    var empaque = this.pesadoFormGroup.controls['empaque'].value;
    var tipo = this.pesadoFormGroup.controls['tipo'].value;
    var valor = 0;
    if (empaque == this.CodigoSacao && tipo == this.CodigoTipoYute) {
      var valor = cantidad * this.taraYute;
    } else if (empaque == this.CodigoSacao && tipo != this.CodigoTipoYute) {
      var valor = cantidad * this.tara;
    }


    var valorRounded = Math.round((valor + Number.EPSILON) * 100) / 100
    this.pesadoFormGroup.controls['tara'].setValue(valorRounded);
    this.calcularKilosNetos();
  }
  consultarSocioFinca() {
    this.miEvento.emit(this.mensaje);
  }

  calcularKilosNetos(){
    var tara = this.pesadoFormGroup.controls['tara'].value;
    var kilosBrutos = this.pesadoFormGroup.controls['kilosBrutos'].value;
    var valor = kilosBrutos - tara;
    var valorRounded = Math.round((valor + Number.EPSILON) * 100) / 100
    this.pesadoFormGroup.controls['kilosNetos'].setValue(valorRounded);
  }

  cleanKilosBrutos() {
    this.pesadoFormGroup.controls['kilosBruto'].setValue("");
  }

}
