import { Component, OnInit, ViewEncapsulation,Output ,ViewChild,EventEmitter  } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MaestroService } from '../../../../../services/maestro.service';
import { FormControl, FormGroup, Validators,  FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";
import { host } from '../../../../../shared/hosts/main.host';
import { AlertUtil } from '../../../../../services/util/alert-util';
import { Router } from "@angular/router"
import { ActivatedRoute } from '@angular/router';
import { DateUtil } from '../../../../../services/util/date-util';
import {AuthService} from '../../../../../services/auth.service';
import { AnticipoService } from '../../../../../services/anticipio.service';

@Component({
  selector: 'app-anticipos-edit',
  templateUrl: './anticipos-edit.component.html',
  styleUrls: ['./anticipos-edit.component.scss', "/assets/sass/libs/datatables.scss"],
  encapsulation: ViewEncapsulation.None
})
export class AnticiposEditComponent implements OnInit {

  @ViewChild('vform') validationForm: FormGroup;
  @Output() empresaEvent = new EventEmitter<any[]>();
 @Output() agregarEvent = new EventEmitter<any>();
  anticipoFormEdit: FormGroup;

  errorGeneral: any = { isError: false, errorMessage: '' };
  mensajeErrorGenerico = "Ocurrio un error interno.";

  id: Number = 0;
  estadoId: Number = 0;
  notaIngresoPlantaId: Number;
  status: string = "";
  estado = "";
  fechaRegistro: any;
  responsable: "";
  login: any;
  submittedEdit = false;
  numeroRecibo = "";
  esEdit = false;
  listTipoDocumento: [];
  listMoneda: [];
  selectedTipoDocumento: any;
  selectedMoneda: any;
  selectedEmpresa = [];
  selectOrganizacion = [];
  empresa: any[];
  selected = [];
  popUpEmpresaProveedora = true;
  popUpEmpresa = true;
  empresaProveedoraId: Number = 0;
  error: any = { isError: false, errorMessage: '' };
  errorFecha: any = { isError: false, errorMessage: '' };
  readonly: boolean;
  constructor(private modalService: NgbModal, private maestroService: MaestroService,
    private alertUtil: AlertUtil,
    private router: Router,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private anticipoService: AnticipoService,
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
      this.readonly= this.authService.esReadOnly(this.login.Result.Data.OpcionesEscritura, this.anticipoFormEdit);
  }

  cargarForm() {
    this.anticipoFormEdit = this.fb.group(
      {
        ruc: new FormControl('', []),
        destinatario: ['', [Validators.required]],
        dirDestino: new FormControl('', []),
       // nombreOrganizacion: [],
       // rucOrganizacion: ['',],
       // organizacionId: [],
        razonSocial: ['', Validators.required],
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
    var anioFechaInicio = new Date(this.anticipoFormEdit.controls['fechaPago'].value).getFullYear()
    var anioFechaFin = new Date(this.anticipoFormEdit.controls['fechaEntregaProducto'].value).getFullYear()

    if (new Date(this.anticipoFormEdit.controls['fechaEntregaProducto'].value) < new Date(this.anticipoFormEdit.controls['fechaPago'].value)) {
      this.error = { isError: true, errorMessage: 'La fecha de Entrega de Producto no puede ser anterior a la fecha de Pago.' };
      this.anticipoFormEdit.controls['fechaEntregaProducto'].setErrors({ isError: true })
    } else if (this.dateUtil.restarAnio(anioFechaInicio, anioFechaFin) > 2) {
      this.error = { isError: true, errorMessage: 'El Rango de fechas no puede ser mayor a 2 años' };
      this.anticipoFormEdit.controls['fechaEntregaProducto'].setErrors({ isError: true })
    } else {
      this.error = { isError: false, errorMessage: '' };
    }
  }

  compareFechas() {
    var anioFechaInicio = new Date(this.anticipoFormEdit.controls['fechaPago'].value).getFullYear()
    var anioFechaFin = new Date(this.anticipoFormEdit.controls['fechaEntregaProducto'].value).getFullYear()
    if (new Date(this.anticipoFormEdit.controls['fechaPago'].value) > new Date(this.anticipoFormEdit.controls['fechaEntregaProducto'].value)) {
      this.errorFecha = { isError: true, errorMessage: 'La fecha de Pago no puede ser mayor a la fecha de Entrega de Producto.' };
      this.anticipoFormEdit.controls['fechaPago'].setErrors({ isError: true })
    } else if (this.dateUtil.restarAnio(anioFechaInicio, anioFechaFin) > 2) {
      this.errorFecha = { isError: true, errorMessage: 'El Rango de fechas no puede ser mayor a 2 años' };
      this.anticipoFormEdit.controls['fechaPago'].setErrors({ isError: true })
    } else {
      this.errorFecha = { isError: false, errorMessage: '' };
    }
  }
  /*agregarEmpresaProveedora(e) {

    this.empresaProveedoraId = e[0].EmpresaProveedoraAcreedoraId;
    this.anticipoFormEdit.controls["ruc"].setValue(e[0].Ruc);
    this.anticipoFormEdit.controls["razonSocial"].setValue(e[0].RazonSocial);
    this.anticipoFormEdit.controls["ruc"].disable();
    this.modalService.dismissAll();
  }*/

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
    this.modalService.open(modalEmpresa, { windowClass: 'dark-modal', size: 'xl' });
  }

  
  GetEmpresa($event) {
    this.selectedEmpresa = $event
    this.anticipoFormEdit.get('destinatario').setValue(this.selectedEmpresa[0].RazonSocial);
    this.anticipoFormEdit.get('ruc').setValue(this.selectedEmpresa[0].Ruc);
    this.anticipoFormEdit.get('dirDestino').setValue(this.selectedEmpresa[0].Direccion + " - " + this.selectedEmpresa[0].Distrito + " - " + this.selectedEmpresa[0].Provincia + " - " + this.selectedEmpresa[0].Departamento);
    this.modalService.dismissAll();
  }

  /*GetDataEmpresa(event: any): void {
    this.selectOrganizacion = event;
    if (this.selectOrganizacion[0]) {
      this.anticipoFormEdit.controls['nombreOrganizacion'].setValue(this.selectOrganizacion[0].RazonSocial);
      this.anticipoFormEdit.controls['rucOrganizacion'].setValue(this.selectOrganizacion[0].Ruc);
      this.anticipoFormEdit.controls['organizacionId'].setValue(this.selectOrganizacion[0].EmpresaProveedoraAcreedoraId);
    }
    this.modalService.dismissAll();
  }*/




  clear() {
  }
  cargarcombos() {

  }

  get fedit() {
    return this.anticipoFormEdit.controls;
  }


  cancelar() {
    this.router.navigate(['/operaciones/guiarecepcionmateriaprima-list']);
  }

  obtenerDetalle() {
    this.spinner.show();
    this.anticipoService.ConsultarPorId({ "AnticipoId": this.id })
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
    this.id = data.AnticipoId;
    this.numeroRecibo = data.Numero;
    this.estado = data.Estado;
    this.empresaProveedoraId = data.ProveedorId;
  //  this.anticipoFormEdit.controls["ruc"].setValue(data.RucProveedor);
    this.anticipoFormEdit.controls["ruc"].setValue(data.RucEmpresa);
    this.anticipoFormEdit.controls["destinatario"].setValue(data.Destinatario);
    this.anticipoFormEdit.controls["dirDestino"].setValue(data.DireccionDestino);
     //this.anticipoFormEdit.controls['organizacionId'].setValue(data.EmpresaClienteId);
     //this.anticipoFormEdit.controls.nombreOrganizacion.setValue(data.RazonSocialEmpresaCliente);
    //this.anticipoFormEdit.controls.rucOrganizacion.setValue(data.RucEmpresaCliente);
    //this.anticipoFormEdit.controls["razonSocial"].setValue(data.RazonSocialProveedor);
    this.anticipoFormEdit.controls["moneda"].setValue(data.MonedaId);
    let objectDestino: any = {};
    objectDestino.EmpresaProveedoraAcreedoraId = data.EmpresaIdDestino;
    this.selectedEmpresa.push(objectDestino);
    this.anticipoFormEdit.controls["monto"].setValue(data.Monto);
    this.anticipoFormEdit.controls["fechaPago"].setValue(data.FechaPago.substring(0, 10));
    this.anticipoFormEdit.controls["fechaEntregaProducto"].setValue(data.FechaEntregaProducto.substring(0, 10));
    this.anticipoFormEdit.controls["motivo"].setValue(data.Motivo);
    this.spinner.hide();
  }


  Save(): void {
    const form = this;
    if (this.anticipoFormEdit.invalid) {
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
    this.anticipoService.Actualizar(request)
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
    this.anticipoService.Registrar(request)
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
      AnticipoId: this.id,
      ProveedorId: this.empresaProveedoraId,
      EmpresaId: this.login.Result.Data.EmpresaId,    
      MonedaId: this.anticipoFormEdit.controls["moneda"].value ? this.anticipoFormEdit.controls["moneda"].value : '',
      Monto: Number(this.anticipoFormEdit.value.monto),
      FechaPago: this.anticipoFormEdit.controls["fechaPago"].value ? this.anticipoFormEdit.controls["fechaPago"].value : '',
      Motivo: this.anticipoFormEdit.controls["motivo"].value ? this.anticipoFormEdit.controls["motivo"].value : '',
      FechaEntregaProducto: this.anticipoFormEdit.controls["fechaEntregaProducto"].value ? this.anticipoFormEdit.controls["fechaEntregaProducto"].value : '',
      EstadoId: this.estadoId,
      UsuarioRegistro: this.login.Result.Data.NombreUsuario
    };

  }

  Cancel(): void {
    this.router.navigate(['/tesoreria/anticipo/list']);
  }

  Print() {
    let link = document.createElement('a');
    document.body.appendChild(link);
    link.href = `${host}Anticipo/GenerarPDFAnticipo?id=${this.id}`;
    link.download = "Anticipo.pdf"
    link.target = "_blank";
    link.click();
    link.remove();
  }

  seleccionarEmpresa(e) {
    this.empresa = e;
    this.empresaEvent.emit(this.empresa)
  }

 

}

