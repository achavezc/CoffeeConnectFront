import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { ILogin } from '../../../../../../services/models/login';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { MaestroService } from '../../../../../../services/maestro.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from "@angular/router";
import { Certificaciones, ReqAduanas, Detalle, Cargamento } from './../../../../../../services/models/req-aduanas-registrar';
import { OrdenservicioControlcalidadService } from './../../../../../../services/ordenservicio-controlcalidad.service';
import { AlertUtil } from '../../../../../../services/util/alert-util';
import { ActivatedRoute } from '@angular/router';
import { DateUtil } from '../../../../../../services/util/date-util';
import { AduanaService } from '../../../../../../services/aduanas.service';
import { EmpresaProveedoraService } from '../../../../../../services/empresaproveedora.service';
import { formatDate } from '@angular/common';
import {AuthService} from './../../../../../../services/auth.service';


@Component({
  selector: 'app-aduanas-edit',
  templateUrl: './aduanas-edit.component.html',
  styleUrls: ['./aduanas-edit.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AduanasEditComponent implements OnInit {

  @ViewChild('vform') validationForm: FormGroup;
  @ViewChild(DatatableComponent) table: DatatableComponent;

  login: any;
  aduanasFormEdit: FormGroup;
  formControlEmbarque: FormGroup;
  selectEstado: any;
  submittedEdit = false;
  submitted = false;
  detalle: any;
  numero: any = "";
  fechaRegistro: any;
  esEdit = false;
  listaEstado: any[];
  listEstadoEmbarque: any[];
  selectEstadoEmbarque: any[] = [];
  listEmbarque: any[];
  selectEmbarque: any;
  rows = [];
  errorGeneral: any = { isError: false, errorMessage: '' };
  selectEmpresa: any[] = [];
  selectExportador: any[] = [];
  selectedEmbarqueStatus: any[] = [];
  selectProductor: any[] = [];
  selectContrato: any[] = [];
  responsable: "";
  id: Number = 0;
  mensajeErrorGenerico = "Ocurrio un error interno.";
  estado: any;
  dropdownListExp = [];
  dropdownListProd = [];
  selectedItemsExp = [];
  selectedItemsProd = [];
  dropdownSettings = {};
  popUp = true;
  //form = "aduanas";
  isLoading = false;
  readonly: boolean;
  @ViewChild(DatatableComponent) tblDetails: DatatableComponent;
  listEstadoEnvio: any[];
  selectEstadoEnvio: any;

  rowsDetails = [];
  constructor(private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private maestroService: MaestroService,
    private modalService: NgbModal,
    private router: Router,
    private ordenservicioControlcalidadService: OrdenservicioControlcalidadService,
    private alertUtil: AlertUtil,
    private route: ActivatedRoute,
    private dateUtil: DateUtil,
    private empresaProveedoraService: EmpresaProveedoraService,
    private aduanaService: AduanaService,
    private authService : AuthService) {
  }

  ngOnInit(): void {
    this.login = JSON.parse(localStorage.getItem("user"));
    this.cargarForm();
    this.route.queryParams
      .subscribe(params => {
        if (Number(params.id)) {
          this.id = Number(params.id);
          this.esEdit = true;
          this.obtenerDetalle();
        }

      });

    this.dropdownSettings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 100,
      allowSearchFilter: true
    };
    //this.readonly= this.authService.esReadOnly(this.login.Result.Data.OpcionesEscritura, this.aduanasFormEdit);
  }
  cargarForm() {
    this.aduanasFormEdit = this.fb.group(
      {
        contrato: ['', [Validators.required]],
        ruc: new FormControl('', []),
        agencia: new FormControl('', []),
        clientefinal: new FormControl('', []),
        floid: new FormControl('', []),
        exportador: new FormControl('', []),
        certificacionesExportador: new FormControl('', []),
        productor: new FormControl('', []),
        certificacionesProductor: new FormControl('', []),
        numeroContratoInternoProductor: new FormControl('', []),
        mesEmbarque: new FormControl('', []),
        producto: new FormControl('', []),
        subproducto: new FormControl('', []),
        calidad: new FormControl('', []),
        empaque: new FormControl('', []),
        certificacion: new FormControl('', []),
        cantidadDefectos: new FormControl('', []),
        cantidad: new FormControl('', []),
        numeroContenedores: new FormControl('', []),
        statusPagoFactura: new FormControl('', []),
        pesoxsaco: new FormControl('', []),
        fechaPagoFactura: new FormControl('', []),
        totalkilosnetos: new FormControl('', []),
        fechaEnvio: new FormControl('', []),
        courier: new FormControl('', []),
        fechaRecepcion: new FormControl('', []),
        trackingNumber: new FormControl('', []),
        estadoEnvio: [],
        observacion: new FormControl('', []),
        fechaEnvioDocumentos: new FormControl('', []),
        fechaLlegadaDocumentos: new FormControl('', []),
        
      });

     /* this.formControlEmbarque = this.fb.group({
        embarque:new FormControl('', [])
      })
     this.CargarStatusEmbarque();*/

    this.maestroService.obtenerMaestros("EstadoMuestra")
      .subscribe(res => {
        if (res.Result.Success) {
          this.listaEstado = res.Result.Data;
        }
      },
        err => {
          console.error(err);
        }
      );



    this.maestroService.obtenerMaestros("EstadoMuestra")
      .subscribe(res => {
        if (res.Result.Success) {
          this.listEstadoEnvio = res.Result.Data;
         
        }
      },
        err => {
          console.error(err);
        }
      );

    this.maestroService.obtenerMaestros("EstadoSeguimientoAduana")
      .subscribe(res => {
        if (res.Result.Success) {
          this.listEstadoEmbarque = res.Result.Data;
         
        }
      },
        err => {
          console.error(err);
        }
      );
  }

  receiveMessage($event) {
    this.selectEmpresa = $event
    this.aduanasFormEdit.get('ruc').setValue(this.selectEmpresa[0].Ruc);
    this.aduanasFormEdit.get('agencia').setValue(this.selectEmpresa[0].RazonSocial);
    this.modalService.dismissAll();
  }

  async addRowDetail() {
    
    this.rowsDetails = [...this.rowsDetails, {
      Cantidad: 0,
      PesoPorSacoKilos: 0,
      TotalKilosNetos: 0,
      NumeroContenedorEmbarcar: '',
      FechaSalidaPlanta: null,
      FechaZarpeNave: null,
      FechaFacturacion: null,
      Puerto: '',
      Marca: '',
      PO: '',
      EstadoSeguimientoId: '',
      FechaEstampado: null
    }];

  }

  async CargarStatusEmbarque() {
    var data = await this.maestroService.obtenerMaestros("EstadoSeguimientoAduana").toPromise();
    if (data.Result.Success) {
      this.listEmbarque = data.Result.Data;
     // this.formGroupEmbarque.controls["embarque"].setValue("01");
    }

    /*this.maestroService.obtenerMaestros("EstadoSeguimientoAduana")
    .subscribe(res => {
      if (res.Result.Success) {
        this.listEmbarque = res.Result.Data;
      }
    },
      err => {
        console.error(err);
      }
    );*/
  }

  DeleteRowDetail(index: any): void {
    this.rowsDetails.splice(index, 1);
    this.rowsDetails = [...this.rowsDetails];
  }

  UpdateValuesGridDetails(event: any, index: any, prop: any,  row: any): void {
    var x = row;
    if (prop === 'cantidad')
      this.rowsDetails[index].Cantidad = parseFloat(event.target.value);
    else if (prop == 'pesoPorSacoKilos')
      this.rowsDetails[index].PesoPorSacoKilos = parseFloat(event.target.value);
    else if (prop == 'totalKilosNetos')
      this.rowsDetails[index].TotalKilosNetos = parseFloat(event.target.value);
    else if (prop == 'numeroContenedorEmbarcar')
      this.rowsDetails[index].NumeroContenedorEmbarcar = event.target.value;
    else if (prop == 'fechaSalidaPlanta')
      this.rowsDetails[index].FechaSalidaPlanta = event.target.value;
    else if (prop === 'fechaZarpeNave')
      this.rowsDetails[index].FechaZarpeNave = event.target.value;
    else if (prop === 'fechaFacturacion')
      this.rowsDetails[index].FechaFacturacion = event.target.value;
    else if (prop === 'puerto')
      this.rowsDetails[index].Puerto = event.target.value;
    else if (prop === 'marca')
      this.rowsDetails[index].Marca = event.target.value;
    else if (prop === 'po')
      this.rowsDetails[index].PO = event.target.value;
    else if (prop === 'estadoSegId')
      this.rowsDetails[index].EstadoSeguimientoId = event.Codigo;
    else if (prop === 'fechaEstampado')
      this.rowsDetails[index].FechaEstampado = event.target.value;

  }


  receiveMessageExportador($event) {

    this.selectExportador = $event
    this.aduanasFormEdit.get('exportador').setValue(this.selectExportador[0].RazonSocial);
    this.consultarCertificaciones(this.selectExportador[0].EmpresaProveedoraAcreedoraId, 'Exportador');

    this.modalService.dismissAll();
  }

  receiveMessageProductor($event) {
    this.selectProductor = $event
    this.aduanasFormEdit.get('productor').setValue(this.selectProductor[0].RazonSocial);
    this.consultarCertificaciones(this.selectProductor[0].EmpresaProveedoraAcreedoraId, 'Productor');
    this.modalService.dismissAll();
  }

  receiveMessageContrato($event) {
    this.selectContrato = $event;
    this.aduanasFormEdit.get('contrato').setValue(this.selectContrato[0].Numero);
    this.aduanasFormEdit.get('producto').setValue(this.selectContrato[0].Producto);
    this.aduanasFormEdit.get('subproducto').setValue(this.selectContrato[0].SubProducto);
    this.aduanasFormEdit.get('calidad').setValue(this.selectContrato[0].Calidad);
    this.aduanasFormEdit.get('empaque').setValue(this.selectContrato[0].Empaque + " - " + this.selectContrato[0].TipoEmpaque);
    this.aduanasFormEdit.get('cantidad').setValue(this.selectContrato[0].TotalSacos);
    this.aduanasFormEdit.get('pesoxsaco').setValue(this.selectContrato[0].PesoPorSaco);
    this.aduanasFormEdit.get('totalkilosnetos').setValue(this.selectContrato[0].PesoKilos);
    this.aduanasFormEdit.get('clientefinal').setValue(this.selectContrato[0].Cliente);
    this.aduanasFormEdit.get('floid').setValue(this.selectContrato[0].FloId);
    this.aduanasFormEdit.get('mesEmbarque').setValue(this.selectContrato[0].FechaEmbarque);
    this.aduanasFormEdit.get('statusPagoFactura').setValue(this.selectContrato[0].EstadoPagoFactura);
    this.aduanasFormEdit.get('fechaPagoFactura').setValue(this.dateUtil.formatDate(this.selectContrato[0].FechaPagoFactura, '/'));
    this.aduanasFormEdit.get('certificacion').setValue(this.selectContrato[0].TipoCertificacion);
    this.aduanasFormEdit.get('cantidadDefectos').setValue(this.selectContrato[0].PreparacionCantidadDefectos);
    this.aduanasFormEdit.get('numeroContenedores').setValue(this.selectContrato[0].CantidadContenedores);
    this.modalService.dismissAll();
  }

 

  onItemSelect(item: any) {
    console.log(item);
  }
  onSelectAll(items: any) {
    console.log(items);
  }
  openModal(modalEmpresa) {
    this.modalService.open(modalEmpresa, { size: 'xl', centered: true });

  }

  consultarCertificaciones(id: number, tipo: string) {
    let request = { EmpresaProveedoraAcreedoraId: id }

    this.empresaProveedoraService.ConsultarCertificaciones(request)
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            let arrayCertificaciones = [];
            res.Result.Data.Certificaciones.forEach(x => {
              let object = { item_id: x.TipoCertificacionId + "-" + x.EmpresaProveedoraAcreedoraId, item_text: x.Certificacion + "-" + x.CodigoCertificacion }
              arrayCertificaciones.push(object);

            });
            if (tipo == 'Exportador') {
              this.dropdownListExp = arrayCertificaciones;
            }
            else if (tipo == 'Productor') {
              this.dropdownListProd = arrayCertificaciones;
            }

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
          this.errorGeneral = { isError: true, errorMessage: this.mensajeErrorGenerico };
        }
      );
  }
  async obtenerDetalle() {

    this.spinner.show();
    await this.CargarStatusEmbarque();
    let request = { AduanaId: Number(this.id) }
    this.aduanaService.ConsultarPorId(request)
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            this.formCargamentos(res.Result.Data);
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

    let json = JSON.stringify(data);
   // this.formCargamentos(data);
    this.selectEmpresa[0] = { EmpresaProveedoraAcreedoraId: data.EmpresaAgenciaAduaneraId };
    this.selectExportador[0] = { EmpresaProveedoraAcreedoraId: data.EmpresaExportadoraId };
    this.selectProductor[0] = { EmpresaProveedoraAcreedoraId: data.EmpresaProductoraId };
    this.selectContrato[0] = { ContratoId: data.ContratoId }
    this.id = data.AduanaId;
    this.numero = data.Numero;
    this.estado = data.Estado;
    this.responsable = data.UsuarioRegistro;
    this.fechaRegistro = this.dateUtil.formatDate(new Date(data.FechaRegistro), "/");
    if (data.NumeroContrato)
      this.aduanasFormEdit.get('contrato').setValue(data.NumeroContrato);
    if (data.RucEmpresaAgenciaAduanera)
      this.aduanasFormEdit.get('ruc').setValue(data.RucEmpresaAgenciaAduanera);
    if (data.RazonSocialEmpresaAgenciaAduanera)
      this.aduanasFormEdit.get('agencia').setValue(data.RazonSocialEmpresaAgenciaAduanera);
    this.aduanasFormEdit.get('clientefinal').setValue(data.RazonSocialCliente);
    this.aduanasFormEdit.get('floid').setValue(data.FloId);
    this.aduanasFormEdit.get('exportador').setValue(data.RazonSocialEmpresaExportadora);
    this.aduanasFormEdit.get('productor').setValue(data.RazonSocialEmpresaProductora);
    this.consultarCertificaciones(data.EmpresaExportadoraId, 'Exportador');
    this.consultarCertificaciones(data.EmpresaProductoraId, 'Productor');
    this.aduanasFormEdit.get('mesEmbarque').setValue(formatDate(data.FechaEmbarque, 'MM-yyyy', 'en'));
    if (data.NumeroContratoInternoProductor)
      this.aduanasFormEdit.get('numeroContratoInternoProductor').setValue(data.NumeroContratoInternoProductor);
    this.aduanasFormEdit.get('producto').setValue(data.Producto);
    this.aduanasFormEdit.get('subproducto').setValue(data.SubProducto);
    this.aduanasFormEdit.get('calidad').setValue(data.Calidad);
    this.aduanasFormEdit.get('empaque').setValue(data.TipoEmpaque + "-" + data.Empaque);
    this.aduanasFormEdit.get('certificacion').setValue(data.TipoCertificacion);
    this.aduanasFormEdit.get('cantidadDefectos').setValue(data.PreparacionCantidadDefectos);
    this.aduanasFormEdit.get('cantidad').setValue(data.TotalSacos);
    this.aduanasFormEdit.get('numeroContenedores').setValue(data.NumeroContenedores);
    this.aduanasFormEdit.get('statusPagoFactura').setValue(data.EstadoPagoFactura);
    this.aduanasFormEdit.get('pesoxsaco').setValue(data.PesoPorSaco);
    if (data.FechaPagoFactura)
      this.aduanasFormEdit.get('fechaPagoFactura').setValue(data.FechaPagoFactura == null ? null : formatDate(data.FechaPagoFactura, 'dd/MM/yyyy', 'en'));
    this.aduanasFormEdit.get('totalkilosnetos').setValue(data.PesoKilos);
    if (data.FechaEnvioMuestra)
      this.aduanasFormEdit.get('fechaEnvio').setValue(data.FechaEnvioMuestra == null ? null : formatDate(data.FechaEnvioMuestra, 'yyyy-MM-dd', 'en'));
    if (data.FechaRecepcionMuestra)
      this.aduanasFormEdit.controls["fechaRecepcion"].setValue(data.FechaRecepcionMuestra == null ? null : formatDate(data.FechaRecepcionMuestra, 'yyyy-MM-dd', 'en'));
    this.aduanasFormEdit.get('estadoEnvio').setValue(data.EstadoMuestraId);
    this.aduanasFormEdit.get('courier').setValue(data.Courier);
    this.aduanasFormEdit.get('trackingNumber').setValue(data.NumeroSeguimientoMuestra);
    this.aduanasFormEdit.get('observacion').setValue(data.Observacion);
    if (data.FechaEnvioDocumentos)
      this.aduanasFormEdit.get('fechaEnvioDocumentos').setValue(data.FechaEnvioDocumentos == null ? null : formatDate(data.FechaEnvioDocumentos, 'yyyy-MM-dd', 'en'));
    if (data.FechaLlegadaDocumentos)
      this.aduanasFormEdit.get('fechaLlegadaDocumentos').setValue(data.FechaLlegadaDocumentos == null ? null : formatDate(data.FechaLlegadaDocumentos, 'yyyy-MM-dd', 'en'));

    data.Cargamentos.forEach(obj => {
      if (obj.FechaZarpeNave)
        obj.FechaZarpeNave = formatDate(obj.FechaZarpeNave, 'yyyy-MM-dd', 'en');
      if (obj.FechaFacturacion)
        obj.FechaFacturacion = formatDate(obj.FechaFacturacion, 'yyyy-MM-dd', 'en');
      if (obj.FechaEstampado)
        obj.FechaEstampado = formatDate(obj.FechaEstampado, 'yyyy-MM-dd', 'en');
      if (obj.FechaSalidaPlanta)
        obj.FechaSalidaPlanta = formatDate(obj.FechaSalidaPlanta, 'yyyy-MM-dd', 'en');
        this.selectEstadoEmbarque[obj.AduanaCargamentoId] = obj.EstadoSeguimientoId;
    });
    this.rowsDetails = [...data.Cargamentos]
   
    let selectarrayProd = [];
    let selectarrayExp = [];
    data.Certificaciones.forEach(x => {

      let object = { item_id: x.TipoCertificacionId + "-" + x.EmpresaProveedoraAcreedoraId, item_text: x.Certificacion + "-" + x.CodigoCertificacion }
      if (x.TipoId == '02') {
        selectarrayExp.push(object);
      }
      else if (x.TipoId == '01') {
        selectarrayProd.push(object);
      }
    });
    this.selectedItemsProd = selectarrayProd;
    this.selectedItemsExp = selectarrayExp;
    var x = this.listEstadoEmbarque;
    //this.aduanasFormEdit.get('formControlEmbarque').get('embarque').setValue('02');
    //this.formControlEmbarque.get("embarque").setValue('02');
    
  }

  get fedit() {
    return this.aduanasFormEdit.controls;
  }

  formCargamentos(data: any) {
    let groupsEmbarque = {}
    data.Cargamentos.forEach(obj => {
      groupsEmbarque[obj.AduanaCargamentoId + 'embarque'] = new FormControl('', []);

    });
   this.formControlEmbarque = new FormGroup(groupsEmbarque);
  }

  guardar() {
    const form = this;
    if (this.aduanasFormEdit.invalid) {

      this.submittedEdit = true;
      return;
    }
    else {
      this.submittedEdit = false;
      var x = this.rowsDetails;
      let listCertificaciones: Certificaciones[] = [];
      let listDetalle: Detalle[] = [];
      let cargamentos: Cargamento[] = [];

      this.rowsDetails.forEach(x => {
        let cargamento: Cargamento = new Cargamento();
        cargamento.AduanaId = this.id
        cargamento.Cantidad = x.Cantidad;
        cargamento.PesoPorSacoKilos = x.PesoPorSacoKilos;
        cargamento.TotalKilosNetos = x.TotalKilosNetos;
        cargamento.NumeroContenedorEmbarcar = x.NumeroContenedorEmbarcar;
        if (x.FechaSalidaPlanta == "")
          cargamento.FechaSalidaPlanta = null;
        else
          cargamento.FechaSalidaPlanta = x.FechaSalidaPlanta;
        if (x.FechaZarpeNave == "")
          cargamento.FechaZarpeNave = null;
        else
          cargamento.FechaZarpeNave = x.FechaZarpeNave;
        if (x.FechaFacturacion == "")
          cargamento.FechaFacturacion = null;
        else
          cargamento.FechaFacturacion = x.FechaFacturacion;

        cargamento.Puerto = x.Puerto;
        cargamento.Marca = x.Marca;
        cargamento.PO = x.PO;
        cargamento.EstadoSeguimientoId = x.EstadoSeguimientoId;
        if (x.FechaEstampado == "")
          cargamento.FechaEstampado = null;
        else
          cargamento.FechaEstampado = x.FechaEstampado;
        cargamentos.push(cargamento);
      });

      this.selectedItemsExp.forEach(x => {
        let certificacion: Certificaciones = new Certificaciones();
        certificacion.TipoCertificacionId = x.item_id.split("-")[0];
        certificacion.CodigoCertificacion = x.item_text.split("-")[1];
        certificacion.EmpresaProveedoraAcreedoraId = Number(x.item_id.split("-")[1]);
        certificacion.TipoId = '02'
        listCertificaciones.push(certificacion);
      });
      this.selectedItemsProd.forEach(x => {
        let certificacion: Certificaciones = new Certificaciones();
        certificacion.TipoCertificacionId = x.item_id.split("-")[0];
        certificacion.CodigoCertificacion = x.item_text.split("-")[1];
        certificacion.EmpresaProveedoraAcreedoraId = Number(x.item_id.split("-")[1]);
        certificacion.TipoId = '01'
        listCertificaciones.push(certificacion);
      });
      let request = new ReqAduanas(
        this.login.Result.Data.EmpresaId,
        Number(this.id),
        this.numero,
        Number(this.selectContrato[0].ContratoId),
        Number(this.selectEmpresa.length == 0 ? 0 : this.selectEmpresa[0].EmpresaProveedoraAcreedoraId),
        Number(this.selectExportador.length == 0 ? 0 : this.selectExportador[0].EmpresaProveedoraAcreedoraId),
        Number(this.selectProductor.length == 0 ? 0 : this.selectProductor[0].EmpresaProveedoraAcreedoraId),
        this.aduanasFormEdit.get('numeroContratoInternoProductor').value,
        Number(this.aduanasFormEdit.get('numeroContenedores').value),
        this.aduanasFormEdit.get('fechaEnvio').value == "" ? null : this.aduanasFormEdit.get('fechaEnvio').value,
        this.aduanasFormEdit.get('fechaRecepcion').value == "" ? null : this.aduanasFormEdit.get('fechaRecepcion').value,
        this.aduanasFormEdit.get('estadoEnvio').value,
        this.aduanasFormEdit.get('courier').value,
        this.aduanasFormEdit.get('trackingNumber').value,
        this.aduanasFormEdit.get('observacion').value,
        this.aduanasFormEdit.get('fechaEnvioDocumentos').value == "" ? null : this.aduanasFormEdit.get('fechaEnvioDocumentos').value,
        this.aduanasFormEdit.get('fechaLlegadaDocumentos').value == "" ? null : this.aduanasFormEdit.get('fechaLlegadaDocumentos').value,
        listCertificaciones,
        listDetalle,
        this.login.Result.Data.NombreUsuario,
        cargamentos
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
        this.alertUtil.alertRegistro('Confirmación', `¿Está seguro de continuar con la actualización?.`, function (result) {
          if (result.isConfirmed) {
            form.actualizar(request);
          }
        });

      } else {
        this.alertUtil.alertRegistro('Confirmación', `¿Está seguro de continuar con el registro?.`, function (result) {
          if (result.isConfirmed) {
            form.registrar(request);
          }
        });
      }
    }

  }

  registrar(request: ReqAduanas) {
    this.aduanaService.Registrar(request)
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            var form = this;
            this.alertUtil.alertOkCallback('Registrado!', 'Informacion Aduanas', function (result) {
              if (result.isConfirmed) {
                form.router.navigate(['operaciones/aduanas/list']);
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

  actualizar(request: ReqAduanas) {
    this.aduanaService.Actualizar(request)
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            var form = this;
            this.alertUtil.alertOkCallback('Actualizado!', 'Informacion Aduanas', function (result) {
              if (result.isConfirmed) {
                form.router.navigate(['/operaciones/aduanas/list']);
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
    this.router.navigate(['/exportador/operaciones/aduanas/list']);
  }

  addRow(): void {

    this.rows = [...this.rows, { NroNotaIngresoPlanta: '', CantidadSacos: 0, KilosNetos: 0, NumeroLote: '' }];
  }

  EliminarFila(index: any): void {
    this.rows.splice(index, 1);
    this.rows = [...this.rows];
  }

  openModalDocumentos(customContent) {
    this.modalService.open(customContent, { windowClass: 'dark-modal', size: 'xl', centered: true });
  }

  close() {
    this.modalService.dismissAll();
  }
}