import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';

import { DateUtil } from '../../../../../../services/util/date-util';
import { AlertUtil } from '../../../../../../services/util/alert-util';
import { MaestroService } from '../../../../../../services/maestro.service';
import { OrdenProcesoService } from '../../../../../../services/orden-proceso.service';
import { EmpresaService } from '../../../../../../services/empresa.service';
import { ContratoService } from '../../../../../../services/contrato.service';

@Component({
  selector: 'app-orden-proceso-edit',
  templateUrl: './orden-proceso-edit.component.html',
  styleUrls: ['./orden-proceso-edit.component.scss']
})
export class OrdenProcesoEditComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private modalService: NgbModal,
    private dateUtil: DateUtil,
    private maestroService: MaestroService,
    private ordenProcesoService: OrdenProcesoService,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: NgxSpinnerService,
    private alertUtil: AlertUtil,
    private empresaService: EmpresaService,
    private contratoService: ContratoService) { }

  ordenProcesoEditForm: FormGroup;
  listTipoProceso = [];
  listTipoProduccion = [];
  listCertificacion = [];
  selectedTipoProceso: any;
  selectedTipoProduccion: any;
  selectedCertificacion: any;
  userSession: any;
  codeProcessOrder: Number;
  errorGeneral = { isError: false, msgError: '' };
  msgErrorGenerico = 'Ocurrio un error interno.';

  ngOnInit(): void {
    this.userSession = JSON.parse(localStorage.getItem('user'));
    this.codeProcessOrder = this.route.snapshot.params['id'] ? Number(this.route.snapshot.params['id']) : 0;
    this.LoadForm();
    this.ordenProcesoEditForm.controls.razonSocialCabe.setValue(this.userSession.Result.Data.RazonSocialEmpresa);
    this.ordenProcesoEditForm.controls.direccionCabe.setValue(this.userSession.Result.Data.DireccionEmpresa);
    this.ordenProcesoEditForm.controls.nroRucCabe.setValue(this.userSession.Result.Data.RucEmpresa);
    this.ordenProcesoEditForm.controls.responsableComercial.setValue(this.userSession.Result.Data.NombreCompletoUsuario);
    this.GetTipoProduccion();
    this.GetCertificacion();
    this.GetTipoProceso();
    if (this.codeProcessOrder <= 0) {
      this.ordenProcesoEditForm.controls.fechaCabe.setValue(this.dateUtil.currentDate());
      this.ordenProcesoEditForm.controls.fecFinProcesoPlanta.setValue(this.dateUtil.currentDate());
    } else if (this.codeProcessOrder > 0) {

    }
  }

  LoadForm(): void {
    this.ordenProcesoEditForm = this.fb.group({
      idOrdenProceso: [],
      razonSocialCabe: [, Validators.required],
      nroOrden: [],
      direccionCabe: [, Validators.required],
      fechaCabe: [, Validators.required],
      nroRucCabe: [, Validators.required],
      idContrato: [, Validators.required],
      nroContrato: [, Validators.required],
      idCliente: [, Validators.required],
      codCliente: [, Validators.required],
      cliente: [, Validators.required],
      idDestino: [, Validators.required],
      destino: [, Validators.required],
      fecFinProcesoPlanta: [],
      tipoProceso: [],
      tipoProduccion: [],
      certificacion: [],
      totalSacosUtilizar: [],
      porcenRendimiento: [],
      empaqueTipo: [],
      producto: [],
      cantidad: [],
      calidad: [],
      pesoSacoKG: [],
      grado: [],
      totalKilosBruto: [],
      cantidadDefectos: [],
      cantContenedores: [],
      responsableComercial: [],
      file: []
    });
  }

  get f() {
    return this.ordenProcesoEditForm.controls;
  }

  async GetTipoProduccion() {
    const res = await this.maestroService.obtenerMaestros('TipoProduccion').toPromise();
    if (res.Result.Success) {
      this.listTipoProduccion = res.Result.Data;
    }
  }

  async GetCertificacion() {
    const res = await this.maestroService.obtenerMaestros('TipoCertificacion').toPromise();
    if (res.Result.Success) {
      this.listCertificacion = res.Result.Data;
    }
  }

  async GetTipoProceso() {
    const res = await this.maestroService.obtenerMaestros('TipoProceso').toPromise();
    if (res.Result.Success) {
      this.listTipoProceso = res.Result.Data;
    }
  }

  GetDataModal(event: any): void {
    const obj = event[0];
    if (obj) {
      this.AutocompleteDataContrato(obj);
    }
    this.modalService.dismissAll();
  }

  async AutocompleteDataContrato(obj: any) {
    if (obj.ContratoId)
      this.ordenProcesoEditForm.controls.idContrato.setValue(obj.ContratoId);

    if (obj.Numero)
      this.ordenProcesoEditForm.controls.nroContrato.setValue(obj.Numero);

    if (obj.ClienteId)
      this.ordenProcesoEditForm.controls.idCliente.setValue(obj.ClienteId);

    if (obj.NumeroCliente)
      this.ordenProcesoEditForm.controls.codCliente.setValue(obj.NumeroCliente);

    if (obj.Cliente)
      this.ordenProcesoEditForm.controls.cliente.setValue(obj.Cliente);

    if (obj.TipoProduccionId) {
      await this.GetTipoProduccion();
      this.ordenProcesoEditForm.controls.tipoProduccion.setValue(obj.TipoProduccionId);
    }

    if (obj.TipoCertificacionId) {
      await this.GetCertificacion();
      this.ordenProcesoEditForm.controls.certificacion.setValue(obj.TipoCertificacionId);
    }

    if (obj.Empaque)
      this.ordenProcesoEditForm.controls.empaqueTipo.setValue(obj.Empaque);
    else if (obj.Tipo)
      this.ordenProcesoEditForm.controls.empaqueTipo.setValue(obj.Tipo);

    if (obj.Producto)
      this.ordenProcesoEditForm.controls.producto.setValue(obj.Producto);

    if (obj.Cantidad)
      this.ordenProcesoEditForm.controls.cantidad.setValue(obj.Cantidad);

    if (obj.Calidad)
      this.ordenProcesoEditForm.controls.calidad.setValue(obj.Calidad);

    if (obj.PesoPorSaco)
      this.ordenProcesoEditForm.controls.pesoSacoKG.setValue(obj.PesoPorSaco);

    if (obj.Grado)
      this.ordenProcesoEditForm.controls.grado.setValue(obj.Grado);
  }

  GetDataEmpresa(event: any): void {
    const obj = event[0];
    if (obj) {
      this.ordenProcesoEditForm.controls.idDestino.setValue(obj.EmpresaProveedoraAcreedoraId);
      this.ordenProcesoEditForm.controls.destino.setValue(`${obj.Direccion} - ${obj.Distrito} - ${obj.Provincia} - ${obj.Departamento}`);
    }
    this.modalService.dismissAll();
  }

  openModal(modalEmpresa: any): void {
    this.modalService.open(modalEmpresa, { windowClass: 'dark-modal', size: 'xl', centered: true });
  }

  GetRequest(): any {
    const form = this.ordenProcesoEditForm.value;
    const request = {
      OrdenProcesoId: form.idOrdenProceso ? form.idOrdenProceso : 0,
      EmpresaId: this.userSession.Result.Data.EmpresaId,
      EmpresaProcesadoraId: form.idDestino ? form.idDestino : 0,
      TipoProcesoId: form.tipoProceso ? form.tipoProceso : '',
      ContratoId: form.idContrato ? form.idContrato : 0,
      Numero: form.nroOrden ? form.nroOrden : '',
      CantidadSacosUtilizar: form.totalSacosUtilizar ? form.totalSacosUtilizar : 0,
      RendimientoEsperadoPorcentaje: form.porcenRendimiento ? form.porcenRendimiento : 0,
      FechaFinProceso: form.fecFinProcesoPlanta ? form.fecFinProcesoPlanta : '',
      CantidadContenedores: form.cantContenedores ? form.cantContenedores : 0,
      EstadoId: '01',
      UsuarioRegistro: this.userSession.Result.Data.NombreUsuario
    }
    return request;
  }

  Save(): void {
    if (!this.ordenProcesoEditForm.invalid) {
      const form = this;
      if (this.codeProcessOrder <= 0) {
        swal.fire({
          title: 'Confirmación',
          text: `¿Está seguro de continuar con el registro?.`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#2F8BE6',
          cancelButtonColor: '#F55252',
          confirmButtonText: 'Si',
          customClass: {
            confirmButton: 'btn btn-primary',
            cancelButton: 'btn btn-danger ml-1'
          },
          buttonsStyling: false,
        }).then((result) => {
          if (result.value) {
            form.Create();
          }
        });
      } else if (this.codeProcessOrder > 0) {
        swal.fire({
          title: 'Confirmación',
          text: `¿Está seguro de continuar con la actualización?.`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#2F8BE6',
          cancelButtonColor: '#F55252',
          confirmButtonText: 'Si',
          customClass: {
            confirmButton: 'btn btn-primary',
            cancelButton: 'btn btn-danger ml-1'
          },
          buttonsStyling: false,
        }).then((result) => {
          if (result.value) {
            form.Update();
          }
        });
      }
    }
  }

  Create(): void {
    this.spinner.show();
    this.errorGeneral = { isError: false, msgError: '' };
    const request = this.GetRequest();
    const file = this.ordenProcesoEditForm.value.file;
    this.ordenProcesoService.Create(file, request).subscribe((res: any) => {
      this.spinner.hide();
      if (res.Result.Success) {
        this.alertUtil.alertOkCallback('CONFIRMACIÓN!', 'Se registro exitosamente.', () => {
          this.Cancel();
        });
      } else {
        this.errorGeneral = { isError: true, msgError: res.Result.Message };
      }
    }, (err: any) => {
      console.log(err);
      this.spinner.hide();
      this.errorGeneral = { isError: true, msgError: this.msgErrorGenerico };
    });
  }

  Update(): void {
    this.spinner.show();
    this.errorGeneral = { isError: false, msgError: '' };
    const request = this.GetRequest();
    const file = this.ordenProcesoEditForm.value.file;
    this.ordenProcesoService.Update(file, request).subscribe((res: any) => {
      this.spinner.hide();
      if (res.Result.Success) {
        this.alertUtil.alertOkCallback('CONFIRMACIÓN!', 'Se actualizo exitosamente.', () => {
          this.Cancel();
        });
      } else {
        this.errorGeneral = { isError: true, msgError: res.Result.Message };
      }
    }, (err: any) => {
      console.log(err);
      this.spinner.hide();
      this.errorGeneral = { isError: true, msgError: this.msgErrorGenerico };
    });
  }

  fileChange(event: any): void {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.ordenProcesoEditForm.patchValue({ file: file });
    }
    this.ordenProcesoEditForm.get('file').updateValueAndValidity();
  }

  SearchByid(): void {
    // this.ordenProcesoService.
  }

  Cancel(): void {
    this.router.navigate(['/exportador/operaciones/ordenproceso/list']);
  }
}
