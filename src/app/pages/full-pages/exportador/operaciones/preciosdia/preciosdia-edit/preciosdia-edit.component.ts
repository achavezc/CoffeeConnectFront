import { Component, OnInit, ViewEncapsulation, ViewChild, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators, FormGroup, ValidatorFn, ValidationErrors } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";
import { ProductoPrecioDiaService } from '../../../../../../services/preciosdia.service';

import { SocioService } from '../../../../../../services/socio.service';
import { AlertUtil } from '../../../../../../services/util/alert-util';
import { MaestroService } from '../../../../../../services/maestro.service';
import { ILogin } from '../../../../../../services/models/login';
import { formatCurrency } from '@angular/common';

@Component({
  selector: 'app-preciodia-edit',
  templateUrl: './preciosdia-edit.component.html',
  styleUrls: ['./preciosdia-edit.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PrecioDiaEditComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private socioService: SocioService,
    private router: Router,
    private alertUtil: AlertUtil,
    private spinner: NgxSpinnerService,
    private maestroService: MaestroService,
    private precioDiaService : ProductoPrecioDiaService) { }

  precioDiaEditForm: FormGroup;
  listMoneda: [];
  listProducto: [];  
  listEstado: [];
  listSubProducto: [];
  responsable: any = '';
  esEdit = false;
  selectedMoneda: any;
  selectedProducto: any;
  selectedEstado: any;
  selectedSubProducto: any;
  activo  = "01";
  vId: number = 0;
  errorGeneral = { isError: false, errorMessage: '' };
  vMensajeErrorGenerico: string = 'Ha ocurrido un error interno.';
  errorGenerico = { isError: false, msgError: '' };
  submittedEdit
  vSessionUser: ILogin;

  ngOnInit(): void {
    this.LoadForm();
    this.LoadCombos();
    this.vSessionUser = JSON.parse(localStorage.getItem('user'));
    this.route.queryParams
    .subscribe(params => {
      if (Number(params.id)) {
        this.vId = Number(params.id);
        this.ConsultarPorId();
        this.esEdit= true;
      }
    });
  }

  ConsultarPorId() {
    this.spinner.show();
    this.precioDiaService.ConsultarPorId({ ProductoPrecioDiaId: this.vId }).subscribe((res: any) => {
     
      if (res.Result.Success) {
         this.CompletarFormulario(res.Result.Data);
      } else {
        this.spinner.hide();
      }
    }, (err: any) => {
      this.spinner.hide();
    })
  }

  async CompletarFormulario(data: any) {

    this.responsable = data.UsuarioRegistro;
    if (data.MonedaId) {
      this.precioDiaEditForm.controls.moneda.setValue(data.MonedaId);
    }
    if (data.ProductoId) {
      this.precioDiaEditForm.controls.producto.setValue(data.ProductoId);
      
      await this.changeSubProducto( data.ProductoId );
    }
    if (data.SubProductoId) {
      this.precioDiaEditForm.controls.subproducto.setValue(data.SubProductoId);
    }
    if (data.PrecioDia) {
      this.precioDiaEditForm.controls.precioDia.setValue(data.PrecioDia);
    }
    if (data.EstadoId) {
      this.precioDiaEditForm.controls.estado.setValue(data.EstadoId);
    }
    if (data.FechaRegistro) {
      this.precioDiaEditForm.controls.fecRegistro.setValue(data.FechaRegistro.substring(0, 10));
    }
   
    this.spinner.hide();
  }

  LoadForm() {
    this.precioDiaEditForm = this.fb.group({
      moneda: ['',Validators.required],
      producto: ['', Validators.required],
      subproducto: ['', Validators.required],
      precioDia: ['',Validators.required],
      estado: ['',Validators.required],
      fecRegistro: ['',Validators.required]
    });
    
  }

  get f() {
    return this.precioDiaEditForm.controls;
  }

   LoadCombos() {
   this.GetMoneda();
   this.GetProducto();
   this.GetEstados();
  }

  async GetMoneda() {
    const res = await this.maestroService.obtenerMaestros('Moneda').toPromise();
    if (res.Result.Success) {
      this.listMoneda = res.Result.Data;
     
    }
  }
  async GetProducto() {
    const res = await this.maestroService.obtenerMaestros('Producto').toPromise();
    if (res.Result.Success) {
      this.listProducto = res.Result.Data;
     
    }
  }
  async changeSubProducto(e) {
    //let filterProducto = e.Codigo;
    await this.cargarSubProducto(e);
    
  }
  async cargarSubProducto(codigo: any) {

    var data = await this.maestroService.obtenerMaestros("SubProducto").toPromise();
    if (data.Result.Success) {
      this.listSubProducto = data.Result.Data.filter(obj => obj.Val1 == codigo);
    }

  }
  async GetEstados() {

    var data = await this.maestroService.obtenerMaestros("EstadoMaestro").toPromise();
    if (data.Result.Success) {
      this.listEstado = data.Result.Data;
    }

    this.route.queryParams
    .subscribe(params => {
      if (!Number(params.id)) {
        this.precioDiaEditForm.controls.estado.setValue("01");
        this.precioDiaEditForm.controls.estado.disable();
      }
    });
   

  }

  Save(): void {
    const form = this;
    if (this.precioDiaEditForm.invalid) {
      this.submittedEdit = true;
      this.errorGeneral = { isError: true, errorMessage: 'Por favor completar los campos OBLIGATORIOS.' };
      return;
      } 
    else 
    {
      if (this.vId <= 0)
      {
        this.alertUtil.alertRegistro('Confirmación', `¿Está seguro de continuar con el registro?.` , function (result) {
          if (result.isConfirmed) {
            form.CreatePrecioDia();
          }
        });

      }
      else{
        this.alertUtil.alertRegistro('Confirmación', `¿Está seguro de continuar con la actualización?.` , function (result) {
          if (result.isConfirmed) {
            form.ActualizarPrecioDia();
          }
        });

       
      }
          
    }    
  }

  ActualizarPrecioDia(): void {
    
    var request = this.getRequest();
    this.precioDiaService.Actualizar(request)
      .subscribe((res: any) => {
        this.spinner.hide();
        if (res.Result.Success) {
          this.alertUtil.alertOkCallback("Se Actualizo!", "Se completo correctamente!",
            () => {
              this.Cancel();
            });
        } else {
          this.alertUtil.alertError("Error!", res.Result.Message);
        }
      }, (err: any) => {
        console.log(err);
        this.spinner.hide();
      });
  
}

  CreatePrecioDia(): void {
    
      var request = this.getRequest();
      this.precioDiaService.Registrar(request)
        .subscribe((res: any) => {
          this.spinner.hide();
          if (res.Result.Success) {
            this.alertUtil.alertOkCallback("Registrado!", "Se completo el registro correctamente!",
              () => {
                this.Cancel();
              });
          } else {
            this.alertUtil.alertError("Error!", res.Result.Message);
          }
        }, (err: any) => {
          console.log(err);
          this.spinner.hide();
        });
    
  }


  getRequest(): any {
    return {
      ProductoPrecioDiaId: this.vId ,
      MonedaId: this.precioDiaEditForm.value.moneda ? this.precioDiaEditForm.value.moneda : '',
      EmpresaId: this.vSessionUser.Result.Data.EmpresaId,
      ProductoId: this.precioDiaEditForm.value.producto ? this.precioDiaEditForm.value.producto : '',
      SubProductoId: this.precioDiaEditForm.value.subproducto ? this.precioDiaEditForm.value.subproducto : '',
      EstadoId: this.precioDiaEditForm.controls["estado"].value ? this.precioDiaEditForm.controls["estado"].value: '',
      PrecioDia: this.precioDiaEditForm.value.precioDia ? this.precioDiaEditForm.value.precioDia : '',
      Usuario: this.vSessionUser.Result.Data.NombreUsuario,
      Fecha: this.precioDiaEditForm.value.fecRegistro ? this.precioDiaEditForm.value.fecRegistro : '',
    };
  }

  Cancel(): void {
    this.router.navigate(['/exportador/operaciones/preciosdia/list']);
  }

 

  comparisonValidator(): ValidatorFn {
    return (group: FormGroup): ValidationErrors => {

      if (!group.value.mCodProductor && !group.value.mNombRazonSocial && !group.value.mTipoDocumento) {
        this.errorGeneral = { isError: true, errorMessage: 'Por favor ingresar al menos un filtro.' };
      } else if (group.value.mNroDocumento && !group.value.mTipoDocumento) {
        this.errorGeneral = { isError: true, errorMessage: 'Por favor seleccionar un tipo de documento.' };
      } else {
        this.errorGeneral = { isError: false, errorMessage: '' };
      }
      return;
    };
  }

}
