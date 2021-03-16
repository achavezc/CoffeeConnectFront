import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn, FormBuilder } from '@angular/forms';
import { MaestroService } from '../../../../../../../services/maestro.service';
import { NotaCompraService } from '../../../../../../../services/nota-compra.service';
import { Observable } from 'rxjs';
import { NgxSpinnerService } from "ngx-spinner";
import { AlertUtil } from '../../../../../../../services/util/alert-util';
import {Router} from "@angular/router";
import { ILogin } from '../../../../../../../services/models/login';
import { host } from '../../../../../../../shared/hosts/main.host';

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
  listTipo: [];
  selectedTipo: any;
  selectedUnidadMedida: any;
  selectedMoneda: any;
  selectedEstado: any;
  mensajeErrorGenerico = "Ocurrio un error interno.";
  errorGeneral: any = { isError: false, errorMessage: '' };
  login: ILogin;
  id = 0;
  subedit = false;

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
          dsctoHumedadPC:  ['', Validators.required ],
          humedadAT:  ['', ],
          kilosNetosDescontarPC:  ['', ],
          kiloNetoPagarPC:  ['', ],
          monedaAT:  ['', ],
          qqKgPC:  ['', ],
          precioDiaAT:  ['', ],
          precioGuardadoAT:  ['', ],
          precioPagadoAT:  ['', ],
          importeAT:  ['', ],
          tipo:  ['', Validators.required],
          numero:  ['', ],
          
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
    res = await this.maestroService.obtenerMaestros('TipoNotaCompra').toPromise();
    if (res.Result.Success) {
      this.listTipo = res.Result.Data;
    }
  }



 async obtenerDetalle()
 {
  await this.LoadCombos();
  var data = this.detalleMateriaPrima;
  this.login = JSON.parse(localStorage.getItem("user"));
  if(data.NotaCompra == null){
      
      this.notaCompraForm.controls['unidadMedida'].setValue(data.UnidadMedidaIdPesado);
      this.notaCompraForm.controls['cantidadPC'].setValue(data.CantidadPesado);
      this.notaCompraForm.controls['kilosBrutosPC'].setValue(data.KilosBrutosPesado);
      this.notaCompraForm.controls['taraPC'].setValue(data.TaraPesado);
      
      var kilosNetos = Number(data.KilosBrutosPesado - data.TaraPesado)
      var valorkilosNetos = Math.round((kilosNetos + Number.EPSILON) * 100) / 100

      this.notaCompraForm.controls['kilosNetosPC'].setValue(valorkilosNetos);
      //this.notaCompraForm.controls['dsctoHumedadPC'].setValue(0);
      this.notaCompraForm.controls['humedadAT'].setValue(data.HumedadPorcentajeAnalisisFisico);
      this.notaCompraForm.controls['kilosNetosDescontarPC'].setValue(0);
      this.notaCompraForm.controls['kiloNetoPagarPC'].setValue(0);
      this.notaCompraForm.controls['qqKgPC'].setValue(0);
      
      var result = this.login.Result.Data.ProductoPreciosDia.filter(s => s.ProductoId == data.ProductoId && s.SubProductoId == data.SubProductoId);

      if(result.length>0){
        this.notaCompraForm.controls['precioDiaAT'].setValue(result[0].PrecioDia);
      }
      this.notaCompraForm.controls['precioGuardadoAT'].setValue(result[0].PrecioDia);

      this.notaCompraForm.controls['precioPagadoAT'].setValue(result[0].PrecioDia);

      this.notaCompraForm.controls['importeAT'].setValue(0);
      this.notaCompraForm.controls['monedaAT'].setValue(this.login.Result.Data.MonedaId);


      this.notaCompraForm.controls['exportableAT'].setValue(data.ExportableGramosAnalisisFisico);
      this.notaCompraForm.controls['descarteAT'].setValue(data.DescarteGramosAnalisisFisico);
      this.notaCompraForm.controls['cascarillaAT'].setValue(data.CascarillaGramosAnalisisFisico);
      this.notaCompraForm.controls['totalAT'].setValue(data.TotalGramosAnalisisFisico);
  }else{
    this.id = data.NotaCompra.NotaCompraId
    this.notaCompraForm.controls['numero'].setValue(data.NotaCompra.Numero);
    this.notaCompraForm.controls['tipo'].setValue(data.NotaCompra.TipoId);
    this.notaCompraForm.controls['unidadMedida'].setValue(data.NotaCompra.UnidadMedidaIdPesado);
    this.notaCompraForm.controls['cantidadPC'].setValue(data.NotaCompra.CantidadPesado);
    this.notaCompraForm.controls['kilosBrutosPC'].setValue(data.NotaCompra.KilosBrutosPesado);
    this.notaCompraForm.controls['taraPC'].setValue(data.NotaCompra.TaraPesado);

    this.notaCompraForm.controls['kilosNetosPC'].setValue(data.NotaCompra.KilosNetosPesado);
    this.notaCompraForm.controls['dsctoHumedadPC'].setValue(data.NotaCompra.DescuentoPorHumedad);

    //duda
    this.notaCompraForm.controls['humedadAT'].setValue(data.HumedadPorcentajeAnalisisFisico);
    
    this.notaCompraForm.controls['kilosNetosDescontarPC'].setValue(data.NotaCompra.KilosNetosDescontar);
    this.notaCompraForm.controls['kiloNetoPagarPC'].setValue(data.NotaCompra.KilosNetosPagar);
    this.notaCompraForm.controls['qqKgPC'].setValue(data.NotaCompra.QQ55);

    var result = this.login.Result.Data.ProductoPreciosDia.filter(s => s.ProductoId == data.ProductoId && s.SubProductoId == data.SubProductoId);

    if(result.length>0){
      this.notaCompraForm.controls['precioDiaAT'].setValue(result[0].PrecioDia);
    }
    this.notaCompraForm.controls['precioGuardadoAT'].setValue(data.NotaCompra.PrecioGuardado);

    if(data.NotaCompra.PrecioGuardado >result[0].PrecioDia){
      this.notaCompraForm.controls['precioPagadoAT'].setValue(data.NotaCompra.PrecioGuardado);
    }else{
      this.notaCompraForm.controls['precioPagadoAT'].setValue(result[0].PrecioDia);
    }

    

    this.notaCompraForm.controls['importeAT'].setValue(data.NotaCompra.Importe);
    this.notaCompraForm.controls['monedaAT'].setValue(data.NotaCompra.MonedaId);


    this.notaCompraForm.controls['exportableAT'].setValue(data.ExportableGramosAnalisisFisico);
    this.notaCompraForm.controls['descarteAT'].setValue(data.DescarteGramosAnalisisFisico);
    this.notaCompraForm.controls['cascarillaAT'].setValue(data.CascarillaGramosAnalisisFisico);
    this.notaCompraForm.controls['totalAT'].setValue(data.TotalGramosAnalisisFisico);
  }
 }



 guardar(){
    
  if (this.notaCompraForm.invalid) {
    this.subedit = true;
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
      var request = {
        NotaCompraId: this.id,
        GuiaRecepcionMateriaPrimaId: this.detalleMateriaPrima.GuiaRecepcionMateriaPrimaId,
        EmpresaId: this.login.Result.Data.EmpresaId,
        Numero:this.notaCompraForm.controls['numero'].value,
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
        TipoId : this.notaCompraForm.controls['tipo'].value,
        MonedaId: this.notaCompraForm.controls['monedaAT'].value,
        PrecioGuardado: this.notaCompraForm.controls['precioGuardadoAT'].value,
        PrecioPagado: this.notaCompraForm.controls['precioPagadoAT'].value,
        Importe: this.notaCompraForm.controls['importeAT'].value,
        UsuarioNotaCompra: this.detalleMateriaPrima.UsuarioPesado
      };
      
      if(this.id != 0){
        this.actualizarService(request);
      }else{
        this.guardarService(request);
      }
      
   
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

actualizarService(request: any){
  this.notaCompraService.Actualizar(request)
  .subscribe(res => {
    this.spinner.hide();
    if (res.Result.Success) {
      if (res.Result.ErrCode == "") {
        var form = this;
        this.alertUtil.alertOkCallback('Actualizado!', 'Nota Compra Actualizado.',function(result){
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

cancelar(){
  this.router.navigate(['/operaciones/guiarecepcionmateriaprima-list']);
}

changeDescuentoHumedad(){
  var kilosNetos = this.notaCompraForm.controls['kilosNetosPC'].value;
  var descuentoHumedad = this.notaCompraForm.controls['dsctoHumedadPC'].value;
  var precioDia = this.notaCompraForm.controls['precioDiaAT'].value;
  var kilosNetosDescontar = Number((kilosNetos * descuentoHumedad)/100);
  var kilosNetosPagar = Number(kilosNetos - kilosNetosDescontar);
  var qq60 = Number(kilosNetosPagar / 55.2);
  var importe = Number(kilosNetosPagar * precioDia);

  var valorkilosNetosDescontar = Math.round((kilosNetosDescontar + Number.EPSILON) * 100) / 100
  var valorkilosNetosPagar = Math.round((kilosNetosPagar + Number.EPSILON) * 100) / 100
  var valorqq60 = Math.round((qq60 + Number.EPSILON) * 100) / 100
  var valorImporte = Math.round((importe + Number.EPSILON) * 100) / 100

  this.notaCompraForm.controls['kilosNetosDescontarPC'].setValue(valorkilosNetosDescontar);
  this.notaCompraForm.controls['kiloNetoPagarPC'].setValue(valorkilosNetosPagar);
  this.notaCompraForm.controls['qqKgPC'].setValue(valorqq60);
  this.notaCompraForm.controls['importeAT'].setValue(valorImporte);
}

Print(): void {
  if (this.detalleMateriaPrima.NotaCompra != null) {
    let link = document.createElement('a');
    document.body.appendChild(link);
    link.href = `${host}NotaCompra/GenerarPDF?id=${this.detalleMateriaPrima.GuiaRecepcionMateriaPrimaId}`;
    link.download = "NotaCompra.pdf"
    link.target = "_blank";
    link.click();
    link.remove();
  }
}

}
