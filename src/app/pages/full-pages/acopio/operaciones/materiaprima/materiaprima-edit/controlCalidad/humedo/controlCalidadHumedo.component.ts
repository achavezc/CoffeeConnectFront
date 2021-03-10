import { Component, OnInit, Input} from '@angular/core';
import { MaestroUtil } from '../../../../../../../../services/util/maestro-util';
import { Observable } from 'rxjs';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn , FormArray, FormBuilder} from '@angular/forms';
import { DateUtil } from '../../../../../../../../services/util/date-util';
import {ReqControlCalidad,AnalisisFisicoColorDetalleList, AnalisisFisicoOlorDetalleList} from '../../../../../../../../services/models/req-controlcalidad-actualizar'
import { ILogin } from '../../../../../../../../services/models/login';
import {Router} from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import {AcopioService} from '../../../../../../../../services/acopio.service';
import { AlertUtil } from '../../../../../../../../services/util/alert-util';
@Component({
  selector: 'app-controlCalidadHumedo',
  templateUrl: './controlCalidadHumedo.component.html',
  styleUrls: ['./controlCalidadHumedo.component.scss']
})
export class ControlCalidadComponentHumedo implements OnInit {

   
    @Input() detalleMateriaPrima : any;
    @Input() events: Observable<void>;
      tableOlor: FormGroup;
      tableColor: FormGroup;
      listaOlor : any[];
      listaColor : any[];
      formControlCalidadHumedo:FormGroup;
      responsable: string;
      fechaCalidad: string;
      login: ILogin;
      errorGeneral: any = { isError: false, errorMessage: '' };
      submitted = false;
      reqControlCalidad: ReqControlCalidad;
      mensajeErrorGenerico = "Ocurrio un error interno.";
     
       ngOnInit(): void {
        this.cargarForm()
         this.cargarCombos();
         this.events.subscribe(
          () => this.obtenerDetalle());
       }
   
       constructor(private maestroUtil: MaestroUtil, private dateUtil: DateUtil, private router: Router, 
        private spinner: NgxSpinnerService,private acopioService : AcopioService, private alertUtil: AlertUtil){
       } 

       cargarForm() {
        this.formControlCalidadHumedo = new FormGroup(
          {
            humedad: new FormControl('',[]),
            ObservacionAnalisisFisico: new FormControl('',[])
          });
        }
       cargarCombos(){
         var form = this;       
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
     }

     obtenerDetalle()
 {
  var form = this;
  var controlFormControlCalidad = this.formControlCalidadHumedo.controls;
  controlFormControlCalidad["humedad"].setValue(this.detalleMateriaPrima.HumedadPorcentajeAnalisisFisico);
  controlFormControlCalidad["ObservacionAnalisisFisico"].setValue(this.detalleMateriaPrima.ObservacionAnalisisFisico);
  form.responsable = this.detalleMateriaPrima.UsuarioCalidad;
  form.fechaCalidad = form.dateUtil.formatDate(new Date(this.detalleMateriaPrima.FechaCalidad),"/");
  
  if (this.detalleMateriaPrima.AnalisisFisicoColorDetalle!= null)
  {
  let analisisFisicoColorDetalleList: AnalisisFisicoColorDetalleList[] = this.detalleMateriaPrima.AnalisisFisicoColorDetalle;
  analisisFisicoColorDetalleList.forEach(function (value) {
    form.tableColor.controls["CheckboxColor%"+ value.ColorDetalleId].setValue(value.Valor);  
  });
}

if (this.detalleMateriaPrima.AnalisisFisicoOlorDetalle!= null)
{
  let analisisFisicoOlorDetalleList: AnalisisFisicoOlorDetalleList[] = this.detalleMateriaPrima.AnalisisFisicoOlorDetalle;
  analisisFisicoOlorDetalleList.forEach(function (value) {
    form.tableOlor.controls["CheckboxOlor%"+ value.OlorDetalleId].setValue(value.Valor);  
  });
}

 
 }
 actualizarAnalisisControlCalidad (e)
 {
  this.login = JSON.parse(localStorage.getItem("user"));
   if (this.formControlCalidadHumedo.invalid || this.errorGeneral.isError) 
   {
     this.submitted = true;
     return;
   }
   else
   {
   let listaDetalleOlor = Array<AnalisisFisicoOlorDetalleList>();
   let listaDetalleColor = Array<AnalisisFisicoColorDetalleList>(); 
   var controlFormControlCalidad = this.formControlCalidadHumedo.controls;
   listaDetalleOlor = this.obtenerDetalleAnalisisFisicoOlor(this.tableOlor);
   listaDetalleColor = this.obtenerDetalleAnalisisFisicoColor(this.tableColor);
   this.reqControlCalidad = new ReqControlCalidad(
   this.login.Result.Data.EmpresaId,
   Number(this.detalleMateriaPrima.GuiaRecepcionMateriaPrimaId),
   Number(controlFormControlCalidad["humedad"].value),
   controlFormControlCalidad["ObservacionAnalisisFisico"].value,
   this.login.Result.Data.NombreCompletoUsuario,
   listaDetalleOlor,
   listaDetalleColor
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
 cancelar()
 {
  this.router.navigate(['/operaciones/guiarecepcionmateriaprima-list']);
 }
}