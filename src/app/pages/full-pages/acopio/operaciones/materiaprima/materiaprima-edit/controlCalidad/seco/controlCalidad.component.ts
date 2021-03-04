import { Component, OnInit,Input, ViewChild} from '@angular/core';
import { MaestroUtil } from '../../../../../../../../services/util/maestro-util';
import { Observable } from 'rxjs';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn , FormArray, FormBuilder} from '@angular/forms';
import {NumeroUtil} from "../../../../../../../../services/util/numeros-util";
import {AcopioService} from '../../../../../../../../services/acopio.service';
import {ReqControlCalidad, AnalisisFisicoColorDetalleList, AnalisisFisicoOlorDetalleList, AnalisisFisicoDefectoPrimarioDetalleList,
  AnalisisFisicoDefectoSecundarioDetalleList, RegistroTostadoIndicadorDetalleList, AnalisisSensorialDefectoDetalleList,
  AnalisisSensorialAtributoDetalleList} from '../../../../../../../../services/models/req-controlcalidad-actualizar'
import { NgxSpinnerService } from "ngx-spinner";
import { AlertUtil } from '../../../../../../../../services/util/alert-util';
import {Router} from "@angular/router";
import { ILogin } from '../../../../../../../../services/models/login';
import { DateUtil } from '../../../../../../../../services/util/date-util';


@Component({
  selector: 'app-controlCalidadSeco',
  templateUrl: './controlCalidad.component.html',
  styleUrls: ['./controlCalidad.component.scss']
})
export class ControlCalidadComponent implements OnInit {

  @ViewChild('vform') validationForm: FormGroup;
  @Input() detalleMateriaPrima : any;
  
  
   submitted = false;
   controlCalidadSeco: FormGroup;
   formControlCalidad: FormGroup;
   tableOlor: FormGroup;
   tableColor: FormGroup;
   //tableAnalisisSensorial: FormGroup;
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
   reqControlCalidad: ReqControlCalidad;
   minSensorial: number;
   maxSensorial: number;
   login: ILogin;
   errorGeneral: any = { isError: false, errorMessage: '' };
   mensajeErrorGenerico = "Ocurrio un error interno.";
   responsable: string;
   fechaCalidad: string;
   
   @Input() events: Observable<void>;

  constructor(private maestroUtil: MaestroUtil, private fb: FormBuilder, private numeroUtil: NumeroUtil,
    private acopioService : AcopioService,  private spinner: NgxSpinnerService,
    private alertUtil: AlertUtil, private router: Router, private dateUtil: DateUtil){
  } 
  
  ngOnInit(): void
    { 
      this.cargarCombos();
      this.cargarForm();
      this.events.subscribe(
        () => this.obtenerDetalle());
     
    }
    cargarCombos()
    {
    var form = this;
    this.maestroUtil.obtenerMaestros("DefectosPrimarios", function (res) {
      if (res.Result.Success) {
        form.listaDefectosPrimarios = res.Result.Data;
        let group={}    
        form.listaDefectosPrimarios.forEach(input_template=>{
          group['DefPrimario%'+input_template.Codigo]=new FormControl('',[]);  
        })
        group['SubTotalDefPrimarios'] =new FormControl('',[]);
        form.tableDefectosPrimarios = new FormGroup(group);
      }
    });
    this.maestroUtil.obtenerMaestros("DefectosSecundarios", function (res) {
      if (res.Result.Success) {
        form.listaDefectosSecundarios = res.Result.Data;
        let group={}    
        form.listaDefectosSecundarios.forEach(input_template=>{
          group['DefSecundarios%'+input_template.Codigo]=new FormControl('',[]);  
        })
        
        form.tableDefectosSecundarios = new FormGroup(group);
      }
    });
    this.maestroUtil.obtenerMaestros("Olor", function (res) {
      if (res.Result.Success) {
      form.listaOlor = res.Result.Data;
      let group={}    
        form.listaOlor.forEach(input_template=>{
          group['CheckboxOlor%'+input_template.Codigo]=new FormControl('',[]);  
        })
        form.tableOlor = new FormGroup(group);
      }
    });
    this.maestroUtil.obtenerMaestros("Color", function (res) {
      if (res.Result.Success) {
        form.listaColor = res.Result.Data;
        let group={}    
        form.listaColor.forEach(input_template=>{
          group['CheckboxColor%'+input_template.Codigo]=new FormControl('',[]);  
        })
        form.tableColor = new FormGroup(group);
      }
    });
    this.maestroUtil.obtenerMaestros("SensorialRanking", function (res) {
      if (res.Result.Success) {
        form.listaSensorialRanking = res.Result.Data;
        form.valorMinMax();
      }
    });
    this.maestroUtil.obtenerMaestros("SensorialAtributos", function (res) {
      if (res.Result.Success) {
        form.listaSensorialAtributos = res.Result.Data;
        let group={}    
        form.listaSensorialAtributos.forEach(input_template=>{
          group['sensorialAtrib%'+input_template.Codigo]=new FormControl('',[Validators.max(form.maxSensorial),Validators.min(form.minSensorial)]);  
          group['sensorialAtribRanking%'+input_template.Codigo]=new FormControl('',[]);  
        })
        form.tableSensorialRanking = new FormGroup(group);
      }
    });
    this.maestroUtil.obtenerMaestros("SensorialDefectos", function (res) {
      if (res.Result.Success) {
        form.listaSensorialDefectos = res.Result.Data;
        let group={}  
        form.listaSensorialDefectos.forEach(input_template=>{
          group['checkboxSenDefectos%'+input_template.Codigo]=new FormControl('',[]);  
        })
        form.tableSensorialDefectos = new FormGroup(group);
      }
    });
    this.maestroUtil.obtenerMaestros("IndicadorTostado", function (res) {
      if (res.Result.Success) {
        form.listaIndicadorTostado= res.Result.Data;
        let group={}    
        form.listaIndicadorTostado.forEach(input_template=>{
          group['tostado%'+input_template.Codigo]=new FormControl('',[]);  
        })
        form.tableRegistroTostado = new FormGroup(group);
      }
    });
    
    }
     cargarForm() {
    this.formControlCalidad = new FormGroup(
      {
        exportGramos: new FormControl('',[Validators.required]),
        exportPorcentaje: new FormControl('',[]),
        descarteGramos: new FormControl('',[Validators.required]),
        descartePorcentaje: new FormControl('',[]),
        cascarillaGramos: new FormControl('',[Validators.required]),
        cascarillaPorcentaje: new FormControl('',[]),
        humedad: new FormControl('',[Validators.required]),
        totalGramos: new FormControl('',[]),
        totalPorcentaje: new FormControl('',[]),
        SubTotalDefSecundario: new FormControl('',[]),
        SubTotalDefPrimario: new FormControl('',[]),
        ToTalEquiDefectos: new FormControl('',[]),
        ObservacionAnalisisFisico: new FormControl('',[]),
        ObservacionRegTostado: new FormControl('',[]),
        ObservacionAnalisisSensorial: new FormControl('',[]),
        PuntajeFinal:  new FormControl('',[])
        
      });
      this.formControlCalidad.setValidators(this.comparisonValidator())
    }
    
  valorMinMax()
  {
    let max =[];
    let min = [];
    for(let item in this.listaSensorialRanking)
    {
      max.push(Number(this.listaSensorialRanking[item].Val2));
      min.push(Number(this.listaSensorialRanking[item].Val1));
    }
    this.minSensorial = Math.min(...min);
    this.maxSensorial = Math.max(...max);
  }
  get frendExport() {
    return this.formControlCalidad.controls;
  }
  get fSensorialRanking() {
    return this.tableSensorialRanking.controls;
  }

  evaluar(value)
  {
    const item = this.listaSensorialRanking.filter(obj => Number(value) >= Number(obj.Val1) && Number(value) <= Number(obj.Val2));
    if (item.length>0)
    {
      return item[0].Label;
    }
    else
    {
      return "";
    }
    
  }
  evaluarRanking(i,value)
  {
    const item = this.listaSensorialRanking.filter(obj => Number(value) >= Number(obj.Val1) && Number(value) <= Number(obj.Val2));
    if (item.length>0)
    {
    this.tableSensorialRanking.controls['sensorialAtribRanking%'+i].setValue(item[0].Label);
    }
    else
    {
      this.tableSensorialRanking.controls['sensorialAtribRanking%'+i].setValue("");
    }
    this.calcularPuntajeFinal();
  }
  calcularPuntajeFinal()
  {
    let totalPuntajeFinal = 0;
    for (let i =0; i < this.listaSensorialAtributos.length; i++ )
  { 
    totalPuntajeFinal = Number(this.tableSensorialRanking.controls['sensorialAtrib%'+this.listaSensorialAtributos[i].Codigo].value) +  totalPuntajeFinal;
  }
  this.formControlCalidad.controls["PuntajeFinal"].setValue(totalPuntajeFinal);
  }
 calcularTotalDefPrimario()
 {
    
  let totalDefPrimarios: number = 0;
  let totalDefSecundario: number = 0;
  for (let i =0; i < this.listaDefectosPrimarios.length; i++ )
  { 
    totalDefPrimarios = Number(this.tableDefectosPrimarios.controls['DefPrimario%'+this.listaDefectosPrimarios[i].Codigo].value) +  totalDefPrimarios;
  }
    this.formControlCalidad.controls["SubTotalDefPrimario"].setValue(totalDefPrimarios);
    totalDefSecundario  = Number(this.formControlCalidad.controls["SubTotalDefSecundario"].value);
    this.formControlCalidad.controls["ToTalEquiDefectos"].setValue(totalDefPrimarios + totalDefSecundario);

    
 }
 calcularTotalDefSecundario()
 {
  let totalDefSecundario: number = 0;
  let totalDefPrimarios: number = 0;
  for (let i =0; i < this.listaDefectosSecundarios.length; i++ )
  { 
    totalDefSecundario = Number(this.tableDefectosSecundarios.controls['DefSecundarios%'+this.listaDefectosSecundarios[i].Codigo].value) +  totalDefSecundario;
  }
   this.formControlCalidad.controls['SubTotalDefSecundario'].setValue(totalDefSecundario);
   totalDefPrimarios  = Number(this.formControlCalidad.controls["SubTotalDefPrimario"].value);
   this.formControlCalidad.controls["ToTalEquiDefectos"].setValue(totalDefPrimarios + totalDefSecundario);
 }

 public comparisonValidator(): ValidatorFn {
  return (group: FormGroup): ValidationErrors => {
    const totalPorcentaje = Number((group.controls["totalPorcentaje"].value).split("%")[0]);
    if ((totalPorcentaje> 100 || totalPorcentaje < 100))
    {

      this.errorGeneral = { isError: true, errorMessage: 'Total de Porcentaje debe ser 100%' };

    } 
    else {
      this.errorGeneral = { isError: false, errorMessage: '' };
    }
    return;
  };
}
  actualizarAnalisisControlCalidad (e)
  {
    this.login = JSON.parse(localStorage.getItem("user"));
    if (this.formControlCalidad.invalid || this.errorGeneral.isError || this.tableSensorialRanking.invalid) 
    {
      this.submitted = true;
      return;
    }
    else
    {
    let listaDetalleOlor = Array<AnalisisFisicoOlorDetalleList>();
    let listaDetalleColor = Array<AnalisisFisicoColorDetalleList>();
    let listaDefectosPrimarios = Array<AnalisisFisicoDefectoPrimarioDetalleList>();
    let listaDefectosSecundarios = Array<AnalisisFisicoDefectoSecundarioDetalleList>();
    let listaRegistroTostado = Array<RegistroTostadoIndicadorDetalleList>();
    let listaAnalisisSensorialDefectos= Array<AnalisisSensorialDefectoDetalleList>();
    let listaAnalisisSensorialAtrib = Array<AnalisisSensorialAtributoDetalleList>(); 
    var controlFormControlCalidad = this.formControlCalidad.controls;
    listaDetalleOlor = this.obtenerDetalleAnalisisFisicoOlor(this.tableOlor);
    listaDetalleColor = this.obtenerDetalleAnalisisFisicoColor(this.tableColor);    
    listaDefectosPrimarios = this.obtenerDetalleDefectosPrimarios(this.tableDefectosPrimarios)
    listaDefectosSecundarios = this.obtenerDetalleDefectosSecundarios(this.tableDefectosSecundarios)
    listaRegistroTostado = this.obtenerRegistroTostado (this.tableRegistroTostado);
    listaAnalisisSensorialDefectos = this.obtenerAnalisisSensorialDefectos(this.tableSensorialDefectos)
    listaAnalisisSensorialAtrib= this.obtenerAnalisisSensorialAtributos(this.tableSensorialRanking);
    this.reqControlCalidad = new ReqControlCalidad(
    this.login.Result.Data.EmpresaId,
    Number(this.detalleMateriaPrima.GuiaRecepcionMateriaPrimaId),
    Number(controlFormControlCalidad["exportGramos"].value),
    Number((controlFormControlCalidad["exportPorcentaje"].value).split("%")[0]),
    Number(controlFormControlCalidad["descarteGramos"].value),
    Number((controlFormControlCalidad["descartePorcentaje"].value).split("%")[0]),
    Number(controlFormControlCalidad["cascarillaGramos"].value),
    Number((controlFormControlCalidad["cascarillaPorcentaje"].value).split("%")[0]),
    Number(controlFormControlCalidad["totalGramos"].value),
    Number((controlFormControlCalidad["totalPorcentaje"].value).split("%")[0]),
    Number(controlFormControlCalidad["humedad"].value),
    controlFormControlCalidad["ObservacionAnalisisFisico"].value,
    this.login.Result.Data.NombreCompletoUsuario,
    controlFormControlCalidad["ObservacionRegTostado"].value,
    controlFormControlCalidad["ObservacionAnalisisSensorial"].value,
    listaDetalleOlor,
    listaDetalleColor,
    listaDefectosPrimarios,
    listaDefectosSecundarios,
    listaRegistroTostado,
    listaAnalisisSensorialDefectos,
    listaAnalisisSensorialAtrib
    );
    let json = JSON.stringify(this.reqControlCalidad);
    this.spinner.show(undefined,
      {
        type: 'ball-triangle-path',
        size: 'medium',
        bdColor: 'rgba(0, 0, 0, 0.8)',
        color: '#fff',
        fullScreen: true
      });
      this.acopioService.Actualizar(this.reqControlCalidad)
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            var form = this;
          this.alertUtil.alertOkCallback('Registrado!', 'Analisis Control Calidad',function(result){
            if(result.isConfirmed){
              form.router.navigate(['/operaciones/guiarecepcionmateriaprima-list']);
            }
          }
          );
            //this.router.navigate(['/operaciones/guiarecepcionmateriaprima-list'])
          } else if (res.Result.Message != "" && res.Result.ErrCode != "") {
            this.errorGeneral = { isError: true, errorMessage: res.Result.Message };
          } else {
            this.errorGeneral = { isError: true, errorMessage: this.mensajeErrorGenerico };
          }
        } else {
          this.errorGeneral = { isError: true, errorMessage: this.mensajeErrorGenerico };
        }
      },
        err => {
          this.spinner.hide();
          console.log(err);
          this.errorGeneral = { isError: false, errorMessage: this.mensajeErrorGenerico };
        }
      );  
    }
  }

  obtenerDetalleAnalisisFisicoOlor(tableOlor)
  {
    let result: any[];
    let listDetalleOlor = new  Array<AnalisisFisicoOlorDetalleList>();
    result = this.obtenerValues(tableOlor);
    var list = this.mergeById (this.listaOlor, result) 
    for (let item in list)
    {
        var detalleOlor = new AnalisisFisicoOlorDetalleList();
        detalleOlor.Valor = list[Number(item)].valor? list[Number(item)].valor: false;
        detalleOlor.OlorDetalleId = list[Number(item)].Codigo;
        detalleOlor.OlorDetalleDescripcion = list[Number(item)].Label;
        listDetalleOlor.push(detalleOlor);
    }
    return listDetalleOlor;
  }

  obtenerDetalleAnalisisFisicoColor(tableColor)
  {
    let result: any[];
    let listDetalleColor = new  Array<AnalisisFisicoColorDetalleList>();
    result = this.obtenerValues(tableColor);
    var list = this.mergeById (this.listaColor, result) 
    for (let item in list)
    {
      
        var detalleColor = new AnalisisFisicoColorDetalleList();
        detalleColor.Valor = list[Number(item)].valor? list[Number(item)].valor: false;
        detalleColor.ColorDetalleId = list[Number(item)].Codigo;
        detalleColor.ColorDetalleDescripcion = list[Number(item)].Label;
        listDetalleColor.push(detalleColor);
    }
    return listDetalleColor;
  }
  obtenerDetalleDefectosPrimarios(tableDefectosPrimarios)
  {
    let result: any[];
    let listDetalleDefectosPrimarios = new  Array<AnalisisFisicoDefectoPrimarioDetalleList>();
    result = this.obtenerValues(tableDefectosPrimarios);
    var list = this.mergeById (this.listaDefectosPrimarios, result) 
    for (let item in list)
    {
        var detalleDefectoPrimario = new AnalisisFisicoDefectoPrimarioDetalleList();
        detalleDefectoPrimario.Valor = list[Number(item)].valor != null? Number(list[Number(item)].valor): null;
        detalleDefectoPrimario.DefectoDetalleDescripcion = list[Number(item)].Label;
        detalleDefectoPrimario.DefectoDetalleEquivalente = list[Number(item)].Val1;
        detalleDefectoPrimario.DefectoDetalleId = list[Number(item)].Codigo;
        listDetalleDefectosPrimarios.push(detalleDefectoPrimario);

    }
    return listDetalleDefectosPrimarios;
  }

  obtenerDetalleDefectosSecundarios(tableDefectosSecundarios)
  {
    let result: any[];
    let listDetalleDefectosSecundarios= new  Array<AnalisisFisicoDefectoSecundarioDetalleList>();
    
    result = this.obtenerValues(tableDefectosSecundarios);
    var list = this.mergeById (this.listaDefectosSecundarios, result) 
    for (let item in list)
    {
        var detalleDefectoSecundario = new AnalisisFisicoDefectoSecundarioDetalleList();
        detalleDefectoSecundario.Valor = list[Number(item)].valor != null? Number(list[Number(item)].valor): null;
        detalleDefectoSecundario.DefectoDetalleDescripcion = list[Number(item)].Label;
        detalleDefectoSecundario.DefectoDetalleEquivalente = list[Number(item)].Val1;
        detalleDefectoSecundario.DefectoDetalleId = list[Number(item)].Codigo;
        listDetalleDefectosSecundarios.push(detalleDefectoSecundario);

    }
    return listDetalleDefectosSecundarios;
  }

  obtenerAnalisisSensorialAtributos(tableSensorialRanking)
  {
    let result: any[];
    let listAnalisisAtributos= new  Array<AnalisisSensorialAtributoDetalleList>();
    result = this.obtenerValuesAtrib(tableSensorialRanking);
    var list = this.mergeById (this.listaSensorialAtributos, result) 
    for (let item in list)
    {
        var detalleAtributo= new AnalisisSensorialAtributoDetalleList();
        detalleAtributo.Valor = list[Number(item)].valor != null? Number(list[Number(item)].valor): null;
        detalleAtributo.AtributoDetalleDescripcion = list[Number(item)].Label;
        detalleAtributo.AtributoDetalleId = list[Number(item)].Codigo;
        listAnalisisAtributos.push(detalleAtributo);

    }
    return listAnalisisAtributos;
  }
  obtenerAnalisisSensorialDefectos(tableSensorialDefectos)
  {
    let result: any[];
    let listAnalisisDefectos= new  Array<AnalisisSensorialDefectoDetalleList>();
    
    result = this.obtenerValues(tableSensorialDefectos);
    var list = this.mergeById (this.listaSensorialDefectos, result) 
    for (let item in list)
    {
        var detalleDefectos= new AnalisisSensorialDefectoDetalleList();
        detalleDefectos.Valor = list[Number(item)].valor?list[Number(item)].valor: false;
        detalleDefectos.DefectoDetalleDescripcion = list[Number(item)].Label;
        detalleDefectos.DefectoDetalleId = list[Number(item)].Codigo;
        listAnalisisDefectos.push(detalleDefectos);
    }
    return listAnalisisDefectos;
  }

  obtenerRegistroTostado (tableRegistroTostado)
  {
    let result: any[];
    let listRegistroTostado= new  Array<RegistroTostadoIndicadorDetalleList>();
    
    result = this.obtenerValues(tableRegistroTostado);
    var list = this.mergeById (this.listaIndicadorTostado, result) 
    for (let item in list)
    {
        var detalleRegistroTostado= new RegistroTostadoIndicadorDetalleList();
        detalleRegistroTostado.Valor = list[Number(item)].valor != null? Number(list[Number(item)].valor): null;
        detalleRegistroTostado.IndicadorDetalleDescripcion = list[Number(item)].Label;
        detalleRegistroTostado.IndicadorDetalleId = list[Number(item)].Codigo;
        listRegistroTostado.push(detalleRegistroTostado);

    }
    return listRegistroTostado;
  }
  calcularTotalesRendExportable()
  {
    if(this.formControlCalidad.controls["exportGramos"].value == "" && this.formControlCalidad.controls["descarteGramos"].value == "" &&
    this.formControlCalidad.controls["cascarillaGramos"].value == "")
    {
      this.formControlCalidad.controls['totalPorcentaje'].setValue(0+"%");
      this.formControlCalidad.controls['totalGramos'].setValue(0);
      this.formControlCalidad.controls['cascarillaPorcentaje'].setValue(0+"%");
      this.formControlCalidad.controls['exportPorcentaje'].setValue(0+"%");
      this.formControlCalidad.controls['descartePorcentaje'].setValue(0+ "%");
    }
    else
    {
    const exportGramos= Number(this.formControlCalidad.controls["exportGramos"].value);
    const descarteGramos = Number(this.formControlCalidad.controls["descarteGramos"].value)
    const cascarillaGramos = Number(this.formControlCalidad.controls["cascarillaGramos"].value);
    const totalRendExportable = exportGramos + descarteGramos  + cascarillaGramos;
    this.formControlCalidad.controls['totalGramos'].setValue(totalRendExportable);
    this.formControlCalidad.controls['cascarillaPorcentaje'].setValue((Number(cascarillaGramos/totalRendExportable)*100).toFixed(2)+"%");
    this.formControlCalidad.controls['exportPorcentaje'].setValue((Number(exportGramos / totalRendExportable)*100).toFixed(2) + "%");
    this.formControlCalidad.controls['descartePorcentaje'].setValue((Number(descarteGramos / totalRendExportable)*100).toFixed(2) + "%");
    const cascarillaPorcentaje = this.formControlCalidad.controls["cascarillaPorcentaje"].value;
    const exportPorcentaje = this.formControlCalidad.controls["exportPorcentaje"].value;
    const descartePorcentaje = this.formControlCalidad.controls["descartePorcentaje"].value;
    const totalPorcentaje = Number(cascarillaPorcentaje.slice(0,cascarillaPorcentaje.length-1)) + Number(exportPorcentaje.slice(0,exportPorcentaje.length-1)) + Number(descartePorcentaje.slice(0,descartePorcentaje.length-1));
    this.formControlCalidad.controls['totalPorcentaje'].setValue( totalPorcentaje+ "%");
    }
  }

  mergeById (array1, array2) 
  {
    return array1.map(itm => ({
      ...array2.find((item) => (item.Codigo === itm.Codigo) && item),
      ...itm
    }));
  }

 obtenerValues(table)
 {
  let result: any[];
  result = [];
  for (let key in  table.value) {
        result.push({Codigo:key.split("%")[1], valor:table.value[key]})
  }
  return result;
 }
 obtenerValuesAtrib(table)
 {
  let result: any[], key;
  result = [];
  for (key in  table.value) {
     if (key.split("%")[0] != "sensorialAtribRanking")
     {
        result.push({Codigo:key.split("%")[1], valor:table.value[key]})
    }
  }
  return result;
 }

 
 obtenerDetalle()
 {
  var form = this;
  var controlFormControlCalidad = this.formControlCalidad.controls;
  controlFormControlCalidad["exportGramos"].setValue(this.detalleMateriaPrima.ExportableGramosAnalisisFisico);
  controlFormControlCalidad["exportPorcentaje"].setValue(this.detalleMateriaPrima.ExportablePorcentajeAnalisisFisico==null?"": this.detalleMateriaPrima.ExportablePorcentajeAnalisisFisico +"%");
  controlFormControlCalidad["descarteGramos"].setValue(this.detalleMateriaPrima.DescarteGramosAnalisisFisico);
  controlFormControlCalidad["descartePorcentaje"].setValue(this.detalleMateriaPrima.DescartePorcentajeAnalisisFisico==null?"": this.detalleMateriaPrima.DescartePorcentajeAnalisisFisico + "%");
  controlFormControlCalidad["cascarillaGramos"].setValue(this.detalleMateriaPrima.CascarillaGramosAnalisisFisico);
  controlFormControlCalidad["cascarillaPorcentaje"].setValue(this.detalleMateriaPrima.CascarillaPorcentajeAnalisisFisico==null?"":this.detalleMateriaPrima.CascarillaPorcentajeAnalisisFisico +"%");
  controlFormControlCalidad["totalGramos"].setValue(this.detalleMateriaPrima.TotalGramosAnalisisFisico);
  controlFormControlCalidad["totalPorcentaje"].setValue(this.detalleMateriaPrima.TotalPorcentajeAnalisisFisico==null?"": this.detalleMateriaPrima.TotalPorcentajeAnalisisFisico + "%");
  controlFormControlCalidad["humedad"].setValue(this.detalleMateriaPrima.HumedadPorcentajeAnalisisFisico);
  controlFormControlCalidad["ObservacionAnalisisFisico"].setValue(this.detalleMateriaPrima.ObservacionAnalisisFisico);
  controlFormControlCalidad["ObservacionRegTostado"].setValue(this.detalleMateriaPrima.ObservacionRegistroTostado);
  controlFormControlCalidad["ObservacionAnalisisSensorial"].setValue(this.detalleMateriaPrima.ObservacionAnalisisSensorial);
  form.responsable = this.detalleMateriaPrima.UsuarioCalidad;
  form.fechaCalidad = form.dateUtil.formatDate(new Date(this.detalleMateriaPrima.FechaCalidad),"/");
  
  let analisisFisicoColorDetalleList: AnalisisFisicoColorDetalleList[] = this.detalleMateriaPrima.AnalisisFisicoColorDetalle;
  analisisFisicoColorDetalleList.forEach(function (value) {
    form.tableColor.controls["CheckboxColor%"+ value.ColorDetalleId].setValue(value.Valor);  
  });

  let analisisFisicoOlorDetalleList: AnalisisFisicoOlorDetalleList[] = this.detalleMateriaPrima.AnalisisFisicoOlorDetalle;
  analisisFisicoOlorDetalleList.forEach(function (value) {
    form.tableOlor.controls["CheckboxOlor%"+ value.OlorDetalleId].setValue(value.Valor);  
  });

  let analisisFisicoDefectoPrimarioDetalleList: AnalisisFisicoDefectoPrimarioDetalleList[] = this.detalleMateriaPrima.AnalisisFisicoDefectoPrimarioDetalle;
  analisisFisicoDefectoPrimarioDetalleList.forEach(function (value) {
    form.tableDefectosPrimarios.controls["DefPrimario%"+ value.DefectoDetalleId].setValue(value.Valor);  
  });

  let analisisFisicoDefectoSecundarioDetalleList: AnalisisFisicoDefectoSecundarioDetalleList[] = this.detalleMateriaPrima.AnalisisFisicoDefectoSecundarioDetalle;
  analisisFisicoDefectoSecundarioDetalleList.forEach(function (value) {
    form.tableDefectosSecundarios.controls["DefSecundarios%"+ value.DefectoDetalleId].setValue(value.Valor);  
  });

  let analisisSensorialAtributoDetalleList: AnalisisSensorialAtributoDetalleList[] = this.detalleMateriaPrima.AnalisisSensorialAtributoDetalle;
  analisisSensorialAtributoDetalleList.forEach(function (value) {
    form.tableSensorialRanking.controls["sensorialAtrib%"+ value.AtributoDetalleId].setValue(value.Valor); 
    form.tableSensorialRanking.controls["sensorialAtribRanking%"+ value.AtributoDetalleId].setValue(form.evaluar(value.Valor));
  });

  let analisisSensorialDefectoDetalleList: AnalisisSensorialDefectoDetalleList[] = this.detalleMateriaPrima.AnalisisSensorialDefectoDetalle;
  analisisSensorialDefectoDetalleList.forEach(function (value) {
    form.tableSensorialDefectos.controls["checkboxSenDefectos%"+ value.DefectoDetalleId].setValue(value.Valor);  
  });

  let registroTostadoIndicadorDetalleList: RegistroTostadoIndicadorDetalleList[] = this.detalleMateriaPrima.RegistroTostadoIndicadorDetalle;
  registroTostadoIndicadorDetalleList.forEach(function (value) {
    form.tableRegistroTostado.controls["tostado%"+ value.IndicadorDetalleId].setValue(value.Valor);  
    
  });
 }

 cancelar()
 {
  this.router.navigate(['/operaciones/guiarecepcionmateriaprima-list']);
 }
 
}
