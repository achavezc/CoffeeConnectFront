import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import swal from 'sweetalert2';
import { ILogin } from '../../../../../../services/models/login';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn, FormBuilder } from '@angular/forms';
import { MaestroService } from '../../../../../../services/maestro.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Router } from "@angular/router";
import { ReqOrdenServicio } from './../../../../../../services/models/req-ordenservicio-registrar';
import { OrdenservicioControlcalidadService } from './../../../../../../services/ordenservicio-controlcalidad.service';
import { AlertUtil } from '../../../../../../services/util/alert-util';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-orden-servicio-edit',
  templateUrl: './ordenservicio-edit.component.html',
  styleUrls: ['./ordenservicio-edit.component.scss', "/assets/sass/libs/datatables.scss"]
})
export class OrdenServicioEditComponent implements OnInit {

  @ViewChild('vform') validationForm: FormGroup;
  @ViewChild(DatatableComponent) table: DatatableComponent;
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
  selectEmpresa: any[];
  responseble = '';
  id: Number = 0;
  mensajeErrorGenerico = "Ocurrio un error interno.";
  estado: any;

  constructor(private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private maestroService: MaestroService,
    private modalService: NgbModal,
    private router: Router,
    private ordenservicioControlcalidadService: OrdenservicioControlcalidadService,
    private alertUtil: AlertUtil,
    private route: ActivatedRoute) {
  }

  receiveMessage($event) {
    this.selectEmpresa = $event
    this.ordenServicioFormEdit.get('destinatario').setValue(this.selectEmpresa[0].RazonSocial);
    this.ordenServicioFormEdit.get('ruc').setValue(this.selectEmpresa[0].Ruc);
    this.ordenServicioFormEdit.get('dirDestino').setValue(this.selectEmpresa[0].Direccion + " - " + this.selectEmpresa[0].Distrito + " - " + this.selectEmpresa[0].Provincia + " - " + this.selectEmpresa[0].Departamento);
    this.modalService.dismissAll();
  }

  receiveSubProducto($event) {
    this.viewTagSeco = $event;
  }

  ngOnInit(): void {
    this.login = JSON.parse(localStorage.getItem("user"));
    this.cargarForm();
    this.route.queryParams
      .subscribe(params => {
        if (Number(params.id)) {
          this.id = Number(params.id);
          this.esEdit = true;
        }
        else {
          this.disabledControl = 'disabled';
        }
      })
  }

  openModal(modalEmpresa) {
    this.modalService.open(modalEmpresa, { windowClass: 'dark-modal', size: 'xl' });

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
        this.actualizarNotaSalidaService(request);
      } else {
        this.registrarNotaSalidaService(request);
      }
    }

  }


  registrarNotaSalidaService(request: ReqOrdenServicio) {
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
  actualizarNotaSalidaService(request: ReqOrdenServicio) {
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