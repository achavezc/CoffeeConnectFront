import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn, FormBuilder } from '@angular/forms';
import { MaestroService } from '../../../../../../../services/maestro.service';
import { NotaCompraService } from '../../../../../../../services/nota-compra.service';
import { Observable } from 'rxjs';
import { NgxSpinnerService } from "ngx-spinner";
import { AlertUtil } from '../../../../../../../services/util/alert-util';
import {Router} from "@angular/router"
@Component({
  selector:'app-notacompra',
  templateUrl: './notacompra.component.html',
  styleUrls: ['./notacompra.component.scss']
})
export class NotaCompraComponent implements OnInit {
  
  @Input() detalleMateriaPrima : any;
  notaCompraForm: FormGroup;
  listUnidadMedida: [];
  listMonedas: [];
  selectedUnidadMedida: any;
  selectedMoneda: any;
  selectedEstado: any;
  mensajeErrorGenerico = "Ocurrio un error interno.";
  errorGeneral: any = { isError: false, errorMessage: '' };
  @Input() events: Observable<void>;
  constructor(
    private maestroService: MaestroService,
    private notaCompraService: NotaCompraService,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private alertUtil: AlertUtil,
    private router: Router
    ) {
  }

  
  ngOnInit(): void {
    
    this.cargarForm();
    
    this.events.subscribe(
      () => this.obtenerDetalle());
  }
  
  cargarForm() {
      
      this.notaCompraForm =this.fb.group(
        {
          unidadMedida: ['', ],
          exportableAT:  ['', ],
          cantidadPC:  ['', ],
          descarteAT:  ['', ],
          kilosBrutosPC:  ['', ],
          cascarillaAT:  ['', ],
          taraPC:  ['', ],
          totalAT:  ['', ],
          kilosNetosPC:  ['', ],
          dsctoHumedadPC:  ['', ],
          humedadAT:  ['', ],
          kilosNetosDescontarPC:  ['', ],
          kiloNetoPagarPC:  ['', ],
          monedaAT:  ['', ],
          qqKgPC:  ['', ],
          precioDiaAT:  ['', ],
          precioGuardadoAT:  ['', ],
          precioPagadoAT:  ['', ],
          importeAT:  ['', ]
          
        });
  }
  async LoadCombos() {
    let res: any;
  
   
    res = await this.maestroService.obtenerMaestros('UnidadMedida').toPromise();
    if (res.Result.Success) {
      this.listUnidadMedida = res.Result.Data;
    }
    res = await this.maestroService.obtenerMaestros('Moneda').toPromise();
    if (res.Result.Success) {
      this.listMonedas = res.Result.Data;
    }
  }

 async obtenerDetalle()
 {
  await this.LoadCombos();
   var data = this.detalleMateriaPrima;
  this.notaCompraForm.controls['unidadMedida'].setValue(data.UnidadMedidaIdPesado);
  this.notaCompraForm.controls['cantidadPC'].setValue(data.CantidadPesado);
  this.notaCompraForm.controls['kilosBrutosPC'].setValue(data.KilosBrutosPesado);
  this.notaCompraForm.controls['taraPC'].setValue(data.TaraPesado);


  this.notaCompraForm.controls['kilosNetosPC'].setValue(0);
  this.notaCompraForm.controls['dsctoHumedadPC'].setValue(0);
  this.notaCompraForm.controls['humedadAT'].setValue(0);
  this.notaCompraForm.controls['kilosNetosDescontarPC'].setValue(0);
  this.notaCompraForm.controls['kiloNetoPagarPC'].setValue(0);
  this.notaCompraForm.controls['qqKgPC'].setValue(0);
  this.notaCompraForm.controls['precioDiaAT'].setValue(0);
  this.notaCompraForm.controls['precioGuardadoAT'].setValue(0);
  this.notaCompraForm.controls['precioPagadoAT'].setValue(0);
  this.notaCompraForm.controls['importeAT'].setValue(0);
  this.notaCompraForm.controls['monedaAT'].setValue("01");


  this.notaCompraForm.controls['exportableAT'].setValue(data.ExportableGramosAnalisisFisico);
  this.notaCompraForm.controls['descarteAT'].setValue(data.DescarteGramosAnalisisFisico);
  this.notaCompraForm.controls['cascarillaAT'].setValue(data.CascarillaGramosAnalisisFisico);
  this.notaCompraForm.controls['totalAT'].setValue(data.TotalGramosAnalisisFisico);
 }



 guardar(){
    
  if (this.notaCompraForm.invalid) {
    //this.submittedEdit = true;
    return;
  } else {
   
     this.spinner.show(undefined,
      {
        type: 'ball-triangle-path',
        size: 'medium',
        bdColor: 'rgba(0, 0, 0, 0.8)',
        color: '#fff',
        fullScreen: true
      });
      /* if(this.esEdit && this.id!=0){
        this.actualizarService(request);
      }else{
        this.guardarService(request);
      } */
      var request = {
        NotaCompraId: 0,
        GuiaRecepcionMateriaPrimaId: this.detalleMateriaPrima.GuiaRecepcionMateriaPrimaId,
        EmpresaId: 1,
        Numero:"1",
        UnidadMedidaIdPesado: this.notaCompraForm.controls['unidadMedida'].value,
        CantidadPesado: this.notaCompraForm.controls['cantidadPC'].value,
        KilosBrutosPesado: this.notaCompraForm.controls['kilosBrutosPC'].value,
        TaraPesado: this.notaCompraForm.controls['taraPC'].value,
        KilosNetosPesado: this.notaCompraForm.controls['kilosNetosPC'].value,
        DescuentoPorHumedad: this.notaCompraForm.controls['dsctoHumedadPC'].value,
        KilosNetosDescontar: this.notaCompraForm.controls['kilosNetosDescontarPC'].value,
        KilosNetosPagar: this.notaCompraForm.controls['kiloNetoPagarPC'].value,
        QQ55: this.notaCompraForm.controls['qqKgPC'].value,
        ExportableGramosAnalisisFisico: this.notaCompraForm.controls['exportableAT'].value,
        DescarteGramosAnalisisFisico: this.notaCompraForm.controls['descarteAT'].value,
        CascarillaGramosAnalisisFisico: this.notaCompraForm.controls['cascarillaAT'].value,
        TotalGramosAnalisisFisico: this.notaCompraForm.controls['totalAT'].value,
        HumedadPorcentajeAnalisisFisico: this.notaCompraForm.controls['humedadAT'].value,
        TipoId : "01",
        MonedaId: this.notaCompraForm.controls['monedaAT'].value,
        PrecioGuardado: 0,
        PrecioPagado: 0,
        Importe: 0,
        UsuarioNotaCompra: this.detalleMateriaPrima.UsuarioPesado
      };
      

      this.guardarService(request);
   
  }
 }
 
 guardarService(request: any){
  this.notaCompraService.Registrar(request)
  .subscribe(res => {
    this.spinner.hide();
    if (res.Result.Success) {
      if (res.Result.ErrCode == "") {
        var form = this;
        this.alertUtil.alertOkCallback('Registrado!', 'Nota Compra Registrada.',function(result){
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

}
