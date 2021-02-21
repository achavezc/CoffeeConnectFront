import { Component, OnInit} from '@angular/core';
import { MaestroUtil } from '../../../../../../../services/util/maestro-util';
import { Observable } from 'rxjs';
//import {Maestro} from '../../../../../../../services/models/maestro';
interface Maestro  {
  Codigo: string;
  CodigoTabla: string;
  Label: string;
  Descripcion: string;
  Mnemonico: string;
  Val1: string;
  Val2: string;
}
@Component({
  selector: 'app-controlCalidad',
  templateUrl: './controlCalidad.component.html',
  styleUrls: ['./controlCalidad.component.scss']
})
export class ControlCalidadComponent implements OnInit {

   listaDefectosPrimarios : Observable<any[]>;
   listaDefectosSecundarios : Observable<any[]>;
   listaOlor : Observable<any[]>;
   listaColor : Observable<any[]>;
   listaSensorialAtributos: Observable<any[]>;
   listaSensorialRanking: Observable<any[]>;
   listaSensorialDefectos: Observable<any[]>;
   listaIndicadorTostado : Observable<any[]>;
    ngOnInit(): void {
      this.cargarCombos();
    }

    constructor(private maestroUtil: MaestroUtil){
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
      }
    });
    this.maestroUtil.obtenerMaestros("Color", function (res) {
      if (res.Result.Success) {
        form.listaColor = res.Result.Data;
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
}
