import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators , FormControl} from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { DateUtil } from '../../../../../../services/util/date-util';
import { AlertUtil } from '../../../../../../services/util/alert-util';
import { MaestroService } from '../../../../../../services/maestro.service';
import{KardexProcesoService} from '../../../../../../services/kardex-proceso.service'
import { ILogin } from '../../../../../../services/models/login';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-kardex-proceso-edit',
  templateUrl: './kardex-proceso-edit.component.html',
  styleUrls: ['./kardex-proceso-edit.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class KardexProcesoEditComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private modalService: NgbModal,
    private dateUtil: DateUtil,
    private maestroService: MaestroService,
    private kardexProcesoService: KardexProcesoService,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: NgxSpinnerService,
    private alertUtil: AlertUtil) { }

  kardexProcesoEditForm: FormGroup;
  errorGeneral = { isError: false, msgError: '' };
  msgErrorGenerico = 'Ocurrio un error interno.';
  @ViewChild(DatatableComponent) tblDetails: DatatableComponent;
  listaCertificado = [];
  listaPlantaProceso = [];
  listaTipoDocumento = [];
  listaTipoOperacion = [];
  listaCalidad = [];
  selectedCertificado: any;
  selectedPlantaProceso: any;
  selectedTipoOperacion: any;
  selectedTipoDocumento: any;
  selectedCalidad: any;
  submittedEdit = false;
  login: ILogin;
  esEdit = false;
  estado: any;
  fechaRegistro: any;
  numero: any = "";
  selectCliente: any;
  id : any;
  responsable: any = "";
  
  ngOnInit(): void {
    this.login = JSON.parse(localStorage.getItem("user"));
    this.id = this.route.snapshot.queryParams.id ? Number(this.route.snapshot.queryParams.id) : 0;
    this.LoadForm();
    this.LoadCombos();
    if (this.id <= 0) {
      this.kardexProcesoEditForm.controls.fechaCabe.setValue(this.dateUtil.currentDate());
      this.kardexProcesoEditForm.controls.fecFinProcesoPlanta.setValue(this.dateUtil.currentDate());
    } else if (this.id > 0) {
      this.esEdit = true;
      this.SearchByid();
    }
  }

  LoadForm(): void {
    this.kardexProcesoEditForm = this.fb.group({
      certificado: new FormControl('', []),
      fechaRegistro: new FormControl('', [Validators.required]),
      plantaProceso: new FormControl('', [Validators.required]),
      tipoDocumento: new FormControl('', []),
      tipoOperacion: new FormControl('', [Validators.required]),
      nroComprobanteInterno: new FormControl('', []),
      nroGuiaRemision: new FormControl('', []),
      nroContrato: new FormControl('', []),
      codCliente:new FormControl('', [Validators.required]),
      clienteId:new FormControl('', [Validators.required]),
      cliente: new FormControl('', [Validators.required]),
      fechaFactura: new FormControl('', []),
      nroFactura: new FormControl('', []),
      kgIngresados: new FormControl('', []),
      nroSacosIngresados: new FormControl('', []),
      qqIngresados: new FormControl('', []),
      precioUnitarioCp: new FormControl('', []),
      totalCp: new FormControl('', []),
      nroSacosDespachados: new FormControl('', []),
      kgDespachados: new FormControl('', []),
      qqDespachados: new FormControl('', []),
      precioUnitario: new FormControl('', []),
      totalVenta: new FormControl('', []),
      calidad: new FormControl('', []),
      saldosKg: new FormControl('', []),
      saldosQq: new FormControl('', [])
      
    });
  }

  get f() {
    return this.kardexProcesoEditForm.controls;
  }

  LoadCombos() {
    this.GetPlantaProceso();
    this.GetTipoOperacion();
    this.GetTipoDocumentoInterno();
    this.GetCertificado();
    this.GetCalidad();
}
  async GetPlantaProceso() {
    const res = await this.maestroService.obtenerMaestros('PlantaProcesoAlmacenKardexProceso').toPromise();
    if (res.Result.Success) {
     this.listaPlantaProceso = res.Result.Data;
    }

  }
  async GetTipoOperacion() {
    const res = await this.maestroService.obtenerMaestros('TipoOperacionKardexProceso').toPromise();
    if (res.Result.Success) {
      this.listaTipoOperacion = res.Result.Data;
    }
  }
  async GetTipoDocumentoInterno() {
    const res = await this.maestroService.obtenerMaestros('TipoDocumentoInternoKardexProceso').toPromise();
    if (res.Result.Success) {
      this.listaTipoDocumento = res.Result.Data;
    }
  }
  async GetCertificado() {
    const res = await this.maestroService.obtenerMaestros('TipoCertificacion').toPromise();
    if (res.Result.Success) {
      this.listaCertificado = res.Result.Data;
    }
  }
  async GetCalidad() {
    const res = await this.maestroService.obtenerMaestros('Calidad').toPromise();
    if (res.Result.Success) {
      this.listaCalidad = res.Result.Data;
    }
  }
  
  GetDataModalClientes(event: any): void {
    this.selectCliente = event;
    if (this.selectCliente[0].Numero)
    this.kardexProcesoEditForm.get('codCliente').setValue(this.selectCliente[0].Numero);
    if (this.selectCliente[0].RazonSocial)
    this.kardexProcesoEditForm.get('cliente').setValue(this.selectCliente[0].RazonSocial);
    if (this.selectCliente[0].ClienteId)
    this.kardexProcesoEditForm.get('clienteId').setValue(this.selectCliente[0].ClienteId);

    
    this.modalService.dismissAll();
  }

  openModal(modalCliente: any): void {
    this.modalService.open(modalCliente, { windowClass: 'dark-modal', size: 'xl', centered: true });
  }

  GetRequest(): any {
    const form = this.kardexProcesoEditForm.value;
    const request = {
      KardexProcesoId: this.id,
      ContratoId: 0,
      TipoDocumentoInternoId: form.tipoDocumento ?? '',
      TipoOperacionId: form.tipoOperacion ?? '',
      EmpresaId:  this.login.Result.Data.EmpresaId,
      Numero: form.nroComprobanteInterno,
      NumeroGuiaRemision: form.nroGuiaRemision,
      NumeroContrato: form.nroContrato,
      FechaContrato: null,
      ClienteId: Number(form.clienteId),
      TipoCertificacionId: form.certificado ?? '',
      CalidadId: form.calidad ?? '',
      CantidadSacosIngresados: Number(form.nroSacosIngresados),
      CantidadSacosDespachados: Number(form.nroSacosDespachados),
      KilosIngresados: Number(form.kgIngresados),
      KilosDespachados: Number(form.kgDespachados),
      QQIngresados: Number(form.qqIngresados),
      QQDespachados: Number(form.qqDespachados),
      FechaFactura: form.fechaFactura ,
      NumeroFactura: form.nroFactura,
      PrecioUnitarioCP: Number(form.precioUnitarioCp) ,
      PrecioUnitarioVenta: Number(form.precioUnitario),
      TotalVenta: Number(form.totalVenta),
      TotalCP: Number(form.totalCp), 
      PlantaProcesoAlmacenId: form.plantaProceso ?? '', 
      FechaIngreso: form.fechaRegistro , 
      Usuario: this.login.Result.Data.NombreUsuario
    }
    let json = JSON.stringify(request);
    return request;
  }

  Save(): void {
    if (!this.kardexProcesoEditForm.invalid) {
        const form = this;
        if (this.id <= 0) {
          this.alertUtil.alertRegistro('Confirmación', `¿Está seguro de continuar con el registro?.` , function (result) {
            if (result.isConfirmed) {
              form.Create();
            }
          });

        } else if (this.id > 0) {

          this.alertUtil.alertRegistro('Confirmación', `¿Está seguro de continuar con la actualización?.` , function (result) {
            if (result.isConfirmed) {
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
    
    this.kardexProcesoService.Registrar(request).subscribe((res: any) => {
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
    this.kardexProcesoService.Actualizar(request).subscribe((res: any) => {
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

  

  SearchByid(): void {
    this.spinner.show();
    this.errorGeneral = { isError: false, msgError: '' };
    this.kardexProcesoService.ConsultarPorId(this.id).subscribe((res) => {
      if (res.Result.Success) {
        this.AutocompleteFormEdit(res.Result.Data);
      } else {
        this.errorGeneral = { isError: true, msgError: res.Result.Message };
      }
    }, (err) => {
      console.log(err);
      this.spinner.hide();
      this.errorGeneral = { isError: true, msgError: this.msgErrorGenerico };
    });
  }
  
  async AutocompleteFormEdit(data: any) {

    if (data) {
      if (data.FechaRegistro)
        this.fechaRegistro = this.dateUtil.formatDate( data.FechaRegistro, '/');
      if (data.Numero)
        this.numero = data.Numero
      if (data.UsuarioRegistro)
      this.responsable = data.UsuarioRegistro;
      if (data.Estado)
      this.estado = data.Estado;
      if (data.FechaIngreso)
        this.kardexProcesoEditForm.controls.fechaRegistro.setValue(formatDate(data.FechaIngreso, 'yyyy-MM-dd', 'en'));
      if (data.PlantaProcesoAlmacenId)
        this.kardexProcesoEditForm.controls.plantaProceso.setValue(data.PlantaProcesoAlmacenId);
      if (data.TipoDocumentoInternoId)
        this.kardexProcesoEditForm.controls.tipoDocumento.setValue(data.TipoDocumentoInternoId);
      if (data.TipoOperacionId)
        this.kardexProcesoEditForm.controls.tipoOperacion.setValue(data.TipoOperacionId);
      if (data.Numero)
        this.kardexProcesoEditForm.controls.nroComprobanteInterno.setValue(data.Numero);
      if (data.NumeroGuiaRemision)
        this.kardexProcesoEditForm.controls.nroGuiaRemision.setValue(data.NumeroGuiaRemision);
      if (data.NumeroContrato)
        this.kardexProcesoEditForm.controls.nroContrato.setValue(data.NumeroContrato);
      if (data.CodigoCliente)
        this.kardexProcesoEditForm.controls.codCliente.setValue(data.CodigoCliente);
      if (data.RazonSocial)
        this.kardexProcesoEditForm.controls.cliente.setValue(data.RazonSocial);
        if (data.ClienteId)
        this.kardexProcesoEditForm.controls.clienteId.setValue(data.ClienteId);
      if (data.TipoCertificacionId)
        this.kardexProcesoEditForm.controls.certificado.setValue(data.TipoCertificacionId);
      if (data.FechaFactura)
        this.kardexProcesoEditForm.controls.fechaFactura.setValue(formatDate(data.FechaFactura, 'yyyy-MM-dd', 'en'));
      if (data.NumeroFactura)
        this.kardexProcesoEditForm.controls.nroFactura.setValue(data.NumeroFactura);
      if (data.KilosIngresados)
      {
        this.kardexProcesoEditForm.controls.kgIngresados.setValue(data.KilosIngresados);
        this.kardexProcesoEditForm.controls.saldosKg.setValue(Number(data.KilosIngresados) - Number(data.KilosDespachados));
      }
      if (data.CantidadSacosIngresados) {
        this.kardexProcesoEditForm.controls.nroSacosIngresados.setValue(data.CantidadSacosIngresados);
      }
      if (data.QQIngresados)
      {
        this.kardexProcesoEditForm.controls.qqIngresados.setValue(data.QQIngresados);
        this.kardexProcesoEditForm.controls.saldosQq.setValue(Number(data.QQIngresados) - Number(data.QQDespachados));
      }
      if (data.PrecioUnitarioCP)
        this.kardexProcesoEditForm.controls.precioUnitarioCp.setValue(data.PrecioUnitarioCP);
      if (data.TotalCP)
        this.kardexProcesoEditForm.controls.totalCp.setValue(data.TotalCP);
      if (data.CantidadSacosDespachados)
        this.kardexProcesoEditForm.controls.nroSacosDespachados.setValue(data.CantidadSacosDespachados);
      if (data.KilosDespachados)
        this.kardexProcesoEditForm.controls.kgDespachados.setValue(data.KilosDespachados);
      if (data.QQDespachados)
        this.kardexProcesoEditForm.controls.qqDespachados.setValue(data.QQDespachados);
      if (data.PrecioUnitarioVenta)
        this.kardexProcesoEditForm.controls.precioUnitario.setValue(data.PrecioUnitarioVenta);
      if (data.TotalVenta)
        this.kardexProcesoEditForm.controls.totalVenta.setValue(data.TotalVenta);     
        if (data.CalidadId)
        this.kardexProcesoEditForm.controls.calidad.setValue(data.CalidadId); 
    }
    this.spinner.hide();
  }

 
calcularSaldosKg()
{
  var KgIng = this.kardexProcesoEditForm.controls.kgIngresados.value;
  var KgDesp = this.kardexProcesoEditForm.controls.kgDespachados.value;
  this.kardexProcesoEditForm.controls.saldosKg.setValue(Number(KgIng) - Number(KgDesp));
  
}

calcularSaldosQq()
{
  var QqIng = this.kardexProcesoEditForm.controls.qqIngresados.value;
  var QqDesp = this.kardexProcesoEditForm.controls.qqDespachados.value;
  this.kardexProcesoEditForm.controls.saldosQq.setValue(Number(QqIng) - Number(QqDesp));
}



  Cancel(): void {
    this.router.navigate(['/acopio/operaciones/kardexProceso']);
  }
}
