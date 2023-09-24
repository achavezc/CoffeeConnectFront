import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn, FormBuilder } from '@angular/forms';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from "ngx-spinner";
import { MaestroUtil } from '../../../../../../services/util/maestro-util';
import { NotaIngresoAlmacenPlantaService } from '../../../../../../services/nota-ingreso-almacen-planta-service';
import{NotaIngresoProductoTerminadoAlmacenPlantaService}from'../../../../../../Services/nota-ingreso-producto.service';
import { ReqRegistrarNotaIngresoProducto } from '../../../../../../services/models/req-registrar-notaingresoproducto';
import { ILogin } from '../../../../../../services/models/login';
import { ActivatedRoute } from '@angular/router';
import { DateUtil } from '../../../../../../services/util/date-util';
import { formatDate } from '@angular/common';
import { MaestroService } from '../../../../../../services/maestro.service';
import { AlertUtil } from '../../../../../../services/util/alert-util';
import { Router } from "@angular/router";
import {AuthService} from './../../../../../../services/auth.service';
import { NotaIngresoService } from '../../../../../../services/notaingreso.service';
import { ControlCalidadService } from '../../../../../../Services/control-calidad.service';
import { ThrowStmt } from '@angular/compiler';

@Component({
  selector: 'app-notaingresoproducto-edit',
  templateUrl: './notaingresoproducto-edit.component.html',
  styleUrls: ['./notaingresoproducto-edit.component.scss', "/assets/sass/libs/datatables.scss"],
  encapsulation: ViewEncapsulation.None
})

export class NotaIngresoProductoTerminadoEditComponent implements OnInit {
  consultaNotaIngresoProductoAlmacenFormEdit: FormGroup;
  submittedEdit = false;
  vSessionUser: any;
  listaAlmacen: any[];
  selectAlmacen: any;
  id: Number = 0;
  errorGeneral: any = { isError: false, errorMessage: '' };
  mensajeErrorGenerico = "Ocurrio un error interno.";
  fechaRegistro: any;
  responsable: "";
  numeroNota: "";
  viewCafeP: Boolean = false;
  codigoCafeP= "01";
  usuario="";
  NotaIngresoProductoTerminadoAlmacenPlantaId:number =0;
  //AlmacenId:string;
  readonly: boolean;
  detalle: any;
  popUp = true;
  selectSubProducto: any;
  listaSubProducto: any[];
  listaCertificacion: any[];
  listaCertificadora: any[];
  selectedCertificacion: any;
  selectedCertificadora: any;
  listaTipoProduccion: any[];
  listaTipo: any[];
  selectedAlmacen:any;
  selectedTipo: any;
  selectTipoProduccion: any;
  disabledControl: string = '';
  esAlmacen = true
  viewTagSeco: boolean = false;
  listaEmpaque: any[];
  selectedEmpaque: any;
  CodigoSacao = "01";
  CodigoTipoYute = "01";
  taraYute = 0.7
  tara = 0.2;
  controlCalidadPlantaId = 0;
  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private maestroUtil: MaestroUtil,
    private notaIngresoAlmacenPlantaService: NotaIngresoAlmacenPlantaService,
    private NotaIngresoProductoTerminadoAlmacenPlantaService:NotaIngresoProductoTerminadoAlmacenPlantaService,
    private route: ActivatedRoute,
    private dateUtil: DateUtil,
    private alertUtil: AlertUtil,
    private router: Router,
    private authService : AuthService,
    private notaIngresoService: NotaIngresoService,
    private controlCalidadService: ControlCalidadService,
    private modalService: NgbModal,
    private maestroService: MaestroService,
  ) {

  }

  ngOnInit(): void {
    this.cargarForm();
    this.cargarcombos();
    this.vSessionUser = JSON.parse(localStorage.getItem("user"));
    this.usuario = this.vSessionUser.Result.Data.NombreUsuario;
    this.route.queryParams
      .subscribe(params => {
        if (Number(params.id)) {
          this.id = Number(params.id);
          this.ConsultarPorId();

        }
      }
      );
      ////this.readonly= this.authService.esReadOnly(this.vSessionUser.Result.Data.OpcionesEscritura);
  }
  get frendExport() {
    return this.consultaNotaIngresoProductoAlmacenFormEdit.controls;
  }
  async cargarcombos() {
    var form = this;
    this.maestroUtil.obtenerMaestros("AlmacenPlanta", function (res) {
      if (res.Result.Success) {
        form.listaAlmacen = res.Result.Data;
      }
    });

    this.maestroUtil.obtenerMaestros("TipoCertificacionPlanta", function (res) {
      if (res.Result.Success) {
        form.listaCertificacion = res.Result.Data;
      }
    });

    this.maestroUtil.obtenerMaestros("EntidadCertificadoraPlanta", function (res) {
      if (res.Result.Success) {
        form.listaCertificadora = res.Result.Data;
      }
    });

    this.maestroUtil.obtenerMaestros("TipoProduccionPlanta", function (res) {
      if (res.Result.Success) {
        form.listaTipoProduccion = res.Result.Data;
      }
    });
    await this.cargaTipo();
    await this.cargaEmpaque();
  }
  async cargaEmpaque() {
    var data = await this.maestroService.obtenerMaestros("Empaque").toPromise();
    if (data.Result.Success) {
      this.listaEmpaque = data.Result.Data;
      
    }
  }
  async cargaTipo() {

    var data = await this.maestroService.obtenerMaestros("TipoEmpaque").toPromise();
    if (data.Result.Success) {
      this.listaTipo = data.Result.Data;
    }
  }

  async cargarSubProducto(codigo: any) {
    var data = await this.maestroService.obtenerMaestros("SubProductoPlanta").toPromise();
    if (data.Result.Success) {
      this.listaSubProducto = data.Result.Data.filter(obj => obj.Val1 == codigo);
    }
  }

  cargarForm() {
    this.consultaNotaIngresoProductoAlmacenFormEdit = this.fb.group(
      {
        RazonSocialEmpresaOrigen:new FormControl({ value: '', disabled: true }, []),
        RucEmpresaOrigen:new FormControl({ value: '', disabled: true }, []),
        RazonSocial:new FormControl({ value: '', disabled: true }, []),
        Ruc:new FormControl({ value: '', disabled: true }, []),
        Logo:new FormControl({ value: '', disabled: true }, []),
        direccion: new FormControl({ value: '', disabled: true }, []),
        Numero:new FormControl({ value: '', disabled: true }, []),
        NumeroNotaIngresoPlanta:new FormControl({ value: '', disabled: true }, []),
        NumeroGuiaRemision: new FormControl({ value: '', disabled: true }, []),
        cantidad: new FormControl({ value: '', disabled: true }, []),
        kgn:new FormControl({ value: '', disabled: true }, []),
        KilosNetos:new FormControl({ value: '', disabled: true }, []),
        KilosNetos46:new FormControl({ value: '', disabled: true }, []),
        producto: new FormControl({ value: '', disabled: true }, []),
        ProductoId: new FormControl({ value: '', disabled: true }, []),
        subproducto: new FormControl({ value: '', disabled: true }, []),
        SubProductoId: new FormControl({ value: '', disabled: true }, []),
        motivo: new FormControl({ value: '', disabled: true }, []),
        MotivoIngresoId: new FormControl({ value: '', disabled: true }, []),
        Almacen: new FormControl('', ),
       // AlmacenId:new FormControl('',),
        estado:new FormControl({ value: '', disabled: true }, []),
        EstadoId:new FormControl({ value: '', disabled: true }, []),
        EmpresaOrigen:new FormControl({ value: '', disabled: true }, []),
        NotaIngresoProductoTerminadoAlmacenPlanta:new FormControl({ value: '', disabled: true }, []),

        NotaIngresoPlanta:new FormControl({ value: '', disabled: true }, []),
        NumeroNotaIngresoProductoTerminadoAlmacenPlanta:new FormControl({ value: '', disabled: true }, []),
        NotaIngresoProductoTerminadoAlmacenPlantaId:new FormControl({ value: '', disabled: true }, []),
        Empresa:new FormControl({ value: '', disabled: true }, []),
        Tipo:new FormControl({ value: '', disabled: true }, []),
        Empaque:new FormControl({ value: '', disabled: true }, []),
        CantidadSalidaAlmacen:new FormControl({ value: '', disabled: true }, []),
        KilosNetosSalidaAlmacen:new FormControl({ value: '', disabled: true }, []),
        Usuario:new FormControl({ value: '', disabled: true }, []),
        Observacion:new FormControl({ value: '', disabled: true }, []),
        FechaRegistro:new FormControl({ value: '', disabled: true }, []),
        UsuarioRegistro:new FormControl({ value: '', disabled: true }, []),
        CantidadDisponible:new FormControl({ value: '', disabled: true }, []),
        KilosNetosDisponibles:new FormControl({ value: '', disabled: true }, []),
        LiquidacionProcesoPlanta:new FormControl({ value: '', disabled: true }, []),
      //  LiquidacionProcesoPlantaId:new FormControl({ value: '', disabled: true }, [])


      });
      //this.consultaNotaIngresoAlmacenFormEdit.get('pesado').disable();
     // this.consultaNotaIngresoAlmacenFormEdit.disable();

  }

 /* agregarControlCalidad(e) {
    this.obtenerDetalleControlCalidad(e[0].ControlCalidadPlantaId);

  }*/
  openModal(customContent) {
    this.modalService.open(customContent, { windowClass: 'dark-modal', size: 'xl', centered: true });
  }
  /*obtenerDetalleControlCalidad(id) {
    this.spinner.show();
    this.controlCalidadService.ConsultarPorId(Number(id))
      .subscribe(res => {

        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            this.detalle = res.Result.Data;
            if (this.detalle != null) {
              this.cargarDataFormulario(res.Result.Data);
              //this.detalle.requestPesado = this.obtenerRequest();
            } else {
              this.spinner.hide();
              this.modalService.dismissAll();
            }
          } else if (res.Result.Message != "" && res.Result.ErrCode != "") {
            this.errorGeneral = { isError: true, msgError: res.Result.Message };
            this.modalService.dismissAll();
          } else {
            this.errorGeneral = { isError: true, msgError: this.mensajeErrorGenerico };
            this.modalService.dismissAll();
          }
        } else {
          this.errorGeneral = { isError: true, msgError: this.mensajeErrorGenerico };
          this.modalService.dismissAll();
        }
      },
        err => {
          this.spinner.hide();
          this.modalService.dismissAll();
          console.log(err);
          this.errorGeneral = { isError: false, msgError: this.mensajeErrorGenerico };
        }
      );
  }*/

  get fedit() {
    return this.consultaNotaIngresoProductoAlmacenFormEdit.controls;
  }

  ConsultarPorId() {
    this.spinner.show();
    this.NotaIngresoProductoTerminadoAlmacenPlantaService.ConsultarPorId(Number(this.id))
      .subscribe(res => {
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            this.detalle = res.Result.Data;
            this.cargarDataFormulario(res.Result.Data);
          } else if (res.Result.Message != "" && res.Result.ErrCode != "") {
            this.errorGeneral = { isError: true, errorMessage: res.Result.Message };
          } else {
            this.errorGeneral = { isError: true, errorMessage: this.mensajeErrorGenerico };
          }
        } else {
          this.errorGeneral = { isError: true, errorMessage: this.mensajeErrorGenerico };
          this.spinner.hide();
        }
      },
        err => {
          this.spinner.hide();
          console.log(err);
          this.errorGeneral = { isError: false, errorMessage: this.mensajeErrorGenerico };
        }
      );
  }

  async cargarDataFormulario(data: any) { 
 
 
      this.consultaNotaIngresoProductoAlmacenFormEdit.controls["RazonSocialEmpresaOrigen"].setValue(data.RazonSocialEmpresaOrigen);
      this.consultaNotaIngresoProductoAlmacenFormEdit.controls["RazonSocial"].setValue(data.RazonSocial);
      this.consultaNotaIngresoProductoAlmacenFormEdit.controls["RucEmpresaOrigen"].setValue(data.RucEmpresaOrigen);
      this.consultaNotaIngresoProductoAlmacenFormEdit.controls["Ruc"].setValue(data.Ruc);
      this.consultaNotaIngresoProductoAlmacenFormEdit.controls["Logo"].setValue(data.Logo);

      this.consultaNotaIngresoProductoAlmacenFormEdit.controls["direccion"].setValue(data.Direccion);
      this.consultaNotaIngresoProductoAlmacenFormEdit.controls["Numero"].setValue(data.Numero);

      this.consultaNotaIngresoProductoAlmacenFormEdit.controls["NumeroNotaIngresoPlanta"].setValue(data.NumeroNotaIngresoPlanta);
      this.consultaNotaIngresoProductoAlmacenFormEdit.controls["NotaIngresoProductoTerminadoAlmacenPlantaId"].setValue(data.NotaIngresoProductoTerminadoAlmacenPlantaId);
      this.consultaNotaIngresoProductoAlmacenFormEdit.controls["NumeroGuiaRemision"].setValue(data.NumeroGuiaRemision);
      this.consultaNotaIngresoProductoAlmacenFormEdit.controls["cantidad"].setValue(data.Cantidad);
      this.consultaNotaIngresoProductoAlmacenFormEdit.controls["kgn"].setValue(data.KGN);

      this.consultaNotaIngresoProductoAlmacenFormEdit.controls["KilosNetos"].setValue(data.KilosNetos);
      this.consultaNotaIngresoProductoAlmacenFormEdit.controls["KilosNetos46"].setValue(data.KilosNetos46);
      this.consultaNotaIngresoProductoAlmacenFormEdit.controls["producto"].setValue(data.Producto);
     // this.consultaNotaIngresoProductoAlmacenFormEdit.controls["ProductoId"].setValue(data.ProductoId);
      this.consultaNotaIngresoProductoAlmacenFormEdit.controls["subproducto"].setValue(data.SubProducto);
     

   
      this.consultaNotaIngresoProductoAlmacenFormEdit.controls["motivo"].setValue(data.MotivoIngreso);
     // this.consultaNotaIngresoProductoAlmacenFormEdit.controls["MotivoIngresoId"].setValue(data.MotivoIngresoId);

     this.consultaNotaIngresoProductoAlmacenFormEdit.controls["Almacen"].setValue(data.AlmacenId);
      this.consultaNotaIngresoProductoAlmacenFormEdit.controls["estado"].setValue(data.Estado);
     // this.consultaNotaIngresoProductoAlmacenFormEdit.controls["EstadoId"].setValue(data.EstadoId);
      this.consultaNotaIngresoProductoAlmacenFormEdit.controls["Observacion"].setValue(data.Observacion)
      this.consultaNotaIngresoProductoAlmacenFormEdit.controls["FechaRegistro"].setValue(data.FechaRegistro);
     this.consultaNotaIngresoProductoAlmacenFormEdit.controls["UsuarioRegistro"].setValue(data.UsuarioRegistro);
     this.consultaNotaIngresoProductoAlmacenFormEdit.controls["CantidadDisponible"].setValue(data.CantidadDisponible);
     this.consultaNotaIngresoProductoAlmacenFormEdit.controls["KilosNetosDisponibles"].setValue(data.KilosNetosDisponibles);
      this.consultaNotaIngresoProductoAlmacenFormEdit.controls["NumeroNotaIngresoProductoTerminadoAlmacenPlanta"].setValue(data.NumeroNotaIngresoProductoTerminadoAlmacenPlantaId);
      this.consultaNotaIngresoProductoAlmacenFormEdit.controls["NotaIngresoPlanta"].setValue(data.NotaIngresoPlantaId);
      this.consultaNotaIngresoProductoAlmacenFormEdit.controls["CantidadSalidaAlmacen"].setValue(data.CantidadSalidaAlmacen);
      this.consultaNotaIngresoProductoAlmacenFormEdit.controls["KilosNetosSalidaAlmacen"].setValue(data.KilosNetosSalidaAlmacen);
      this.consultaNotaIngresoProductoAlmacenFormEdit.controls["LiquidacionProcesoPlanta"].setValue(data.LiquidacionProcesoPlantaId);
      this.consultaNotaIngresoProductoAlmacenFormEdit.controls["EmpresaOrigen"].setValue(data.EmpresaOrigenId);




    this.spinner.hide();
    this.modalService.dismissAll();
  }

  guardar() {

    const form = this;
    if (!this.consultaNotaIngresoProductoAlmacenFormEdit.invalid) {
     // this.submittedEdit = true;
   
    
      this.spinner.show(undefined,
        {
          type: 'ball-triangle-path',
          size: 'medium',
          bdColor: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          fullScreen: true
        });
      if (this.consultaNotaIngresoProductoAlmacenFormEdit && this.id != 0) {
        this.alertUtil.alertRegistro('Confirmación', `¿Está seguro de continuar con la actualización?.` , function (result) {
          if (result.isConfirmed) {
            form.actualizarProductoTerminado();
          }
        });
       
      } /*else {

        this.alertUtil.alertRegistro('Confirmación', `¿Está seguro de continuar con el registro?.` , function (result) {
          if (result.isConfirmed) {
            form.guardarService(request);
          }
        });
       
      }*/
    }
  }
  actualizarProductoTerminado() {


    this.NotaIngresoProductoTerminadoAlmacenPlantaService.actualizar(this.id,this.usuario,this.consultaNotaIngresoProductoAlmacenFormEdit.controls['Almacen'].value)
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            var form = this;
            this.alertUtil.alertOkCallback('Actualizado!', 'Nota Ingreso Producto Actualizado.', function (result) {
              form.router.navigate(['/planta/operaciones/notaingresoproducto-list']);
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

  cancelar() {
    this.router.navigate(['/planta/operaciones/notaingresoproducto-list']);
  }
}