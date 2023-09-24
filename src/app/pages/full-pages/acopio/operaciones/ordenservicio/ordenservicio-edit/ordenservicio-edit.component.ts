import { Component, OnInit, ViewChild } from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { ILogin } from '../../../../../../services/models/login';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { MaestroService } from '../../../../../../services/maestro.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from "@angular/router";
import { ReqOrdenServicio } from './../../../../../../services/models/req-ordenservicio-registrar';
import { OrdenservicioControlcalidadService } from './../../../../../../services/ordenservicio-controlcalidad.service';
import { AlertUtil } from '../../../../../../services/util/alert-util';
import { ActivatedRoute } from '@angular/router';
import { DateUtil } from '../../../../../../services/util/date-util';
import { TagOrdenServicioComponent } from '../ordenservicio-edit/tag-ordenservicio/tag-ordenservicio.component';
import {AuthService} from './../../../../../../services/auth.service';


@Component({
  selector: 'app-orden-servicio-edit',
  templateUrl: './ordenservicio-edit.component.html',
  styleUrls: ['./ordenservicio-edit.component.scss', "/assets/sass/libs/datatables.scss"]
})
export class OrdenServicioEditComponent implements OnInit {

  @ViewChild('vform') validationForm: FormGroup;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild(TagOrdenServicioComponent) child;
  login: ILogin;
  ordenServicioFormEdit: FormGroup;
  viewTagSeco: boolean = null;
  listaEstado: any[];
  selectEstado: any;
  submittedEdit = false;
  submitted = false;
  detalle: any;
  disabledControl: string = '';
  form: string = "ordenServicio";
  numero: any = "";
  fechaRegistro: any;
  listTipoSocio: any[];
  selectTipoSocio: any;
  esEdit: true;
  listaTipoProveedor: any[];
  listaTipoDocumento: any[];
  selectedTipoDocumento: any;
  selectTipoProveedor: any;
  rows: any[];
  errorGeneral: any = { isError: false, errorMessage: '' };
  selectEmpresa: any[] = [];
  responsable: "";
  id: Number = 0;
  mensajeErrorGenerico = "Ocurrio un error interno.";
  estado: any;
  readonly: boolean;
  vSessionUser: any;

  constructor(private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private maestroService: MaestroService,
    private modalService: NgbModal,
    private router: Router,
    private ordenservicioControlcalidadService: OrdenservicioControlcalidadService,
    private alertUtil: AlertUtil,
    private route: ActivatedRoute,
    private dateUtil: DateUtil,
    private authService : AuthService) {
  }

  receiveMessage($event) {
    this.selectEmpresa = $event
    this.ordenServicioFormEdit.get('destinatario').setValue(this.selectEmpresa[0].RazonSocial);
    this.ordenServicioFormEdit.get('ruc').setValue(this.selectEmpresa[0].Ruc);
    this.ordenServicioFormEdit.get('dirDestino').setValue(this.selectEmpresa[0].Direccion + " - " + this.selectEmpresa[0].Distrito + " - " + this.selectEmpresa[0].Provincia + " - " + this.selectEmpresa[0].Departamento);
    this.vSessionUser = JSON.parse(localStorage.getItem('user'));
    ////this.readonly= this.authService.esReadOnly(this.vSessionUser.Result.Data.OpcionesEscritura);
    this.modalService.dismissAll();
  }

  receiveSubProducto($event) {
    this.viewTagSeco = $event;
  }

  ngOnInit(): void {
    this.login = JSON.parse(localStorage.getItem("user"));
    this.cargarForm();
    //this.readonly = true;
    this.route.queryParams
      .subscribe(params => {
        if (Number(params.id)) {
          this.id = Number(params.id);
          this.esEdit = true;
          this.obtenerDetalle();
        }
        else {
          this.disabledControl = 'disabled';
        }
      });
  }

  openModal(modalEmpresa) {
    this.modalService.open(modalEmpresa, { windowClass: 'dark-modal', size: 'xl' });

  }
  obtenerDetalle() {
    this.spinner.show();
    this.ordenservicioControlcalidadService.ConsultarPorId(Number(this.id))
      .subscribe(res => {
        this.spinner.hide();
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
    this.selectEmpresa[0] = { EmpresaProveedoraAcreedoraId: data.EmpresaProcesadoraId };
    this.numero = data.Numero;
    this.estado = data.Estado;
    this.responsable = data.UsuarioRegistro;
    this.fechaRegistro = this.dateUtil.formatDate(new Date(data.FechaRegistro), "/");
    this.ordenServicioFormEdit.get('destinatario').setValue(data.RazonSocialEmpresaProcesadora);
    this.ordenServicioFormEdit.get('ruc').setValue(data.RucEmpresaProcesadora);
    this.ordenServicioFormEdit.get('dirDestino').setValue(data.DireccionEmpresaProcesadora);
    this.viewTagSeco = data.SubProductoId != "02" ? false : true;
    this.ordenServicioFormEdit.get('tagordenservicio').get('producto').setValue(data.ProductoId);
    await this.child.cargarSubProducto(data.ProductoId);
    this.ordenServicioFormEdit.get('tagordenservicio').get('subproducto').setValue(data.SubProductoId);
    this.ordenServicioFormEdit.get('tagordenservicio').get('tipoProduccion').setValue(data.TipoProduccionId);
    this.ordenServicioFormEdit.get('tagordenservicio').get('rendimiento').setValue(data.RendimientoEsperadoPorcentaje);
    this.ordenServicioFormEdit.get('tagordenservicio').get('unidadmedida').setValue(data.UnidadMedidaId);
    this.ordenServicioFormEdit.get('tagordenservicio').get('cantidad').setValue(data.CantidadPesado);

  }

  cargarForm() {
    this.ordenServicioFormEdit = this.fb.group(
      {
        destinatario: ['', [Validators.required]],
        ruc: new FormControl('', []),
        dirPartida: [this.login.Result.Data.DireccionEmpresa, []],
        dirDestino: new FormControl('', []),
        tagordenservicio: this.fb.group({
          tipoProduccion: new FormControl('', [Validators.required]),
          producto: new FormControl('', [Validators.required]),
          subproducto: new FormControl('', [Validators.required]),
          rendimiento: new FormControl('', [Validators.required]),
          unidadmedida: new FormControl('', [Validators.required]),
          cantidad: new FormControl('', [Validators.required])
        }),
      });

    this.maestroService.obtenerMaestros("EstadoOrdenServicioControlCalidad")
      .subscribe(res => {
        if (res.Result.Success) {
          this.listaEstado = res.Result.Data;
        }
      },
        err => {
          console.error(err);
        }
      );
  }

  get fedit() {
    return this.ordenServicioFormEdit.controls;
  }

  guardar() {
    const form = this;
    if (this.ordenServicioFormEdit.invalid || this.errorGeneral.isError) {
      this.submittedEdit = true;
      return;
    }
    else {
      this.submittedEdit = false;
      let request = new ReqOrdenServicio(
        Number(this.id),
        Number(this.login.Result.Data.EmpresaId),
        this.selectEmpresa[0].EmpresaProveedoraAcreedoraId,
        this.numero,
        this.ordenServicioFormEdit.get('tagordenservicio').get("unidadmedida").value,
        Number(this.ordenServicioFormEdit.get('tagordenservicio').get("cantidad").value),
        this.ordenServicioFormEdit.get('tagordenservicio').get("producto").value,
        this.ordenServicioFormEdit.get('tagordenservicio').get("subproducto").value,
        this.ordenServicioFormEdit.get('tagordenservicio').get("tipoProduccion").value,
        Number(this.ordenServicioFormEdit.get('tagordenservicio').get("rendimiento").value),
        this.login.Result.Data.NombreUsuario
      );
      let json = JSON.stringify(request);
      this.spinner.show(undefined,
        {
          type: 'ball-triangle-path',
          size: 'medium',
          bdColor: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          fullScreen: true
        });
      if (this.esEdit && this.id != 0) {
        this.alertUtil.alertRegistro('Confirmación', '¿Está seguro de continuar con la actualización?.' , function (result) {
          if (result.isConfirmed) {
            form.actualizar(request);
          }
        });
        
      } else {

        this.alertUtil.alertRegistro('Confirmación', '¿Está seguro de continuar con el registro?.' , function (result) {
          if (result.isConfirmed) {
            form.registrar(request);
          }
        });
      }
    }

  }


  registrar(request: ReqOrdenServicio) {
    this.ordenservicioControlcalidadService.Registrar(request)
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            var form = this;
            this.alertUtil.alertOkCallback('Registrado!', 'Orden de Servicio', function (result) {
              if (result.isConfirmed) {
                form.router.navigate(['operaciones/orderservicio-controlcalidadexterna-list']);
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
  actualizar(request: ReqOrdenServicio) {
    this.ordenservicioControlcalidadService.Actualizar(request)
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            var form = this;
            this.alertUtil.alertOkCallback('Actualizado!', 'Orden de Servicio', function (result) {
              if (result.isConfirmed) {
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
  cancelar() {

    this.router.navigate(['/acopio/operaciones/orderservicio-controlcalidadexterna-list']);
  }
}