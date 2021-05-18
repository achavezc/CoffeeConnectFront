import { Component, Input, Output, OnInit , EventEmitter} from '@angular/core';
import { MaestroUtil } from '../../../../../../../services/util/maestro-util';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn,ControlContainer} from '@angular/forms';
//import { EventEmitter } from 'events';

@Component({
  selector:'[formGroup] app-pesadoCafePlanta,[formGroupName] app-pesadoCafePlanta',
  templateUrl: './pesadoCafePlanta.component.html',
  styleUrls: ['./pesadoCafePlanta.component.scss']
})
export class PesadoCafePlantaComponent implements OnInit {
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
  @Input() unidadMedidaPesado;
  @Input() submittedEdit;
  @Output() miEvento = new EventEmitter<any>();
  sacos = "01";
  latas = "02";
  kilos = 7;
  tara = 0.2;
  mensaje = "";
  constructor(private maestroUtil: MaestroUtil,
    private controlContainer: ControlContainer
    ) {
  }

  ngOnInit(): void {
    this.cargarcombos();
    this.cargarForm();
    this.pesadoFormGroup = <FormGroup> this.controlContainer.control;
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

  changeUnidadMedida(e) {
    let unidadMedida = e.Codigo;
    if(unidadMedida == this.sacos){
      this.pesadoFormGroup.controls['kilosBruto'].enable();
    }else if(unidadMedida == this.latas){
      this.pesadoFormGroup.controls['kilosBruto'].disable();
    }
    this.changeCantidad();
  }
  changeCantidad(){
    var unidadMedida = this.pesadoFormGroup.controls['unidadMedida'].value;
    var cantidad = this.pesadoFormGroup.controls['cantidad'].value;
    if(unidadMedida == this.latas){
      var valor = cantidad * this.kilos;
      this.pesadoFormGroup.controls['kilosBruto'].setValue(valor);
      this.pesadoFormGroup.controls['tara'].setValue("");
    }else if(unidadMedida == this.sacos){
      var valor = cantidad * this.tara;
      var valorRounded = Math.round((valor + Number.EPSILON) * 100) / 100
      this.pesadoFormGroup.controls['tara'].setValue(valorRounded);
    }
  }

  consultarSocioFinca()
  {
  this.miEvento.emit(this.mensaje);
  }


  cleanKilosBrutos()
  {
    this.pesadoFormGroup.controls['kilosBruto'].setValue("");
  }

}
