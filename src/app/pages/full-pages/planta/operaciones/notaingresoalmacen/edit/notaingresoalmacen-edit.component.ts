import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn, FormBuilder } from '@angular/forms';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from "ngx-spinner";
import { MaestroUtil } from '../../../../../../services/util/maestro-util';
import { NotaIngresoAlmacenPlantaService } from '../../../../../../services/nota-ingreso-almacen-planta-service';
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

@Component({
  selector: 'app-notaingresoalmacen-edit',
  templateUrl: './notaingresoalmacen-edit.component.html',
  styleUrls: ['./notaingresoalmacen-edit.component.scss', "/assets/sass/libs/datatables.scss"],
  encapsulation: ViewEncapsulation.None
})

export class NotaIngresoAlmacenEditComponent implements OnInit {
  consultaNotaIngresoAlmacenFormEdit: FormGroup;
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
  readonly: boolean;
  detalle: any;
  popUp = true;
  form: string = "notaingresoalmacenplanta"
  selectSubProducto: any;
  listaSubProducto: any[];
  listaCertificacion: any[];
  listaCertificadora: any[];
  selectedCertificacion: any;
  selectedCertificadora: any;
  listaTipoProduccion: any[];
  listaTipo: any[];
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
    this.route.queryParams
      .subscribe(params => {
        if (Number(params.id)) {
          this.id = Number(params.id);
          this.obtenerDetalle();

        }
      }
      );
      this.readonly= this.authService.esReadOnly(this.vSessionUser.Result.Data.OpcionesEscritura);
  }
  get frendExport() {
    return this.consultaNotaIngresoAlmacenFormEdit.controls;
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
    this.consultaNotaIngresoAlmacenFormEdit = this.fb.group(
      {
        almacen: new FormControl('', [Validators.required]),
        guiaremision: new FormControl({ value: '', disabled: true }, []),
        fecharemision: new FormControl({ value: '', disabled: true }, []),
        tipoProduccion: new FormControl({ value: '', disabled: true }, []),
        codigoOrganizacion: new FormControl({ value: '', disabled: true }, []),
        nombreOrganizacion: new FormControl({ value: '', disabled: true }, []),
        producto: new FormControl({ value: '', disabled: true }, []),
        direccion: new FormControl({ value: '', disabled: true }, []),
        rucOrganizacion: new FormControl({ value: '', disabled: true }, []),
        razonSocialOrganizacion:  new FormControl({ value: '', disabled: true }, []),
        subproducto: new FormControl({ value: '', disabled: true }, []),
        certificacion: new FormControl({ value: '', disabled: true }, []),
        certificadora: new FormControl({ value: '', disabled: true }, []),
        unidadMedidaDesc: new FormControl({ value: '', disabled: true }, []),
        cantidad: new FormControl({ value: '', disabled: true }, []),
        pesoBruto: new FormControl({ value: '', disabled: true }, []),
        calidad: new FormControl({ value: '', disabled: true }, []),
        tara: new FormControl({ value: '', disabled: true }, []),
        grado: new FormControl({ value: '', disabled: true }, []),
        kilosNetos: new FormControl({ value: '', disabled: true }, []),
        cantidadDefectos: new FormControl({ value: '', disabled: true }, []),
        rendimiento: new FormControl({ value: '', disabled: true }, []),
        humedad: new FormControl({ value: '', disabled: true }, []),
        exportGramos: new FormControl({ value: '', disabled: true }, []),
        exportPorcentaje: new FormControl({ value: '', disabled: true }, []),
        descarteGramos: new FormControl({ value: '', disabled: true }, []),
        descartePorcentaje: new FormControl({ value: '', disabled: true }, []),
        cascarillaGramos: new FormControl({ value: '', disabled: true }, []),
        cascarillaPorcentaje: new FormControl({ value: '', disabled: true }, []),
        totalGramos: new FormControl({ value: '', disabled: true }, []),
        totalPorcentaje: new FormControl({ value: '', disabled: true }, []),
        humedadAnalsisFisico: new FormControl({ value: '', disabled: true }, []),
        puntajeFinal: new FormControl({ value: '', disabled: true }, []),
        pesoxSaco: new FormControl({ value: '', disabled: true }, []),
        controlCalidad: new FormControl({ value: '', disabled: true }, [Validators.required]),
        numeroNotaIngreso: new FormControl({ value: '', disabled: true }, []),
        fechaControlCalidad: new FormControl({ value: '', disabled: true }, []),
        fechaNotaIngreso: new FormControl({ value: '', disabled: true }, []),
        cantidadAlmacen: new FormControl({ value: '', disabled: false }, [Validators.required]),
        tipo: new FormControl({ value: '', disabled: true }, []),
        pesoBrutoAlmacen: new FormControl({ value: '', disabled: false }, [Validators.required]),
        empaque: new FormControl({ value: '', disabled: true }, []),
        taraAlmacen: new FormControl({ value: '', disabled: true }, []),
        kilosNetosAlmacen: new FormControl({ value: '', disabled: true }, []),
        estadoCalidad: new FormControl({ value: '', disabled: true }, []),
        pesado: this.fb.group({
          motivo: new FormControl({ value: '', disabled: true }, []),
          empaque: new FormControl({ value: '', disabled: true }, []),
          tipo: new FormControl({ value: '', disabled: true }, []),
          cantidad: new FormControl({ value: '', disabled: true }, []),
          kilosBrutos: new FormControl({ value: '', disabled: true }, []),
          pesoSaco: new FormControl({ value: '', disabled: true }, []),
          calidad: new FormControl({ value: '', disabled: true }, []),
          tara: new FormControl({ value: '', disabled: true }, []),
          kilosNetos: new FormControl({ value: '', disabled: true }, []),
          grado: new FormControl({ value: '', disabled: true }, []),
          cantidadDefectos: new FormControl({ value: '', disabled: true }, []),
          porcentajeRendimiento: new FormControl({ value: '', disabled: true }, []),
          porcentajeHumedad: new FormControl({ value: '', disabled: true }, []),
          transportista: new FormControl({ value: '', disabled: true }, []),
          ruc: new FormControl({ value: '', disabled: true }, []),
          placaVehiculo: new FormControl({ value: '', disabled: true }, []),
          chofer: new FormControl({ value: '', disabled: true }, []),
          numeroBrevete: new FormControl({ value: '', disabled: true }, []),
          marca: new FormControl({ value: '', disabled: true }, []),
          observacion: new FormControl({ value: '', disabled: true }, [])
        })
      });
      //this.consultaNotaIngresoAlmacenFormEdit.get('pesado').disable();
     // this.consultaNotaIngresoAlmacenFormEdit.disable();

  }

  agregarControlCalidad(e) {
    this.obtenerDetalleControlCalidad(e[0].ControlCalidadPlantaId);

  }
  openModal(customContent) {
    this.modalService.open(customContent, { windowClass: 'dark-modal', size: 'xl', centered: true });
  }
  obtenerDetalleControlCalidad(id) {
    this.spinner.show();
    this.controlCalidadService.ConsultarPorId(Number(id))
      .subscribe(res => {

        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            this.detalle = res.Result.Data;
            if (this.detalle != null) 
            {
              this.detalle.RucEmpresaOrigen = res.Result.Data.RucOrganizacion;
              this.detalle.RazonSocialEmpresaOrigen = res.Result.Data.RazonSocialOrganizacion;
              this.detalle.DireccionEmpresaOrigen = res.Result.Data.DireccionOrganizacion;  

              this.detalle.PesoBruto = res.Result.Data.KilosBrutos;

              this.cargarDataFormulario(this.detalle);
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
  }




  get fedit() {
    return this.consultaNotaIngresoAlmacenFormEdit.controls;
  }

  obtenerDetalle() {
    this.spinner.show();
    this.notaIngresoAlmacenPlantaService.obtenerDetalle(Number(this.id))
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
 
    

    this.controlCalidadPlantaId = data.ControlCalidadPlantaId;
    this.consultaNotaIngresoAlmacenFormEdit.controls["estadoCalidad"] = data.EstadoCalidadId;
    if( data.EstadoCalidadId == "02" && this.id == 0){
      this.consultaNotaIngresoAlmacenFormEdit.controls["cantidadAlmacen"].setValue(data.CantidadControlCalidad);
      this.consultaNotaIngresoAlmacenFormEdit.controls["pesoBrutoAlmacen"].setValue(data.PesoBrutoControlCalidad);
      this.consultaNotaIngresoAlmacenFormEdit.controls["taraAlmacen"].setValue(data.TaraControlCalidad);
      this.consultaNotaIngresoAlmacenFormEdit.controls["kilosNetosAlmacen"].setValue(data.KilosNetosControlCalidad);

      this.consultaNotaIngresoAlmacenFormEdit.get("cantidadAlmacen").disable();
      this.consultaNotaIngresoAlmacenFormEdit.get("pesoBrutoAlmacen").disable();
      
    }else if( data.EstadoCalidadId == "01" && this.id == 0){
      this.consultaNotaIngresoAlmacenFormEdit.controls["cantidadAlmacen"].setValue("");
      this.consultaNotaIngresoAlmacenFormEdit.controls["pesoBrutoAlmacen"].setValue("");
      this.consultaNotaIngresoAlmacenFormEdit.controls["taraAlmacen"].setValue("");
      this.consultaNotaIngresoAlmacenFormEdit.controls["kilosNetosAlmacen"].setValue("");
      this.consultaNotaIngresoAlmacenFormEdit.get("cantidadAlmacen").enable();
      this.consultaNotaIngresoAlmacenFormEdit.get("pesoBrutoAlmacen").enable()
      this.calcularTara();
    }
  if(this.id > 0){
    this.consultaNotaIngresoAlmacenFormEdit.controls["cantidadAlmacen"].setValue(data.Cantidad);
    this.consultaNotaIngresoAlmacenFormEdit.controls["pesoBrutoAlmacen"].setValue(data.PesoBruto);
    this.consultaNotaIngresoAlmacenFormEdit.controls["taraAlmacen"].setValue(data.Tara);
    this.consultaNotaIngresoAlmacenFormEdit.controls["kilosNetosAlmacen"].setValue(data.KilosNetos);
  }

    
    this.numeroNota = data.Numero;
    this.viewTagSeco = data.SubProductoId != "02" ? false : true;
    this.consultaNotaIngresoAlmacenFormEdit.controls["controlCalidad"].setValue(data.NumeroCalidadPlanta);
    this.consultaNotaIngresoAlmacenFormEdit.controls["numeroNotaIngreso"].setValue(data.Numero);
    this.fechaRegistro = this.dateUtil.formatDate(new Date(data.FechaRegistro), "/");
    this.responsable = data.UsuarioRegistro;
    this.usuario = data.UsuarioRegistro;
    this.consultaNotaIngresoAlmacenFormEdit.controls["almacen"].setValue(data.AlmacenId);
    this.consultaNotaIngresoAlmacenFormEdit.controls["guiaremision"].setValue(data.NumeroGuiaRemision);
    this.consultaNotaIngresoAlmacenFormEdit.controls["fecharemision"].setValue(formatDate(data.FechaGuiaRemision, 'yyyy-MM-dd', 'en'));

    this.consultaNotaIngresoAlmacenFormEdit.controls["fechaControlCalidad"].setValue(formatDate(data.FechaCalidad, 'yyyy-MM-dd', 'en'));
    this.consultaNotaIngresoAlmacenFormEdit.controls["fechaNotaIngreso"].setValue(formatDate(data.FechaGuiaRemision, 'yyyy-MM-dd', 'en'));
    this.consultaNotaIngresoAlmacenFormEdit.controls["tipoProduccion"].setValue(data.TipoProduccionId);
    this.consultaNotaIngresoAlmacenFormEdit.controls["rucOrganizacion"].setValue(data.RucEmpresaOrigen);
    this.consultaNotaIngresoAlmacenFormEdit.controls["razonSocialOrganizacion"].setValue(data.RazonSocialEmpresaOrigen);
    this.consultaNotaIngresoAlmacenFormEdit.controls["producto"].setValue(data.Producto);
    this.consultaNotaIngresoAlmacenFormEdit.controls["direccion"].setValue(data.DireccionEmpresaOrigen);
    await this.cargarSubProducto(data.ProductoId);

    this.consultaNotaIngresoAlmacenFormEdit.controls["subproducto"].setValue(data.SubProductoId);

    this.consultaNotaIngresoAlmacenFormEdit.controls.certificacion.setValue(data.CertificacionId.split('|').map(String));
    this.consultaNotaIngresoAlmacenFormEdit.controls["certificadora"].setValue(data.EntidadCertificadoraId);

    this.consultaNotaIngresoAlmacenFormEdit.controls["unidadMedidaDesc"].setValue(data.UnidadMedida);
    this.consultaNotaIngresoAlmacenFormEdit.controls["cantidad"].setValue(data.CantidadPesado);
    this.consultaNotaIngresoAlmacenFormEdit.controls["pesoBruto"].setValue(data.KilosBrutosPesado);
    this.consultaNotaIngresoAlmacenFormEdit.controls["calidad"].setValue(data.Calidad);
    this.consultaNotaIngresoAlmacenFormEdit.controls["tara"].setValue(data.TaraPesado);
    this.consultaNotaIngresoAlmacenFormEdit.controls['grado'].setValue(data.Grado);
    this.consultaNotaIngresoAlmacenFormEdit.controls['kilosNetos'].setValue(data.KilosNetosPesado);
    this.consultaNotaIngresoAlmacenFormEdit.controls['cantidadDefectos'].setValue(data.CantidadDefectos);
    this.consultaNotaIngresoAlmacenFormEdit.controls['rendimiento'].setValue(data.RendimientoPorcentajePesado);
    this.consultaNotaIngresoAlmacenFormEdit.controls['humedad'].setValue(data.HumedadPorcentajePesado);
    this.consultaNotaIngresoAlmacenFormEdit.controls['pesoxSaco'].setValue(data.PesoPorSaco);
    this.vSessionUser.Result.Data.DireccionEmpresa = data.Direccion;
    this.vSessionUser.Result.Data.RazonSocialEmpresa = data.RazonSocial;
    this.vSessionUser.Result.Data.RucEmpresa = data.Ruc;
    
    if (data.ProductoId == this.codigoCafeP)
    {
      this.viewCafeP = true;
      this.consultaNotaIngresoAlmacenFormEdit.controls['exportGramos'].setValue(data.ExportableGramosAnalisisFisico);
      this.consultaNotaIngresoAlmacenFormEdit.controls['exportPorcentaje'].setValue(data.ExportablePorcentajeAnalisisFisico);
      this.consultaNotaIngresoAlmacenFormEdit.controls['descarteGramos'].setValue(data.DescarteGramosAnalisisFisico);
      this.consultaNotaIngresoAlmacenFormEdit.controls['descartePorcentaje'].setValue(data.DescartePorcentajeAnalisisFisico);
      this.consultaNotaIngresoAlmacenFormEdit.controls['cascarillaGramos'].setValue(data.CascarillaGramosAnalisisFisico);
      this.consultaNotaIngresoAlmacenFormEdit.controls['cascarillaPorcentaje'].setValue(data.CascarillaPorcentajeAnalisisFisico);
      this.consultaNotaIngresoAlmacenFormEdit.controls['totalGramos'].setValue(data.TotalGramosAnalisisFisico);
      this.consultaNotaIngresoAlmacenFormEdit.controls['totalPorcentaje'].setValue(data.TotalPorcentajeAnalisisFisico);
      this.consultaNotaIngresoAlmacenFormEdit.controls['humedadAnalsisFisico'].setValue(data.HumedadPorcentajeAnalisisFisico);
      this.consultaNotaIngresoAlmacenFormEdit.controls['puntajeFinal'].setValue(data.TotalAnalisisSensorial);
    }
    this.consultaNotaIngresoAlmacenFormEdit.get('pesado').get("motivo").setValue(data.MotivoIngresoId);
    this.consultaNotaIngresoAlmacenFormEdit.get('pesado').get("empaque").setValue(data.EmpaqueId);
    this.consultaNotaIngresoAlmacenFormEdit.get('pesado').get("tipo").setValue(data.TipoId);
    this.consultaNotaIngresoAlmacenFormEdit.get('pesado').get("cantidad").setValue(data.Cantidad);
    this.consultaNotaIngresoAlmacenFormEdit.get('pesado').get("kilosBrutos").setValue(data.PesoBruto);
    this.consultaNotaIngresoAlmacenFormEdit.get('pesado').get("pesoSaco").setValue(data.PesoPorSaco);
    this.consultaNotaIngresoAlmacenFormEdit.get('pesado').get("calidad").setValue(data.CalidadId);
    this.consultaNotaIngresoAlmacenFormEdit.get('pesado').get("tara").setValue(data.Tara);
    this.consultaNotaIngresoAlmacenFormEdit.get('pesado').get("kilosNetos").setValue(data.KilosNetos);
    this.consultaNotaIngresoAlmacenFormEdit.get('pesado').get("grado").setValue(data.GradoId);
    this.consultaNotaIngresoAlmacenFormEdit.get('pesado').get("cantidadDefectos").setValue(data.CantidadDefectos);
    this.consultaNotaIngresoAlmacenFormEdit.get('pesado').get("porcentajeRendimiento").setValue(data.RendimientoPorcentaje);
    this.consultaNotaIngresoAlmacenFormEdit.get('pesado').get("porcentajeHumedad").setValue(data.HumedadPorcentaje);
    this.consultaNotaIngresoAlmacenFormEdit.get('pesado').get("transportista").setValue(data.RazonEmpresaTransporte);
    this.consultaNotaIngresoAlmacenFormEdit.get('pesado').get("ruc").setValue(data.RucEmpresaTransporte);
    this.consultaNotaIngresoAlmacenFormEdit.get('pesado').get("placaVehiculo").setValue(data.PlacaTractorEmpresaTransporte);
    this.consultaNotaIngresoAlmacenFormEdit.get('pesado').get("chofer").setValue(data.ConductorEmpresaTransporte);
    this.consultaNotaIngresoAlmacenFormEdit.get('pesado').get("numeroBrevete").setValue(data.LicenciaConductorEmpresaTransporte);
    this.consultaNotaIngresoAlmacenFormEdit.get('pesado').get("observacion").setValue(data.ObservacionPesado);
    this.consultaNotaIngresoAlmacenFormEdit.get('pesado').get("marca").setValue(data.Marca);
    

    await this.cargaTipo();
    await this.cargaEmpaque();
    this.consultaNotaIngresoAlmacenFormEdit.controls["tipo"].setValue(this.detalle.TipoId);
    this.consultaNotaIngresoAlmacenFormEdit.controls["empaque"].setValue(this.detalle.EmpaqueId);


    this.spinner.hide();
    this.modalService.dismissAll();
  }


  changeEmpaque(e) {
    this.calcularTara();
  }
  changeTipo(e) {
    this.calcularTara();
  }
  calcularTara() {
    var cantidad = this.consultaNotaIngresoAlmacenFormEdit.controls['cantidadAlmacen'].value;
    var empaque = this.consultaNotaIngresoAlmacenFormEdit.controls['empaque'].value;
    var tipo = this.consultaNotaIngresoAlmacenFormEdit.controls['tipo'].value;
    var valor = 0;
    if (empaque == this.CodigoSacao && tipo == this.CodigoTipoYute) {
      var valor = cantidad * this.taraYute;
    } else if (empaque == this.CodigoSacao && tipo != this.CodigoTipoYute) {
      var valor = cantidad * this.tara;
    }


    var valorRounded = Math.round((valor + Number.EPSILON) * 100) / 100
    this.consultaNotaIngresoAlmacenFormEdit.controls['taraAlmacen'].setValue(valorRounded);
    this.calcularKilosNetos();
  }
  calcularKilosNetos(){
    var tara = this.consultaNotaIngresoAlmacenFormEdit.controls['taraAlmacen'].value;
    var kilosBrutos = this.consultaNotaIngresoAlmacenFormEdit.controls['pesoBrutoAlmacen'].value;
    var valor = kilosBrutos - tara;
    var valorRounded = Math.round((valor + Number.EPSILON) * 100) / 100
    this.consultaNotaIngresoAlmacenFormEdit.controls['kilosNetosAlmacen'].setValue(valorRounded);
  }

  guardar() {
    const form = this;
    if (this.consultaNotaIngresoAlmacenFormEdit.invalid  ) {
      this.submittedEdit = true;
      return;
    } else {
      if(this.consultaNotaIngresoAlmacenFormEdit.controls['controlCalidad'].value){
        this.spinner.show(undefined,
          {
            type: 'ball-triangle-path',
            size: 'medium',
            bdColor: 'rgba(0, 0, 0, 0.8)',
            color: '#fff',
            fullScreen: true
          });
  
          this.alertUtil.alertRegistro('Confirmación', '¿Está seguro de continuar con el registro?.' , function (result) {
            if (result.isConfirmed) {
              if(form.id > 0){
                form.actualizarServiceFinal();
              }else{
                
                form.guardarService();
              }
             
            }else{
              form.spinner.hide();
            }
          });     
      }else{
        this.alertUtil.alertWarning('Validacion','debe buscar un control de calidad');
      }
    
    }
  }
  guardarService() {

    let obj = {
      'NotaIngresoAlmacenPlantaId': 0,
      'ControlCalidadPlantaId': this.controlCalidadPlantaId,
      'EmpresaId': this.vSessionUser.Result.Data.EmpresaId,
      'AlmacenId': this.consultaNotaIngresoAlmacenFormEdit.controls['almacen'].value,
      'Numero': this.consultaNotaIngresoAlmacenFormEdit.controls['numeroNotaIngreso'].value,
      'TipoId': this.consultaNotaIngresoAlmacenFormEdit.controls['tipo'].value,
      'EmpaqueId': this.consultaNotaIngresoAlmacenFormEdit.controls['empaque'].value,
      'Cantidad': this.consultaNotaIngresoAlmacenFormEdit.controls['cantidadAlmacen'].value,
      'PesoBruto': this.consultaNotaIngresoAlmacenFormEdit.controls['pesoBrutoAlmacen'].value,
      'Tara': this.consultaNotaIngresoAlmacenFormEdit.controls['taraAlmacen'].value,
      'KilosNetos': this.consultaNotaIngresoAlmacenFormEdit.controls['kilosNetosAlmacen'].value,
      'Usuario': this.vSessionUser.Result.Data.NombreUsuario
    };
    this.notaIngresoAlmacenPlantaService.registrar(obj)
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            var form = this;
            this.alertUtil.alertOkCallback('Registrado!', 'Ingreso Almacén Registrado.', function (result) {
              //if(result.isConfirmed){
              form.router.navigate(['/planta/operaciones/notaingresoalmacen-list']);
              //}
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

  actualizarServiceFinal() {

    let obj = {
      'NotaIngresoAlmacenPlantaId': this.id,
      'ControlCalidadPlantaId': this.controlCalidadPlantaId,
      'AlmacenId': this.consultaNotaIngresoAlmacenFormEdit.controls['almacen'].value,
      'TipoId': this.consultaNotaIngresoAlmacenFormEdit.controls['tipo'].value,
      'EmpaqueId': this.consultaNotaIngresoAlmacenFormEdit.controls['empaque'].value,
      'Cantidad': this.consultaNotaIngresoAlmacenFormEdit.controls['cantidadAlmacen'].value,
      'PesoBruto': this.consultaNotaIngresoAlmacenFormEdit.controls['pesoBrutoAlmacen'].value,
      'Tara': this.consultaNotaIngresoAlmacenFormEdit.controls['taraAlmacen'].value,
      'KilosNetos': this.consultaNotaIngresoAlmacenFormEdit.controls['kilosNetosAlmacen'].value,
      'Usuario': this.vSessionUser.Result.Data.NombreUsuario,
      'EstadoId': '01'
    };
    this.notaIngresoAlmacenPlantaService.actualizarFinal(obj)
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            var form = this;
            this.alertUtil.alertOkCallback('Actualizado!', 'Ingreso Almacén Actualizado.', function (result) {
              //if(result.isConfirmed){
              form.router.navigate(['/planta/operaciones/notaingresoalmacen-list']);
              //}
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


  actualizarService() {

    this.notaIngresoAlmacenPlantaService.actualizar(Number(this.id), this.usuario, this.consultaNotaIngresoAlmacenFormEdit.controls["almacen"].value)
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            var form = this;
            this.alertUtil.alertOkCallback('Actualizado!', 'Ingreso Almacén Actualizado.', function (result) {
              //if(result.isConfirmed){
              form.router.navigate(['/planta/operaciones/notaingresoalmacen-list']);
              //}
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
    this.router.navigate(['/planta/operaciones/notaingresoalmacen-list']);
  }
}