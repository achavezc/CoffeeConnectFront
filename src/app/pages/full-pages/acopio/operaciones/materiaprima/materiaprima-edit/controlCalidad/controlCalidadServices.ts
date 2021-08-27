import { Injectable } from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner";
import { AcopioService } from '../../../../../../../services/acopio.service';
import { AlertUtil } from '../../../../../../../services/util/alert-util';
import {Router} from "@angular/router";
import {OrdenservicioControlcalidadService} from '../../../../../../../services/ordenservicio-controlcalidad.service';
import {LoteService} from '../../../../../../../services/lote.service';
import {PlantaService} from  '../../../../../../../services/planta.service';


@Injectable({
    providedIn: 'root'
  })
export class ControlCalidadService {
    errorGeneral: any = { isError: false, errorMessage: '' };
    mensajeErrorGenerico = "Ocurrio un error interno.";

    constructor(
        private spinner: NgxSpinnerService,
        private acopioService: AcopioService,
        private alertUtil: AlertUtil,
        private router: Router,
        private ordenServicio : OrdenservicioControlcalidadService,
        private loteService: LoteService,
        private notaIngresoPlantaService: PlantaService) {
      }
      actualizarControlCalidadOrdenServicio(reqControlCalidad: any)
 {
  this.ordenServicio.ActualizarAnalisisCalidad(reqControlCalidad)
  .subscribe(res => {
    this.spinner.hide();
    if (res.Result.Success) {
      if (res.Result.ErrCode == "") {
        var form = this;
      this.alertUtil.alertOkCallback('Registrado!', 'Analisis Control Calidad',function(result){
        if(result.isConfirmed){
          form.router.navigate(['/operaciones/orderservicio-controlcalidadexterna-list']);
        }
      }
      );
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
 actualizarControlCalidadLote(reqControlCalidad: any)
 {
  var form = this;
  form.loteService.ActualizarAnalisisCalidad(reqControlCalidad)
  .subscribe(res => {
    form.spinner.hide();
    if (res.Result.Success) {
      if (res.Result.ErrCode == "") {
       
        form.alertUtil.alertOkCallback('Registrado!', 'Analisis Control Calidad',function(result){
        if(result.isConfirmed){
          form.router.navigate(['/operaciones/lotes-list']);
        }
      }
      );
      } else if (res.Result.Message != "" && res.Result.ErrCode != "") {
        return form.errorGeneral = { isError: true, errorMessage: res.Result.Message };
      } else {
        return form.errorGeneral = { isError: true, errorMessage: this.mensajeErrorGenerico };
      }
    } else {
      return form.errorGeneral = { isError: true, errorMessage: this.mensajeErrorGenerico };
    }
  },
    err => {
      form.spinner.hide();
      console.log(err);
      return form.errorGeneral = { isError: true, errorMessage: this.mensajeErrorGenerico };
    }
  );  
 }
actualizarControlCalidadMateriaPrima(reqControlCalidad: any)
{
 this.acopioService.Actualizar(reqControlCalidad)
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

actualizarControlCalidadNotaIngresoPlanta(reqControlCalidad: any)
{
    this.notaIngresoPlantaService.ActualizarAnalisisCalidad(reqControlCalidad)
 .subscribe(res => {
   this.spinner.hide();
   if (res.Result.Success) {
     if (res.Result.ErrCode == "") {
       var form = this;
     this.alertUtil.alertOkCallback('Registrado!', 'Analisis Control Calidad',function(result){
       if(result.isConfirmed){
         form.router.navigate(['/planta/operaciones/notaingreso-list']);
       }
     }
     );
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