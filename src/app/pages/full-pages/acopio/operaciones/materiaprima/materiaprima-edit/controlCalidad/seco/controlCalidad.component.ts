import { Component, OnInit, ViewChild} from '@angular/core';
import { MaestroUtil } from '../../../../../../../../services/util/maestro-util';
import { Observable } from 'rxjs';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn , FormArray, FormBuilder} from '@angular/forms';
import {NumeroUtil} from "../../../../../../../../services/util/numeros-util";
import {OrdenservicioControlcalidadService} from '../../../../../../../../services/ordenservicio-controlcalidad.service';
import {ReqControlCalidad} from '../../../../../../../../services/models/req-controlcalidad-actualizas'


@Component({
  selector: 'app-controlCalidadSeco',
  templateUrl: './controlCalidad.component.html',
  styleUrls: ['./controlCalidad.component.scss']
})
export class ControlCalidadComponent implements OnInit {

  @ViewChild('vform') validationForm: FormGroup;
  submittedRendExport = false;
   controlCalidadSeco: FormGroup;
   tableRendExport: FormGroup;
   tableOlor: FormGroup;
   tableColor: FormGroup;
   tableAnalisisSensorial: FormGroup;
   tableDefectosPrimarios: FormGroup;
   tableDefectosSecundarios: FormGroup;
   tableSensorialDefectos: FormGroup;
   tableSensorialRanking: FormGroup;
   tableRegistroTostado: FormGroup;
   listaDefectosPrimarios : any[];
   listaDefectosSecundarios : any[];
   listaOlor : any[];
   listaColor : any[];
   listaSensorialAtributos: any[];
   listaSensorialRanking: any[];
   listaSensorialDefectos: any[];
   listaIndicadorTostado : any[];

  constructor(private maestroUtil: MaestroUtil, private fb: FormBuilder, private numeroUtil: NumeroUtil,
    private controlcalidadservice : OrdenservicioControlcalidadService){
  } 
    ngOnInit(): void 
    { 
      this.cargarCombos();
      this.cargarForm();
    }
    cargarCombos()
    {
    var form = this;
    this.maestroUtil.obtenerMaestros("DefectosPrimarios", function (res) {
      if (res.Result.Success) {
        form.listaDefectosPrimarios = res.Result.Data;
        let group={}    
        form.listaDefectosPrimarios.forEach(input_template=>{
          group[input_template.Codigo]=new FormControl('',[]);  
        })
        form.tableDefectosPrimarios = new FormGroup(group);
      }
    });
    this.maestroUtil.obtenerMaestros("DefectosSecundarios", function (res) {
      if (res.Result.Success) {
        form.listaDefectosSecundarios = res.Result.Data;
        let group={}    
        form.listaDefectosSecundarios.forEach(input_template=>{
          group[input_template.Codigo]=new FormControl('',[]);  
        })
        form.tableDefectosSecundarios = new FormGroup(group);
      }
    });
    this.maestroUtil.obtenerMaestros("Olor", function (res) {
      if (res.Result.Success) {
      form.listaOlor = res.Result.Data;
      let group={}    
        form.listaOlor.forEach(input_template=>{
          group[input_template.Codigo]=new FormControl('',[]);  
        })
        form.tableOlor = new FormGroup(group);
      }
    });
    this.maestroUtil.obtenerMaestros("Color", function (res) {
      if (res.Result.Success) {
        form.listaColor = res.Result.Data;
        let group={}    
        form.listaColor.forEach(input_template=>{
          group[input_template.Codigo]=new FormControl('',[]);  
        })
        form.tableColor = new FormGroup(group);
      }
    });
    this.maestroUtil.obtenerMaestros("SensorialAtributos", function (res) {
      if (res.Result.Success) {
        form.listaSensorialAtributos = res.Result.Data;
        let group={}    
        form.listaSensorialAtributos.forEach(input_template=>{
          group[input_template.Codigo]=new FormControl('',[]);  
        })
        form.tableSensorialRanking = new FormGroup(group);
      }
    });
    this.maestroUtil.obtenerMaestros("SensorialRanking", function (res) {
      if (res.Result.Success) {
        form.listaSensorialRanking = res.Result.Data;
      }
    });
    this.maestroUtil.obtenerMaestros("SensorialDefectos", function (res) {
      if (res.Result.Success) {
        form.listaSensorialDefectos = res.Result.Data;
        let group={}  
        form.listaSensorialDefectos.forEach(input_template=>{
          group[input_template.Codigo]=new FormControl('',[]);  
        })
        form.tableSensorialDefectos = new FormGroup(group);
      }
    });
    this.maestroUtil.obtenerMaestros("IndicadorTostado", function (res) {
      if (res.Result.Success) {
        form.listaIndicadorTostado= res.Result.Data;
        let group={}    
        form.listaIndicadorTostado.forEach(input_template=>{
          group['tostado$'+input_template.Codigo]=new FormControl('',[Validators.pattern(form.numeroUtil.numerosDecimales())]);  
        })
        form.tableRegistroTostado = new FormGroup(group);
      }
    });
  }
  cargarForm() {
    
    this.tableRendExport = new FormGroup(
      {
        exportGramos: new FormControl('',[Validators.required,Validators.pattern(this.numeroUtil.numerosDecimales())]),
        exportPorc: new FormControl('',[Validators.pattern(this.numeroUtil.numerosDecimales())]),
        descarteGramos: new FormControl('',[Validators.pattern(this.numeroUtil.numerosDecimales())]),
        descartePorc: new FormControl('',[Validators.pattern(this.numeroUtil.numerosDecimales())]),
        cascarillaGramos: new FormControl('',[Validators.pattern(this.numeroUtil.numerosDecimales())]),
        cascarillaPorc: new FormControl('',[Validators.pattern(this.numeroUtil.numerosDecimales())]),
        humedad: new FormControl('',[Validators.pattern(this.numeroUtil.numerosDecimales())]),
      });
  }
  get frendExport() {
    return this.tableRendExport.controls;
  }
 
  get fRegistroTostado() {
    return this.tableRegistroTostado.controls;
  }

  enterAtributo(i,value)
  {
    const ranking = this.evaluarRanking(value);
    this.tableSensorialRanking.controls[i].setValue(ranking);
  }

  evaluarRanking(val)
  {
    if (val>6 && val <6.99)
    return "Bueno";
    if (val>7 && val <7.99)
    return "Muy Bueno";
    if (val>8 && val <8.99)
    return "Excelente";
    if (val>9 && val <9.99)
    return "Extraordinario";
  }
  test: any[];
  guardar (e)
  {
    
    const controlRendExport = this.tableRendExport.controls;
    this.guardarCambiosTableOlor(this.tableOlor);    
    const controlColor = this.tableColor.controls;
    const controlTablePrimarios = this.tableDefectosPrimarios.controls;
    this.test = this.mergeById(controlTablePrimarios,this.listaDefectosPrimarios)
    const controlTableSecundarios = this.tableDefectosSecundarios.controls;
    const controlRegistroTostado = this.tableRegistroTostado.controls;
    const controlSensorialDefectos= this.tableSensorialDefectos.controls;
    
  }

  guardarCambiosTableOlor(controltableOlor)
  {
    let result = {}, key;
    for (key in  this.tableOlor.value) {
        if ( controltableOlor.value[key] == true) {
            result[key] =  controltableOlor.value[key];
        }
    }
    return result;
  }

  guardarCambiosTableColor(controltableColor)
  {
    let result = {}, key;
    for (key in  this.tableOlor.value) {
        if ( controltableColor.value[key] == true) {
            result[key] =  controltableColor.value[key];
        }
    }
    return result;
  }

  mergeById (array1, array2) 
  {
   
    return array1.map(itm => ({
      ...array2.find((item) => (item.Codigo === itm.Codigo) && item),
      ...itm
    }));
  }
  
}
