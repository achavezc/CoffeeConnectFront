import { Component, OnInit, ViewChild} from '@angular/core';
import { MaestroUtil } from '../../../../../../../../services/util/maestro-util';
import { Observable } from 'rxjs';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn , FormArray, FormBuilder} from '@angular/forms';
import {NumeroUtil} from "../../../../../../../../services/util/numeros-util";
import { forEach } from 'core-js/fn/array';

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
   listaDefectosPrimarios : Observable<any[]>;
   listaDefectosSecundarios : Observable<any[]>;
   listaOlor : any[];
   listaColor : any[];
   listaSensorialAtributos: Observable<any[]>;
   listaSensorialRanking: Observable<any[]>;
   listaSensorialDefectos: Observable<any[]>;
   listaIndicadorTostado : Observable<any[]>;
   touchedRows: any;
   tableRows: FormArray;
   
  
    constructor(private maestroUtil: MaestroUtil, private fb: FormBuilder, private numeroUtil: NumeroUtil){
    } 
    ngOnInit(): void {
      
    this.touchedRows = [];
    this.tableOlor = this.fb.group({
      tableRows: this.fb.array([])
    });
      
    
    this.cargarForm();
    this.cargarCombos();
    
    }
    cargarCombos(){
      var form = this;
    this.maestroUtil.obtenerMaestros("DefectosPrimarios", function (res) {
      if (res.Result.Success) {
        form.listaDefectosPrimarios = res.Result.Data;
      }
    });
    this.maestroUtil.obtenerMaestros("DefectosSecundarios", function (res) {
      if (res.Result.Success) {
        form.listaDefectosSecundarios = res.Result.Data;
      }
    });
    this.maestroUtil.obtenerMaestros("Olor", function (res) {
     
      if (res.Result.Success) {
        form.listaOlor = res.Result.Data;
        const control = form.tableOlor.get('tableRows') as FormArray;
        for (let i = 0; i < res.Result.Data.length; i++)
         {
          //let ranking_i = new FormControl(res.Result.Data[i]);
          //form.tableRows.push(ranking_i);

          control.push(form.initiateForm(res.Result.Data[i].Label));
         
        }
       /*let group={}    
        form.listaOlor.forEach(input_template=>{
          group[input_template.Codigo]=new FormControl('',[]);  
        })
        form.tableOlor = new FormGroup(group);*/
      }
      
    });
    
    this.maestroUtil.obtenerMaestros("Color", function (res) {
      if (res.Result.Success) {
        form.listaColor = res.Result.Data;
        let group={}    
        form.listaColor.forEach(input_template=>{
          group['checkboxColor'+input_template.Codigo]=new FormControl('',[]);  
        })
        form.listaColor.forEach(input_template=>{
          group['labelColor'+input_template.Label]=new FormControl('',[]);  
        })
        form.tableColor = new FormGroup(group);
      }
    });
    this.maestroUtil.obtenerMaestros("SensorialAtributos", function (res) {
      if (res.Result.Success) {
        form.listaSensorialAtributos = res.Result.Data;
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
      }
    });
    this.maestroUtil.obtenerMaestros("IndicadorTostado", function (res) {
      if (res.Result.Success) {
        form.listaIndicadorTostado= res.Result.Data;
      }
    });
  }
  
  initiateForm(label2: string): FormGroup {
    return this.fb.group({
      label: [{value: label2, disabled: true}],
      checkoutOlor: [''],
    });
  }
  get getFormControls() {
    const control = this.tableOlor.get('tableRows') as FormArray;
    return control;
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
 
  guardar ()
  {
    const controlRendExport = this.tableRendExport.controls;
    this.guardarCambiosTableOlor(this.tableOlor);
    const controlColor = this.tableColor.controls;
    const controlOlor = this.tableOlor.get('tableRows') as FormArray;
    
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
  
}
