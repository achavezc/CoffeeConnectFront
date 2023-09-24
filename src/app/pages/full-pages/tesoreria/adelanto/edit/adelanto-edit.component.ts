import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MaestroService } from '../../../../../services/maestro.service';
import { FormControl, FormGroup, Validators,  FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";
import { host } from '../../../../../shared/hosts/main.host';
import { AlertUtil } from '../../../../../services/util/alert-util';
import { AdelantoService } from '../../../../../services/adelanto.service';
import { Router } from "@angular/router"
import { ActivatedRoute } from '@angular/router';
import { DateUtil } from '../../../../../services/util/date-util';
import {AuthService} from './../../../../../services/auth.service';

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
  notaCompraId: Number;
  AduanaId: Number = 0;
  status: string = "";
  estado = "";
  numeroGuia: "";
  fechaRegistro: any;
  fechaPesado: any;
  responsable: "";
  login: any;
  submittedEdit = false;
  numeroRecibo = "";
  esEdit = false;
  listTipoDocumento: [];
  listMoneda: [];
  selectedTipoDocumento: any;
  selectedMoneda: any;
  popUpSocio = true;
  error: any = { isError: false, errorMessage: '' };
  errorFecha: any = { isError: false, errorMessage: '' };
  readonly: boolean;
  constructor(private modalService: NgbModal, private maestroService: MaestroService,
    private alertUtil: AlertUtil,
    private router: Router,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private adelantoService: AdelantoService,
    private dateUtil: DateUtil,
    private authService : AuthService
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
      ////this.readonly= this.authService.esReadOnly(this.login.Result.Data.OpcionesEscritura, this.adelantoFormEdit);
  }

  cargarForm() {
    this.adelantoFormEdit = this.fb.group(
      {
        codigo: ['', ],
        tipoDocumento: new FormControl('', [ Validators.required]),
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

  compareTwoDates() {
    var anioFechaInicio = new Date(this.adelantoFormEdit.controls['fechaPago'].value).getFullYear()
    var anioFechaFin = new Date(this.adelantoFormEdit.controls['fechaEntregaProducto'].value).getFullYear()

    if (new Date(this.adelantoFormEdit.controls['fechaEntregaProducto'].value) < new Date(this.adelantoFormEdit.controls['fechaPago'].value)) {
      this.error = { isError: true, errorMessage: 'La fecha de Entrega de Producto no puede ser anterior a la fecha de Pago.' };
      this.adelantoFormEdit.controls['fechaEntregaProducto'].setErrors({ isError: true })
    } else if (this.dateUtil.restarAnio(anioFechaInicio, anioFechaFin) > 2) {
      this.error = { isError: true, errorMessage: 'El Rango de fechas no puede ser mayor a 2 años' };
      this.adelantoFormEdit.controls['fechaEntregaProducto'].setErrors({ isError: true })
    } else {
      this.error = { isError: false, errorMessage: '' };
    }
  }

  compareFechas() {
    var anioFechaInicio = new Date(this.adelantoFormEdit.controls['fechaPago'].value).getFullYear()
    var anioFechaFin = new Date(this.adelantoFormEdit.controls['fechaEntregaProducto'].value).getFullYear()
    if (new Date(this.adelantoFormEdit.controls['fechaPago'].value) > new Date(this.adelantoFormEdit.controls['fechaEntregaProducto'].value)) {
      this.errorFecha = { isError: true, errorMessage: 'La fecha de Pago no puede ser mayor a la fecha de Entrega de Producto.' };
      this.adelantoFormEdit.controls['fechaPago'].setErrors({ isError: true })
    } else if (this.dateUtil.restarAnio(anioFechaInicio, anioFechaFin) > 2) {
      this.errorFecha = { isError: true, errorMessage: 'El Rango de fechas no puede ser mayor a 2 años' };
      this.adelantoFormEdit.controls['fechaPago'].setErrors({ isError: true })
    } else {
      this.errorFecha = { isError: false, errorMessage: '' };
    }
  }
  agregarSocio(e) {

    this.idSocio = e[0].SocioId;
    this.adelantoFormEdit.controls["codigo"].setValue(e[0].Codigo);
    this.adelantoFormEdit.controls["tipoDocumento"].setValue(e[0].TipoDocumentoId);
    this.adelantoFormEdit.controls["nombre"].setValue(e[0].NombreRazonSocial);
    this.adelantoFormEdit.controls["numeroDocumento"].setValue(e[0].NumeroDocumento);
    this.adelantoFormEdit.controls["tipoDocumento"].disable();
    this.adelantoFormEdit.controls["nombre"].disable();
    this.adelantoFormEdit.controls["numeroDocumento"].disable();
    this.modalService.dismissAll();
  }

  async GetMoneda() {
    const res = await this.maestroService.obtenerMaestros('Moneda').toPromise();
    if (res.Result.Success) {
      this.listMoneda = res.Result.Data;
      this.selectedMoneda = this.login.Result.Data.MonedaId;

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
    this.idSocio = data.SocioId;
    this.adelantoFormEdit.controls["codigo"].setValue(data.CodigoSocio);
    this.adelantoFormEdit.controls["tipoDocumento"].setValue(data.TipoDocumentoId);
    this.adelantoFormEdit.controls["nombre"].setValue(data.NombreRazonSocial);
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

        this.alertUtil.alertRegistro('Confirmación', `¿Está seguro de continuar con el registro?.` , function (result) {
          if (result.isConfirmed) {
            form.Create();
          }
        });

        
      }
      else {

        this.alertUtil.alertRegistro('Confirmación', `¿Está seguro de continuar con la actualización?.` , function (result) {
          if (result.isConfirmed) {
            form.Actualizar();
          }
        });

        
      }

    }
  }


  Actualizar(): void {

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

  Create(): void {

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

