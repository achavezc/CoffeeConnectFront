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
  }




  get fedit() {
    return this.consultaNotaIngresoProductoAlmacenFormEdit.controls;
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
    this.consultaNotaIngresoProductoAlmacenFormEdit.controls["estadoCalidad"] = data.EstadoCalidadId;
    if( data.EstadoCalidadId == "02" && this.id == 0){
      this.consultaNotaIngresoProductoAlmacenFormEdit.controls["cantidadAlmacen"].setValue(data.CantidadControlCalidad);
      this.consultaNotaIngresoProductoAlmacenFormEdit.controls["pesoBrutoAlmacen"].setValue(data.PesoBrutoControlCalidad);
      this.consultaNotaIngresoProductoAlmacenFormEdit.controls["taraAlmacen"].setValue(data.TaraControlCalidad);
      this.consultaNotaIngresoProductoAlmacenFormEdit.controls["kilosNetosAlmacen"].setValue(data.KilosNetosControlCalidad);

      this.consultaNotaIngresoProductoAlmacenFormEdit.get("cantidadAlmacen").disable();
      this.consultaNotaIngresoProductoAlmacenFormEdit.get("pesoBrutoAlmacen").disable();
      
    }else if( data.EstadoCalidadId == "01" && this.id == 0){
      this.consultaNotaIngresoProductoAlmacenFormEdit.controls["cantidadAlmacen"].setValue("");
      this.consultaNotaIngresoProductoAlmacenFormEdit.controls["pesoBrutoAlmacen"].setValue("");
      this.consultaNotaIngresoProductoAlmacenFormEdit.controls["taraAlmacen"].setValue("");
      this.consultaNotaIngresoProductoAlmacenFormEdit.controls["kilosNetosAlmacen"].setValue("");
      this.consultaNotaIngresoProductoAlmacenFormEdit.get("cantidadAlmacen").enable();
      this.consultaNotaIngresoProductoAlmacenFormEdit.get("pesoBrutoAlmacen").enable()
      this.calcularTara();
    }
  if(this.id > 0){
    this.consultaNotaIngresoProductoAlmacenFormEdit.controls["cantidadAlmacen"].setValue(data.Cantidad);
    this.consultaNotaIngresoProductoAlmacenFormEdit.controls["pesoBrutoAlmacen"].setValue(data.PesoBruto);
    this.consultaNotaIngresoProductoAlmacenFormEdit.controls["taraAlmacen"].setValue(data.Tara);
    this.consultaNotaIngresoProductoAlmacenFormEdit.controls["kilosNetosAlmacen"].setValue(data.KilosNetos);
  }

    
    this.numeroNota = data.Numero;
    this.viewTagSeco = data.SubProductoId != "02" ? false : true;
    this.consultaNotaIngresoProductoAlmacenFormEdit.controls["controlCalidad"].setValue(data.NumeroCalidadPlanta);
    this.consultaNotaIngresoProductoAlmacenFormEdit.controls["numeroNotaIngreso"].setValue(data.Numero);
    this.fechaRegistro = this.dateUtil.formatDate(new Date(data.FechaRegistro), "/");
    this.responsable = data.UsuarioRegistro;
    this.usuario = data.UsuarioRegistro;
    this.consultaNotaIngresoProductoAlmacenFormEdit.controls["almacen"].setValue(data.AlmacenId);
    this.consultaNotaIngresoProductoAlmacenFormEdit.controls["guiaremision"].setValue(data.NumeroGuiaRemision);
    this.consultaNotaIngresoProductoAlmacenFormEdit.controls["fecharemision"].setValue(formatDate(data.FechaGuiaRemision, 'yyyy-MM-dd', 'en'));

    this.consultaNotaIngresoProductoAlmacenFormEdit.controls["fechaControlCalidad"].setValue(formatDate(data.FechaCalidad, 'yyyy-MM-dd', 'en'));
    this.consultaNotaIngresoProductoAlmacenFormEdit.controls["fechaNotaIngreso"].setValue(formatDate(data.FechaGuiaRemision, 'yyyy-MM-dd', 'en'));
    this.consultaNotaIngresoProductoAlmacenFormEdit.controls["tipoProduccion"].setValue(data.TipoProduccionId);
    this.consultaNotaIngresoProductoAlmacenFormEdit.controls["rucOrganizacion"].setValue(data.RucOrganizacion);
    this.consultaNotaIngresoProductoAlmacenFormEdit.controls["razonSocialOrganizacion"].setValue(data.RazonSocialOrganizacion);
    this.consultaNotaIngresoProductoAlmacenFormEdit.controls["producto"].setValue(data.Producto);
    this.consultaNotaIngresoProductoAlmacenFormEdit.controls["direccion"].setValue(data.Direccion);
    await this.cargarSubProducto(data.ProductoId);

    this.consultaNotaIngresoProductoAlmacenFormEdit.controls["subproducto"].setValue(data.SubProductoId);

    this.consultaNotaIngresoProductoAlmacenFormEdit.controls.certificacion.setValue(data.CertificacionId.split('|').map(String));
    this.consultaNotaIngresoProductoAlmacenFormEdit.controls["certificadora"].setValue(data.EntidadCertificadoraId);

    this.consultaNotaIngresoProductoAlmacenFormEdit.controls["unidadMedidaDesc"].setValue(data.UnidadMedida);
    this.consultaNotaIngresoProductoAlmacenFormEdit.controls["cantidad"].setValue(data.CantidadPesado);
    this.consultaNotaIngresoProductoAlmacenFormEdit.controls["pesoBruto"].setValue(data.KilosBrutosPesado);
    this.consultaNotaIngresoProductoAlmacenFormEdit.controls["calidad"].setValue(data.Calidad);
    this.consultaNotaIngresoProductoAlmacenFormEdit.controls["tara"].setValue(data.TaraPesado);
    this.consultaNotaIngresoProductoAlmacenFormEdit.controls['grado'].setValue(data.Grado);
    this.consultaNotaIngresoProductoAlmacenFormEdit.controls['kilosNetos'].setValue(data.KilosNetosPesado);
    this.consultaNotaIngresoProductoAlmacenFormEdit.controls['cantidadDefectos'].setValue(data.CantidadDefectos);
    this.consultaNotaIngresoProductoAlmacenFormEdit.controls['rendimiento'].setValue(data.RendimientoPorcentajePesado);
    this.consultaNotaIngresoProductoAlmacenFormEdit.controls['humedad'].setValue(data.HumedadPorcentajePesado);
    this.consultaNotaIngresoProductoAlmacenFormEdit.controls['pesoxSaco'].setValue(data.PesoPorSaco);
    this.vSessionUser.Result.Data.DireccionEmpresa = data.RazonSocialOrganizacion;
    this.vSessionUser.Result.Data.RucEmpresa = data.RucOrganizacion;
    
    if (data.ProductoId == this.codigoCafeP)
    {
      this.viewCafeP = true;
      this.consultaNotaIngresoProductoAlmacenFormEdit.controls['exportGramos'].setValue(data.ExportableGramosAnalisisFisico);
      this.consultaNotaIngresoProductoAlmacenFormEdit.controls['exportPorcentaje'].setValue(data.ExportablePorcentajeAnalisisFisico);
      this.consultaNotaIngresoProductoAlmacenFormEdit.controls['descarteGramos'].setValue(data.DescarteGramosAnalisisFisico);
      this.consultaNotaIngresoProductoAlmacenFormEdit.controls['descartePorcentaje'].setValue(data.DescartePorcentajeAnalisisFisico);
      this.consultaNotaIngresoProductoAlmacenFormEdit.controls['cascarillaGramos'].setValue(data.CascarillaGramosAnalisisFisico);
      this.consultaNotaIngresoProductoAlmacenFormEdit.controls['cascarillaPorcentaje'].setValue(data.CascarillaPorcentajeAnalisisFisico);
      this.consultaNotaIngresoProductoAlmacenFormEdit.controls['totalGramos'].setValue(data.TotalGramosAnalisisFisico);
      this.consultaNotaIngresoProductoAlmacenFormEdit.controls['totalPorcentaje'].setValue(data.TotalPorcentajeAnalisisFisico);
      this.consultaNotaIngresoProductoAlmacenFormEdit.controls['humedadAnalsisFisico'].setValue(data.HumedadPorcentajeAnalisisFisico);
      this.consultaNotaIngresoProductoAlmacenFormEdit.controls['puntajeFinal'].setValue(data.TotalAnalisisSensorial);
    }
    this.consultaNotaIngresoProductoAlmacenFormEdit.get('pesado').get("motivo").setValue(data.MotivoIngresoId);
    this.consultaNotaIngresoProductoAlmacenFormEdit.get('pesado').get("empaque").setValue(data.EmpaqueId);
    this.consultaNotaIngresoProductoAlmacenFormEdit.get('pesado').get("tipo").setValue(data.TipoId);
    this.consultaNotaIngresoProductoAlmacenFormEdit.get('pesado').get("cantidad").setValue(data.Cantidad);
    this.consultaNotaIngresoProductoAlmacenFormEdit.get('pesado').get("kilosBrutos").setValue(data.KilosBrutos);
    this.consultaNotaIngresoProductoAlmacenFormEdit.get('pesado').get("pesoSaco").setValue(data.PesoPorSaco);
    this.consultaNotaIngresoProductoAlmacenFormEdit.get('pesado').get("calidad").setValue(data.CalidadId);
    this.consultaNotaIngresoProductoAlmacenFormEdit.get('pesado').get("tara").setValue(data.Tara);
    this.consultaNotaIngresoProductoAlmacenFormEdit.get('pesado').get("kilosNetos").setValue(data.KilosNetos);
    this.consultaNotaIngresoProductoAlmacenFormEdit.get('pesado').get("grado").setValue(data.GradoId);
    this.consultaNotaIngresoProductoAlmacenFormEdit.get('pesado').get("cantidadDefectos").setValue(data.CantidadDefectos);
    this.consultaNotaIngresoProductoAlmacenFormEdit.get('pesado').get("porcentajeRendimiento").setValue(data.RendimientoPorcentaje);
    this.consultaNotaIngresoProductoAlmacenFormEdit.get('pesado').get("porcentajeHumedad").setValue(data.HumedadPorcentaje);
    this.consultaNotaIngresoProductoAlmacenFormEdit.get('pesado').get("transportista").setValue(data.RazonEmpresaTransporte);
    this.consultaNotaIngresoProductoAlmacenFormEdit.get('pesado').get("ruc").setValue(data.RucEmpresaTransporte);
    this.consultaNotaIngresoProductoAlmacenFormEdit.get('pesado').get("placaVehiculo").setValue(data.PlacaTractorEmpresaTransporte);
    this.consultaNotaIngresoProductoAlmacenFormEdit.get('pesado').get("chofer").setValue(data.ConductorEmpresaTransporte);
    this.consultaNotaIngresoProductoAlmacenFormEdit.get('pesado').get("numeroBrevete").setValue(data.LicenciaConductorEmpresaTransporte);
    this.consultaNotaIngresoProductoAlmacenFormEdit.get('pesado').get("observacion").setValue(data.ObservacionPesado);
    this.consultaNotaIngresoProductoAlmacenFormEdit.get('pesado').get("marca").setValue(data.Marca);
    

    await this.cargaTipo();
    await this.cargaEmpaque();
    this.consultaNotaIngresoProductoAlmacenFormEdit.controls["tipo"].setValue(this.detalle.TipoId);
    this.consultaNotaIngresoProductoAlmacenFormEdit.controls["empaque"].setValue(this.detalle.EmpaqueId);


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
    var cantidad = this.consultaNotaIngresoProductoAlmacenFormEdit.controls['cantidadAlmacen'].value;
    var empaque = this.consultaNotaIngresoProductoAlmacenFormEdit.controls['empaque'].value;
    var tipo = this.consultaNotaIngresoProductoAlmacenFormEdit.controls['tipo'].value;
    var valor = 0;
    if (empaque == this.CodigoSacao && tipo == this.CodigoTipoYute) {
      var valor = cantidad * this.taraYute;
    } else if (empaque == this.CodigoSacao && tipo != this.CodigoTipoYute) {
      var valor = cantidad * this.tara;
    }


    var valorRounded = Math.round((valor + Number.EPSILON) * 100) / 100
    this.consultaNotaIngresoProductoAlmacenFormEdit.controls['taraAlmacen'].setValue(valorRounded);
    this.calcularKilosNetos();
  }
  calcularKilosNetos(){
    var tara = this.consultaNotaIngresoProductoAlmacenFormEdit.controls['taraAlmacen'].value;
    var kilosBrutos = this.consultaNotaIngresoProductoAlmacenFormEdit.controls['pesoBrutoAlmacen'].value;
    var valor = kilosBrutos - tara;
    var valorRounded = Math.round((valor + Number.EPSILON) * 100) / 100
    this.consultaNotaIngresoProductoAlmacenFormEdit.controls['kilosNetosAlmacen'].setValue(valorRounded);
  }

  guardar() {
    const form = this;
    if (this.consultaNotaIngresoProductoAlmacenFormEdit.invalid  ) {
      this.submittedEdit = true;
      return;
    } else {
      if(this.consultaNotaIngresoProductoAlmacenFormEdit.controls['controlCalidad'].value){
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
      'AlmacenId': this.consultaNotaIngresoProductoAlmacenFormEdit.controls['almacen'].value,
      'Numero': this.consultaNotaIngresoProductoAlmacenFormEdit.controls['numeroNotaIngreso'].value,
      'TipoId': this.consultaNotaIngresoProductoAlmacenFormEdit.controls['tipo'].value,
      'EmpaqueId': this.consultaNotaIngresoProductoAlmacenFormEdit.controls['empaque'].value,
      'Cantidad': this.consultaNotaIngresoProductoAlmacenFormEdit.controls['cantidadAlmacen'].value,
      'PesoBruto': this.consultaNotaIngresoProductoAlmacenFormEdit.controls['pesoBrutoAlmacen'].value,
      'Tara': this.consultaNotaIngresoProductoAlmacenFormEdit.controls['taraAlmacen'].value,
      'KilosNetos': this.consultaNotaIngresoProductoAlmacenFormEdit.controls['kilosNetosAlmacen'].value,
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
      'AlmacenId': this.consultaNotaIngresoProductoAlmacenFormEdit.controls['almacen'].value,
      'TipoId': this.consultaNotaIngresoProductoAlmacenFormEdit.controls['tipo'].value,
      'EmpaqueId': this.consultaNotaIngresoProductoAlmacenFormEdit.controls['empaque'].value,
      'Cantidad': this.consultaNotaIngresoProductoAlmacenFormEdit.controls['cantidadAlmacen'].value,
      'PesoBruto': this.consultaNotaIngresoProductoAlmacenFormEdit.controls['pesoBrutoAlmacen'].value,
      'Tara': this.consultaNotaIngresoProductoAlmacenFormEdit.controls['taraAlmacen'].value,
      'KilosNetos': this.consultaNotaIngresoProductoAlmacenFormEdit.controls['kilosNetosAlmacen'].value,
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

    this.notaIngresoAlmacenPlantaService.actualizar(Number(this.id), this.usuario, this.consultaNotaIngresoProductoAlmacenFormEdit.controls["almacen"].value)
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