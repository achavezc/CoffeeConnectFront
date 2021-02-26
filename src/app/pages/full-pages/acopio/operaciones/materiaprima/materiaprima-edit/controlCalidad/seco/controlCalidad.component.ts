import { Component, OnInit, ViewChild} from '@angular/core';
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
import {Router} from "@angular/router"


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
   reqControlCalidad: ReqControlCalidad;
   errorGeneral: any = { isError: false, errorMessage: '' };
  mensajeErrorGenerico = "Ocurrio un error interno.";

  constructor(private maestroUtil: MaestroUtil, private fb: FormBuilder, private numeroUtil: NumeroUtil,
    private acopioService : AcopioService,  private spinner: NgxSpinnerService,
    private alertUtil: AlertUtil, private router: Router){
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
    this.maestroUtil.obtenerMaestros("SensorialAtributos", function (res) {
      if (res.Result.Success) {
        form.listaSensorialAtributos = res.Result.Data;
        let group={}    
        form.listaSensorialAtributos.forEach(input_template=>{
          group['sensorialAtrib%'+input_template.Codigo]=new FormControl('',[]);  
          group['sensorialAtribRanking%'+input_template.Codigo]=new FormControl('',[]);  
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
          group['tostado%'+input_template.Codigo]=new FormControl('',[Validators.pattern(form.numeroUtil.numerosDecimales())]);  
        })
        form.tableRegistroTostado = new FormGroup(group);
      }
    });
    }
    cargarForm() {
    
    this.tableRendExport = new FormGroup(
      {
        exportGramos: new FormControl('',[Validators.required,Validators.pattern(this.numeroUtil.numerosDecimales())]),
        exportPorcentaje: new FormControl('',[Validators.pattern(this.numeroUtil.numerosDecimales())]),
        descarteGramos: new FormControl('',[Validators.pattern(this.numeroUtil.numerosDecimales())]),
        descartePorcentaje: new FormControl('',[Validators.pattern(this.numeroUtil.numerosDecimales())]),
        cascarillaGramos: new FormControl('',[Validators.pattern(this.numeroUtil.numerosDecimales())]),
        cascarillaPorcentaje: new FormControl('',[Validators.pattern(this.numeroUtil.numerosDecimales())]),
        humedad: new FormControl('',[Validators.pattern(this.numeroUtil.numerosDecimales())]),
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
    }
  get frendExport() {
    return this.tableRendExport.controls;
  }
  get fRegistroTostado() {
    return this.tableRegistroTostado.controls;
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
  }
 calcularTotalDefPrimario()
 {
    
  let totalDefPrimarios: number = 0;
  let totalDefSecundario: number = 0;
  for (let i =0; i < this.listaDefectosPrimarios.length; i++ )
  { 
    totalDefPrimarios = Number(this.tableDefectosPrimarios.controls['DefPrimario%'+this.listaDefectosPrimarios[i].Codigo].value) +  totalDefPrimarios;
  }
    this.tableRendExport.controls["SubTotalDefPrimario"].setValue(totalDefPrimarios);
    totalDefSecundario  = Number(this.tableRendExport.controls["SubTotalDefSecundario"].value);
    this.tableRendExport.controls["ToTalEquiDefectos"].setValue(totalDefPrimarios + totalDefSecundario);

    
 }
 calcularTotalDefSecundario()
 {
  let totalDefSecundario: number = 0;
  let totalDefPrimarios: number = 0;
  for (let i =0; i < this.listaDefectosSecundarios.length; i++ )
  { 
    totalDefSecundario = Number(this.tableDefectosSecundarios.controls['DefSecundarios%'+this.listaDefectosSecundarios[i].Codigo].value) +  totalDefSecundario;
  }
   this.tableRendExport.controls['SubTotalDefSecundario'].setValue(totalDefSecundario);
   totalDefPrimarios  = Number(this.tableRendExport.controls["SubTotalDefPrimario"].value);
   this.tableRendExport.controls["ToTalEquiDefectos"].setValue(totalDefPrimarios + totalDefSecundario);
 }
  test: any[];
  actualizarAnalisisControlCalidad (e)
  {
    let listaDetalleOlor = Array<AnalisisFisicoOlorDetalleList>();
    let listaDetalleColor = Array<AnalisisFisicoColorDetalleList>();
    let listaDefectosPrimarios = Array<AnalisisFisicoDefectoPrimarioDetalleList>();
    let listaDefectosSecundarios = Array<AnalisisFisicoDefectoSecundarioDetalleList>();
    let listaRegistroTostado = Array<RegistroTostadoIndicadorDetalleList>();
    let listaAnalisisSensorialDefectos= Array<AnalisisSensorialDefectoDetalleList>();
    let listaAnalisisSensorialAtrib = Array<AnalisisSensorialAtributoDetalleList>(); 
    var controlRendExport = this.tableRendExport.controls;
    listaDetalleOlor = this.obtenerDetalleAnalisisFisicoOlor(this.tableOlor);
    listaDetalleColor = this.obtenerDetalleAnalisisFisicoColor(this.tableColor);    
    listaDefectosPrimarios = this.obtenerDetalleDefectosPrimarios(this.tableDefectosPrimarios)
    listaDefectosSecundarios = this.obtenerDetalleDefectosSecundarios(this.tableDefectosSecundarios)
    listaRegistroTostado = this.obtenerRegistroTostado (this.tableRegistroTostado);
    listaAnalisisSensorialDefectos = this.obtenerAnalisisSensorialDefectos(this.tableSensorialDefectos)
    listaAnalisisSensorialAtrib= this.obtenerAnalisisSensorialAtributos(this.tableSensorialRanking);
    this.reqControlCalidad = new ReqControlCalidad(
    26,
    Number(controlRendExport["exportGramos"].value),
    Number((controlRendExport["exportPorcentaje"].value).split("%")[0]),
    Number(controlRendExport["descarteGramos"].value),
    Number((controlRendExport["descartePorcentaje"].value).split("%")[0]),
    Number(controlRendExport["cascarillaGramos"].value),
    Number((controlRendExport["cascarillaPorcentaje"].value).split("%")[0]),
    Number(controlRendExport["totalGramos"].value),
    Number((controlRendExport["totalPorcentaje"].value).split("%")[0]),
    Number(controlRendExport["humedad"].value),
    controlRendExport["ObservacionAnalisisFisico"].value,
    "mruiz",
    controlRendExport["ObservacionRegTostado"].value,
    controlRendExport["ObservacionAnalisisSensorial"].value,
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
            this.alertUtil.alertOk('Registrado!', 'Analisis Control Calidad');
            this.router.navigate(['/operaciones/guiarecepcionmateriaprima-edit'])
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

  obtenerDetalleAnalisisFisicoOlor(tableOlor)
  {
    let result: any[];
    let listDetalleOlor = new  Array<AnalisisFisicoOlorDetalleList>();
    result = this.obtenerValues(tableOlor, false);
    var list = this.mergeById (this.listaOlor, result) 
    let item;
    for (item in list)
    {
      if (list[Number(item)].valor)
      {
        var detalleOlor = new AnalisisFisicoOlorDetalleList();
        detalleOlor.Valor = list[Number(item)].valor;
        detalleOlor.OlorDetalleId = list[Number(item)].Codigo;
        detalleOlor.OlorDetalleDescripcion = list[Number(item)].Label;
        listDetalleOlor.push(detalleOlor);
      }

    }
    return listDetalleOlor;
  }

  obtenerDetalleAnalisisFisicoColor(tableColor)
  {
    let result: any[];
    let listDetalleColor = new  Array<AnalisisFisicoColorDetalleList>();
    result = this.obtenerValues(tableColor, false);
    var list = this.mergeById (this.listaColor, result) 
    let item;
    for (item in list)
    {
      if (list[Number(item)].valor)
      {
        var detalleColor = new AnalisisFisicoColorDetalleList();
        detalleColor.Valor = list[Number(item)].valor;
        detalleColor.ColorDetalleId = list[Number(item)].Codigo;
        detalleColor.ColorDetalleDescripcion = list[Number(item)].Label;
        listDetalleColor.push(detalleColor);
      }

    }
    return listDetalleColor;
  }
  obtenerDetalleDefectosPrimarios(tableDefectosPrimarios)
  {
    let result: any[];
    let listDetalleDefectosPrimarios = new  Array<AnalisisFisicoDefectoPrimarioDetalleList>();
    
    result = this.obtenerValues(tableDefectosPrimarios, "");
    var list = this.mergeById (this.listaDefectosPrimarios, result) 
    let item;
    for (item in list)
    {
        var detalleDefectoPrimario = new AnalisisFisicoDefectoPrimarioDetalleList();
        detalleDefectoPrimario.Valor = Number(list[Number(item)].valor);
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
    
    result = this.obtenerValues(tableDefectosSecundarios, "");
    var list = this.mergeById (this.listaDefectosSecundarios, result) 
    let item;
    for (item in list)
    {
        var detalleDefectoSecundario = new AnalisisFisicoDefectoSecundarioDetalleList();
        detalleDefectoSecundario.Valor = Number(list[Number(item)].valor);
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
    result = this.obtenerValuesAtrib(tableSensorialRanking, "");
    var list = this.mergeById (this.listaSensorialAtributos, result) 
    let item;
    for (item in list)
    {
        var detalleAtributo= new AnalisisSensorialAtributoDetalleList();
        detalleAtributo.Valor = Number(list[Number(item)].valor);
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
    
    result = this.obtenerValues(tableSensorialDefectos, false);
    var list = this.mergeById (this.listaSensorialDefectos, result) 
    let item;
    for (item in list)
    {
      if (list[Number(item)].valor)
      {
        var detalleDefectos= new AnalisisSensorialDefectoDetalleList();
        detalleDefectos.Valor = list[Number(item)].valor;
        detalleDefectos.DefectoDetalleDescripcion = list[Number(item)].Label;
        detalleDefectos.DefectoDetalleId = list[Number(item)].Codigo;
        listAnalisisDefectos.push(detalleDefectos);
      }

    }
    return listAnalisisDefectos;
  }

  obtenerRegistroTostado (tableRegistroTostado)
  {
    let result: any[];
    let listRegistroTostado= new  Array<RegistroTostadoIndicadorDetalleList>();
    
    result = this.obtenerValues(tableRegistroTostado, "");
    var list = this.mergeById (this.listaIndicadorTostado, result) 
    let item;
    for (item in list)
    {
        var detalleRegistroTostado= new RegistroTostadoIndicadorDetalleList();
        detalleRegistroTostado.Valor = Number(list[Number(item)].valor);
        detalleRegistroTostado.IndicadorDetalleDescripcion = list[Number(item)].Label;
        detalleRegistroTostado.IndicadorDetalleId = list[Number(item)].Codigo;
        listRegistroTostado.push(detalleRegistroTostado);

    }
    return listRegistroTostado;
  }
  calcularTotalesRendExportable()
  {
    if(this.tableRendExport.controls["exportGramos"].value == "" && this.tableRendExport.controls["descarteGramos"].value == "" &&
    this.tableRendExport.controls["cascarillaGramos"].value == "")
    {
      this.tableRendExport.controls['totalPorcentaje'].setValue(0+"%");
      this.tableRendExport.controls['totalGramos'].setValue(0);
      this.tableRendExport.controls['cascarillaPorcentaje'].setValue(0+"%");
      this.tableRendExport.controls['exportPorcentaje'].setValue(0+"%");
      this.tableRendExport.controls['descartePorcentaje'].setValue(0+ "%");
    }
    else
    {
    const exportGramos= Number(this.tableRendExport.controls["exportGramos"].value);
    const descarteGramos = Number(this.tableRendExport.controls["descarteGramos"].value)
    const cascarillaGramos = Number(this.tableRendExport.controls["cascarillaGramos"].value);
    const totalRendExportable = exportGramos + descarteGramos  + cascarillaGramos;
    this.tableRendExport.controls['totalGramos'].setValue(totalRendExportable);
    this.tableRendExport.controls['cascarillaPorcentaje'].setValue((Number(cascarillaGramos/totalRendExportable)*100).toFixed(2)+"%");
    this.tableRendExport.controls['exportPorcentaje'].setValue((Number(exportGramos / totalRendExportable)*100).toFixed(2) + "%");
    this.tableRendExport.controls['descartePorcentaje'].setValue((Number(descarteGramos / totalRendExportable)*100).toFixed(2) + "%");
    const cascarillaPorcentaje = this.tableRendExport.controls["cascarillaPorcentaje"].value;
    const exportPorcentaje = this.tableRendExport.controls["exportPorcentaje"].value;
    const descartePorcentaje = this.tableRendExport.controls["descartePorcentaje"].value;
    const totalPorcentaje = Number(cascarillaPorcentaje.slice(0,cascarillaPorcentaje.length-1)) + Number(exportPorcentaje.slice(0,exportPorcentaje.length-1)) + Number(descartePorcentaje.slice(0,descartePorcentaje.length-1));
    this.tableRendExport.controls['totalPorcentaje'].setValue( totalPorcentaje+ "%");
    }
  }

  mergeById (array1, array2) 
  {
    return array1.map(itm => ({
      ...array2.find((item) => (item.Codigo === itm.Codigo) && item),
      ...itm
    }));
  }

 obtenerValues(table, value)
 {
  let result: any[], key;
  result = [];
  for (key in  table.value) {
      if ( table.value[key] != value) {
        result.push({Codigo:key.split("%")[1], valor:table.value[key]})
      }
  }
  return result;
 }
 obtenerValuesAtrib(table, value)
 {
  let result: any[], key;
  result = [];
  for (key in  table.value) {
     if (key.split("%")[0] != "sensorialAtribRanking")
     {
      if ( table.value[key] != value) {
        result.push({Codigo:key.split("%")[1], valor:table.value[key]})
      }
    }
  }
  return result;
 }

  
}
