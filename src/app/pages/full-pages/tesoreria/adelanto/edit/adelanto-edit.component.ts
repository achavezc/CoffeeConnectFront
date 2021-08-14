import { Component, OnInit, ViewEncapsulation, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent, ColumnMode } from "@swimlane/ngx-datatable";
import { MaestroService } from '../../../../../services/maestro.service';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn, FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";
import { host } from '../../../../../shared/hosts/main.host';
import { ILogin } from '../../../../../services/models/login';
import { MaestroUtil } from '../../../../../services/util/maestro-util';
import { AlertUtil } from '../../../../../services/util/alert-util';
import { AdelantoService } from '../../../../../services/adelanto.service';
import { Router } from "@angular/router"
import { ActivatedRoute } from '@angular/router';
import { formatDate } from '@angular/common';
import { Subject } from 'rxjs';


@Component({
  selector: 'app-adelanto-edit',
  templateUrl: './adelanto-edit.component.html',
  styleUrls: ['./adelanto-edit.component.scss', "/assets/sass/libs/datatables.scss"],
  encapsulation: ViewEncapsulation.None
})
export class AdelantoEditComponent implements OnInit {

  @ViewChild('vform') validationForm: FormGroup;
  adelantoFormEdit: FormGroup;

  errorGeneral: any = { isError: false, errorMessage: '' };
  mensajeErrorGenerico = "Ocurrio un error interno.";

  id: Number = 0;
  idSocio: Number = 0;
  estadoId: Number = 0;
  notaCompraId: Number = 0;
  AduanaId: Number = 0;
  status: string = "";
  estado = "";
  numeroGuia: "";
  fechaRegistro: any;
  fechaPesado: any;
  responsable: "";
  login: ILogin;
  submittedEdit = false;
  numeroRecibo = "";
  esEdit = false;
  listTipoDocumento: [];
  listMoneda: [];
  selectedTipoDocumento: any;
  selectedMoneda: any;
  constructor(private modalService: NgbModal, private maestroService: MaestroService,
    private alertUtil: AlertUtil,
    private router: Router,
    private spinner: NgxSpinnerService,
    private maestroUtil: MaestroUtil,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private adelantoService: AdelantoService
  ) {

  }


  ngOnInit(): void {
    this.cargarForm();
    this.LoadCombos();
    this.login = JSON.parse(localStorage.getItem("user"));
    this.route.queryParams
      .subscribe(params => {
        if (Number(params.id)) {
          this.id = Number(params.id);
          this.esEdit = true;
          this.obtenerDetalle();
        }
      }
      );
  }

  cargarForm() {
    this.adelantoFormEdit = this.fb.group(
      {
        codigo: ['',],
        tipoDocumento: ['', Validators.required],
        nombre: ['', Validators.required],
        numeroDocumento: ['', Validators.required],
        moneda: ['', Validators.required],
        monto: ['', Validators.required],
        fechaPago: ['', Validators.required],
        fechaEntregaProducto: ['', Validators.required],
        motivo: ['',]


      });
  }
  LoadCombos() {
    this.GetTipoDocumento();
    this.GetMoneda();
  }

  async GetMoneda() {
    const res = await this.maestroService.obtenerMaestros('Moneda').toPromise();
    if (res.Result.Success) {
      this.listMoneda = res.Result.Data;

    }
  }
  async GetTipoDocumento() {
    const res = await this.maestroService.obtenerMaestros('TipoDocumento').toPromise();
    if (res.Result.Success) {
      this.listTipoDocumento = res.Result.Data;

    }
  }
  openModal(modalEmpresa) {
    this.modalService.open(modalEmpresa, { size: 'xl', centered: true });
  }


  clear() {
  }
  cargarcombos() {

  }

  get fedit() {
    return this.adelantoFormEdit.controls;
  }


  cancelar() {
    this.router.navigate(['/operaciones/guiarecepcionmateriaprima-list']);
  }

  obtenerDetalle() {
    this.spinner.show();
    this.adelantoService.ConsultarPorId({ "AdelantoId": this.id })
      .subscribe(res => {
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
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
  cargarDataFormulario(data: any) {
    this.AduanaId = data.AdelantoId;
    this.numeroRecibo = data.Numero;
    this.estado = data.Estado;
    this.adelantoFormEdit.controls["codigo"].setValue(data.CodigoSocio);
    this.adelantoFormEdit.controls["tipoDocumento"].setValue(data.TipoDocumentoId);
    this.adelantoFormEdit.controls["nombre"].setValue(data.RazonSocial);
    this.adelantoFormEdit.controls["numeroDocumento"].setValue(data.NumeroDocumento);
    this.adelantoFormEdit.controls["moneda"].setValue(data.MonedaId);
    this.adelantoFormEdit.controls["monto"].setValue(data.Monto);
    this.adelantoFormEdit.controls["fechaPago"].setValue(data.FechaPago.substring(0, 10));
    this.adelantoFormEdit.controls["fechaEntregaProducto"].setValue(data.FechaEntregaProducto.substring(0, 10));
    this.adelantoFormEdit.controls["motivo"].setValue(data.Motivo);
    this.spinner.hide();
  }


  Save(): void {
    const form = this;
    if (this.adelantoFormEdit.invalid) {
      this.submittedEdit = true;
      this.errorGeneral = { isError: true, errorMessage: 'Por favor completar los campos OBLIGATORIOS.' };
      return;
    }
    else {
      if (this.id <= 0) {
        form.CreatePrecioDia();
      }
      else {

        form.ActualizarPrecioDia();
      }

    }
  }


  ActualizarPrecioDia(): void {

    var request = this.getRequest();
    this.adelantoService.Actualizar(request)
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
    this.adelantoService.Registrar(request)
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
      AdelantoId: this.id,
      SocioId: this.idSocio,
      EmpresaId: this.login.Result.Data.EmpresaId,
      Numero: this.adelantoFormEdit.controls["codigo"].value ? this.adelantoFormEdit.controls["codigo"].value : '',
      TipoDocumentoId: this.adelantoFormEdit.controls["tipoDocumento"].value ? this.adelantoFormEdit.controls["tipoDocumento"].value : '',
      NumeroDocumento: this.adelantoFormEdit.controls["numeroDocumento"].value ? this.adelantoFormEdit.controls["numeroDocumento"].value : '',
      NombreRazonSocial: this.adelantoFormEdit.controls["nombre"].value ? this.adelantoFormEdit.controls["nombre"].value : '',
      MonedaId: this.adelantoFormEdit.controls["moneda"].value ? this.adelantoFormEdit.controls["moneda"].value : '',
      Monto: Number(this.adelantoFormEdit.value.monto),
      FechaPago: this.adelantoFormEdit.controls["fechaPago"].value ? this.adelantoFormEdit.controls["fechaPago"].value : '',
      Motivo: this.adelantoFormEdit.controls["motivo"].value ? this.adelantoFormEdit.controls["motivo"].value : '',
      FechaEntregaProducto: this.adelantoFormEdit.controls["fechaEntregaProducto"].value ? this.adelantoFormEdit.controls["fechaEntregaProducto"].value : '',
      NotaCompraId: this.notaCompraId,
      EstadoId: this.estadoId,
      FechaRegistro: this.adelantoFormEdit.controls["fechaPago"].value ? this.adelantoFormEdit.controls["fechaPago"].value : '',
      FechaUltimaActualizacion: this.adelantoFormEdit.controls["fechaPago"].value ? this.adelantoFormEdit.controls["fechaPago"].value : '',
      UsuarioUltimaActualizacion: this.login.Result.Data.NombreUsuario,
      UsuarioRegistro: this.login.Result.Data.NombreUsuario,

    };

  }

  Cancel(): void {
    this.router.navigate(['/tesoreria/adelanto/list']);
  }

  Print() {
    let link = document.createElement('a');
    document.body.appendChild(link);
    link.href = `${host}Adelanto/GenerarPDFAdelanto?id=${this.id}`;
    link.download = "Adelanto.pdf"
    link.target = "_blank";
    link.click();
    link.remove();
  }

}

