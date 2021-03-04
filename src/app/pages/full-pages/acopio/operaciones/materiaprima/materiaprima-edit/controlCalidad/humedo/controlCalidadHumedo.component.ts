import { Component, OnInit} from '@angular/core';
import { MaestroUtil } from '../../../../../../../../services/util/maestro-util';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-controlCalidadHumedo',
  templateUrl: './controlCalidadHumedo.component.html',
  styleUrls: ['./controlCalidadHumedo.component.scss']
})
export class ControlCalidadComponentHumedo implements OnInit {

   
      listaDefectosPrimarios : Observable<any[]>;
      listaDefectosSecundarios : Observable<any[]>;
      listaOlor : Observable<any[]>;
      listaColor : Observable<any[]>;
      listaSensorialAtributos: Observable<any[]>;
      listaSensorialRanking: Observable<any[]>;
      listaSensorialDefectos: Observable<any[]>;
      listaIndicadorTostado : Observable<any[]>;
      contador = 0;
       ngOnInit(): void {
         this.cargarCombos();
       }
   
       constructor(private maestroUtil: MaestroUtil){
       } 
       cargarCombos(){
         var form = this;
         //activar loading

       this.maestroUtil.obtenerMaestros("DefectosPrimarios", function (res) {
         if (res.Result.Success) {
           form.listaDefectosPrimarios = res.Result.Data;
           form.contador++;
           this.ocultarLoading()
         }
       });
       this.maestroUtil.obtenerMaestros("DefectosSecundarios", function (res) {
         if (res.Result.Success) {
           form.listaDefectosSecundarios = res.Result.Data;
           form.contador++;
           this.ocultarLoading()
         }
       });
       this.maestroUtil.obtenerMaestros("Olor", function (res) {
         if (res.Result.Success) {
           form.listaOlor = res.Result.Data;
           form.contador++;
           this.ocultarLoading()
         }
       });
       this.maestroUtil.obtenerMaestros("Color", function (res) {
         if (res.Result.Success) {
           form.listaColor = res.Result.Data;
           form.contador++;
           this.ocultarLoading()
         }
       });
       this.maestroUtil.obtenerMaestros("SensorialAtributos", function (res) {
         if (res.Result.Success) {
           form.listaSensorialAtributos = res.Result.Data;
           form.contador++;
           this.ocultarLoading()
         }
       });
       this.maestroUtil.obtenerMaestros("SensorialRanking", function (res) {
         if (res.Result.Success) {
           form.listaSensorialRanking = res.Result.Data;
           form.contador++;
           this.ocultarLoading()
         }
       });
       this.maestroUtil.obtenerMaestros("SensorialDefectos", function (res) {
         if (res.Result.Success) {
           form.listaSensorialDefectos = res.Result.Data;
           form.contador++;
           this.ocultarLoading()
         }
       });
       this.maestroUtil.obtenerMaestros("IndicadorTostado", function (res) {
         if (res.Result.Success) {
           form.listaIndicadorTostado= res.Result.Data;
           form.contador++;
           this.ocultarLoading()
         }
       });
     }

     ocultarLoading(){
       //if cumple elartificion para todos los maestros lo oculto 
      if(this.contador == 5){
        //cumple requisitos y oculto dl loading
      }else{
        //sigue mostrando
      }
       //else no lo oculta
     }
}