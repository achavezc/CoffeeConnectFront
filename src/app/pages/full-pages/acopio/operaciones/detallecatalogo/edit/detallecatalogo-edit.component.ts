import { Component, OnInit, ViewEncapsulation, ViewChild, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators, FormGroup, ValidatorFn, ValidationErrors } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";
import { DetalleCatalogoService } from '../../../../../../services/detallecatalogo.service';

import { SocioService } from '../../../../../../services/socio.service';
import { AlertUtil } from '../../../../../../services/util/alert-util';
import { MaestroService } from '../../../../../../services/maestro.service';
import { ILogin } from '../../../../../../services/models/login';
import { formatCurrency } from '@angular/common';

@Component({
  selector: 'app-detallecatalogo-edit',
  templateUrl: './detallecatalogo-edit.component.html',
  styleUrls: ['./detallecatalogo-edit.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DetalleCatalogoEditComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private socioService: SocioService,
    private router: Router,
    private alertUtil: AlertUtil,
    private spinner: NgxSpinnerService,
    private maestroService: MaestroService,
    private detalleCatalogoService : DetalleCatalogoService) { }

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
    this.detalleCatalogoService.ConsultarPorId({ DetalleCatalogoId: this.vId }).subscribe((res: any) => {
     
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

   
    if (data.IdCatalogo) {
        this.precioDiaEditForm.controls.producto.setValue(data.IdCatalogo);
    }
    if (data.Codigo) {
      this.precioDiaEditForm.controls.codigo.setValue(data.Codigo);
    }
    if (data.Label) {
      this.precioDiaEditForm.controls.label.setValue(data.Label);
    }
    if (data.Descripcion) {
      this.precioDiaEditForm.controls.descripcion.setValue(data.Descripcion);
    }
    if (data.Val1) {
      this.precioDiaEditForm.controls.val1.setValue(data.Val1);
    }
    if (data.Val2) {
        this.precioDiaEditForm.controls.val2.setValue(data.Val2);
    }
    if (data.Mnemonico) {
        this.precioDiaEditForm.controls.mnemonico.setValue(data.Mnemonico);
    }
    if (data.CodigoPadre) {
        this.precioDiaEditForm.controls.codigoPadre.setValue(data.CodigoPadre);
    }
    if (data.EstadoId) {
      this.precioDiaEditForm.controls.estado.setValue(data.EstadoId);
    }
   
    this.spinner.hide();
  }

  LoadForm() {
    this.precioDiaEditForm = this.fb.group({
      codigo: ['',Validators.required],
      label: ['', Validators.required],
      descripcion: ['', ],
      val1: ['',],
      val2: ['',],
      estado: ['',Validators.required],
      mnemonico: ['',],
      codigoPadre: ['',],
      producto: ['',Validators.required]
    });
    
  }

  get f() {
    return this.precioDiaEditForm.controls;
  }

   LoadCombos() {
   this.GetEstados();
   this.GetListProducto();
  }

  async GetListProducto() {
    let form = this;
    let res = await this.detalleCatalogoService.ConsultarCatalogoTablas().toPromise();
    if (res.Result.Success) {
      form.listProducto = res.Result.Data;
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
        form.CreatePrecioDia();
      }
      else{

        form.ActualizarPrecioDia();
      }
          
    }    
  }

  ActualizarPrecioDia(): void {
    
    var request = this.getRequest();
    this.detalleCatalogoService.Actualizar(request)
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
      this.detalleCatalogoService.Registrar(request)
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
        IdDetalleCatalogo: this.vId ,
        IdCatalogo: this.precioDiaEditForm.controls["producto"].value ? this.precioDiaEditForm.controls["producto"].value: '',
        Codigo: this.precioDiaEditForm.value.codigo ? this.precioDiaEditForm.value.codigo : '',
        Label: this.precioDiaEditForm.value.label ? this.precioDiaEditForm.value.label : '',
        Descripcion: this.precioDiaEditForm.value.descripcion ? this.precioDiaEditForm.value.descripcion : '',
        Mnemonico: this.precioDiaEditForm.value.mnemonico ? this.precioDiaEditForm.value.mnemonico : '',
        Val1: this.precioDiaEditForm.value.val1 ? this.precioDiaEditForm.value.val1 : '',
        Val2: this.precioDiaEditForm.value.val2 ? this.precioDiaEditForm.value.val2 : '',
        EmpresaID: this.vSessionUser.Result.Data.EmpresaId,
        Usuario:  this.vSessionUser.Result.Data.NombreUsuario,
        CodigoPadre: this.precioDiaEditForm.value.codigoPadre ? this.precioDiaEditForm.value.codigoPadre : '',
        EstadoId: this.precioDiaEditForm.controls["estado"].value ? this.precioDiaEditForm.controls["estado"].value: ''
    };
  }

  Cancel(): void {
    this.router.navigate(['/acopio/operaciones/detallecatalogo-list']);
  }

 
}
