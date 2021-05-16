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
/*   get fedit() {
    return this.consultaMateriaPrimaFormEdit.controls;
  } */
  cargarcombos() {
    var form = this;
    this.maestroUtil.obtenerMaestros("UnidadMedida", function (res) {
      if (res.Result.Success) {
        form.listaUnidadMedida = res.Result.Data;
        form.pesadoFormGroup.controls['unidadMedida'].setValue(form.unidadMedidaPesado);  
      }
    });
  }
  cargarForm() {
    /* this.consultaMateriaPrimaFormEdit = new FormGroup(
      {
        unidadMedida: new FormControl('', [Validators.required]),
        cantidad: new FormControl('', [Validators.required,Validators.pattern(/^-?(0|[1-9]\d*)?$/)]),
        kilosBruto: new FormControl('', [Validators.required,Validators.pattern(/^-?(0|[1-9]\d*)?$/)]),
        tara: new FormControl('', []),
        observacionPesado: new FormControl('', [])
      }); */
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
