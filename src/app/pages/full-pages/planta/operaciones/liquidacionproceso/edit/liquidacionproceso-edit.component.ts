import { Component, OnInit, ViewEncapsulation, Input, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent, ColumnMode } from "@swimlane/ngx-datatable";
import { MaestroService } from '../../../../../../services/maestro.service';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn, FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";
import { ILogin } from '../../../../../../services/models/login';
import { AlertUtil } from '../../../../../../services/util/alert-util';
import { Router } from "@angular/router";
import { ActivatedRoute } from '@angular/router';
import { DateUtil } from '../../../../../../services/util/date-util';
import { EmpresaService } from '../../../../../../services/empresa.service';
import { ReqLiquidacionProceso, LiquidacionProcesoPlantaDetalle, LiquidacionProcesoPlantaResultado } from '../../../../../../services/models/req-liquidacion-proceso';
import { host } from '../../../../../../shared/hosts/main.host';
import { MaestroUtil } from '../../../../../../services/util/maestro-util';
import { OrdenProcesoServicePlanta } from '../../../../../../Services/orden-proceso-planta.service';
import { LiquidacionProcesoPlantaService } from '../../../../../../services/liquidacionproceso-planta.service';
import {AuthService} from './../../../../../../services/auth.service';


@Component({
  selector: 'app-liquidacionproceso-edit',
  templateUrl: './liquidacionproceso-edit.component.html',
  styleUrls: ['./liquidacionproceso-edit.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LiquidacionProcesoEditComponent implements OnInit {

  @ViewChild('vform') validationForm: FormGroup;
  @Input() name;
  submitted = false;
  submittedE = false;
  submittedEdit = false;
  closeResult: string;
  liquidacionProcesoFormEdit: FormGroup;
  formGroupSacos: FormGroup;
  formGroupKg: FormGroup;
  formGroupKilosNetos: FormGroup;
  formGroupPorcentaje: FormGroup;
  formGroupQqkg: FormGroup;
  formGroupTipoEmpaque: FormGroup;
  formGroupEmpaque: FormGroup;
  errorGeneral: any = { isError: false, errorMessage: '' };
  errorEmpresa: any = { isError: false, errorMessage: '' };
  mensajeErrorGenerico = "Ocurrio un error interno.";
  popupModel;
  listaDetalleEmpaque: any[];
  listaDetalleTipoEmpaque: any[];
  vSessionUser: any;
  private tempDataResultProceso = [];
  public rowsResultProceso = [];
  public rows = [];
  rowsMateriaPrima = [];
  tempMateriaPrima = [];
  listMateriaPrima = [];
  public ColumnMode = ColumnMode;
  public limitRef = 20;
  numero = "";
  esEdit = false;
  id: Number = 0;
  fechaRegistro: any;
  responsable: "";
  TipoId = "";
  EmpaqueId = "";
  CertificacionId = "";
  
  listResultProceso = [];
  popUp = true;
  sumKilosNetos: any =0;
  readonly: boolean;
  CodigoSaco = "01";
  CodigoTipoYute = "01";
  kilos = 7;
  tara = 0.2;
  taraYute = 0.7
  selectedDetalleTipoEmpaque : any[];
  selectedDetalleEmpaque: any[];

  @ViewChild(DatatableComponent) tblResultProceso: DatatableComponent;

  constructor(private modalService: NgbModal, private maestroService: MaestroService,
    private alertUtil: AlertUtil,
    private router: Router,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private dateUtil: DateUtil,
    private empresaService: EmpresaService,
    private maestroUtil: MaestroUtil,
    private ordenProcesoService: OrdenProcesoServicePlanta,
    private liquidacionProcesoPlantaService: LiquidacionProcesoPlantaService,
    private authService : AuthService
  ) {

  }

  async ngOnInit() {
    this.vSessionUser = JSON.parse(localStorage.getItem("user"));
    this.cargarForm();
    await this.Load();
    this.route.queryParams
      .subscribe(params => {
        if (Number(params.id)) {
          this.id = Number(params.id);
          this.esEdit = true;
          this.obtenerDetalle();
        }
      }
      );
      this.readonly= this.authService.esReadOnly(this.vSessionUser.Result.Data.OpcionesEscritura, this.liquidacionProcesoFormEdit);
  }


  obtenerDetalle() {
    this.spinner.show();
    this.liquidacionProcesoPlantaService.ConsultaPorId(Number(this.id), Number(this.vSessionUser.Result.Data.EmpresaId))
      .subscribe(res => {

        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            this.cargarDataFormulario(res.Result.Data);
            // this.child.cargarDatos(res.Result.Data.Detalle);
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

  get fns() {
    return this.liquidacionProcesoFormEdit.controls;
  }
  cargarForm() {
    this.liquidacionProcesoFormEdit = this.fb.group(
      {
        tipoProceso: new FormControl('', []),
        ruc: new FormControl('', []),
        tipoProduccion: ['', []],
        producto: new FormControl('', []),
        productoTerminado: new FormControl('', []),
        subproducto: new FormControl('', []),
        numOrdenProceso: new FormControl('', [Validators.required]),
        razonSocial: new FormControl('', []),
        certificacion: new FormControl('', []),
        certificadora: new FormControl('', []),
        ordenProcesoPlantaId: new FormControl('', []),
        totalSacos: new FormControl('', []),
        totalKg: new FormControl('', []),
        totalKilosNetos: new FormControl('', []),
        totalPorcentaje: new FormControl('', []),
        totalQqkg: new FormControl('', []),
        observacion: new FormControl('', []),
        envases: new FormControl('', []),
        trabajos: new FormControl('', []),
        numDefectos: new FormControl('', []),
        fechaInicioProceso: [],
        fechaFinProceso: [],
        totalKilosNetosNotas: new FormControl('', [])
      });
  }
  async Load() {
    var form = this;
   await this.maestroUtil.obtenerMaestros('TiposCafeProcesado', (res: any) => {
      if (res.Result.Success) {
        this.listResultProceso = res.Result.Data;
        this.tempDataResultProceso = this.listResultProceso;
        this.rowsResultProceso = [... this.tempDataResultProceso];
        let groupsSacos = {}
        let groupKg = {}
        let groupKilosNetos = {}
        let groupPorcentaje = {}
        let groupQqkg = {}
        let groupTipoEmpaque = {}
        let groupEmpaque = {}
        let selectpEmpaque = []
        let selectedtipoempaque = []
        this.listResultProceso.forEach(input_template => {
          groupsSacos[input_template.Codigo + '%sacos'] = new FormControl('', []);
          groupKg[input_template.Codigo + '%Kg'] = new FormControl('', []);
          groupKilosNetos[input_template.Codigo + '%kilosNetos'] = new FormControl('', []);
          groupPorcentaje[input_template.Codigo + '%porcentaje'] = new FormControl('', []);
          groupQqkg[input_template.Codigo + '%qqkg'] = new FormControl('', []);
          groupTipoEmpaque[input_template.Codigo + '%tipoempaque'] = new FormControl('',[]);
          groupEmpaque[input_template.Codigo + '%empaque'] = new FormControl('',[]);
          selectpEmpaque[input_template.Codigo + '%selectedempaque'];
          selectedtipoempaque[input_template.Codigo + '%selectedtipoempaque'];
        })
        this.formGroupSacos = new FormGroup(groupsSacos);
        this.formGroupKg = new FormGroup(groupKg);
        this.formGroupKilosNetos = new FormGroup(groupKilosNetos)
        this.formGroupPorcentaje = new FormGroup(groupPorcentaje);
        this.formGroupQqkg = new FormGroup(groupQqkg);
        this.formGroupTipoEmpaque = new FormGroup(groupTipoEmpaque);
        this.formGroupEmpaque = new FormGroup(groupEmpaque);
        this.selectedDetalleEmpaque = selectpEmpaque;
        this.selectedDetalleTipoEmpaque = selectedtipoempaque;
      }
    });
    var res = await this.maestroService.obtenerMaestros("Empaque").toPromise();
      if (res.Result.Success) {
        form.listaDetalleEmpaque = res.Result.Data;
      }
    var res2 = await this.maestroService.obtenerMaestros("TipoEmpaque").toPromise();
      if (res2.Result.Success) {
        form.listaDetalleTipoEmpaque = res.Result.Data;
      }
  }

  cargarDataFormulario(data: any) {
    this.liquidacionProcesoFormEdit.controls["tipoProceso"].setValue(data.TipoProceso);
    this.liquidacionProcesoFormEdit.controls["ruc"].setValue(data.RucOrganizacion);
    this.liquidacionProcesoFormEdit.controls["tipoProduccion"].setValue(data.TipoProduccion);
    this.liquidacionProcesoFormEdit.controls["producto"].setValue(data.Producto);
    this.liquidacionProcesoFormEdit.controls["productoTerminado"].setValue(data.ProductoTerminado);
    this.liquidacionProcesoFormEdit.controls["fechaInicioProceso"].setValue(this.dateUtil.formatDate(data.FechaInicioProceso));
    this.liquidacionProcesoFormEdit.controls["fechaFinProceso"].setValue(this.dateUtil.formatDate(data.FechaFinProceso));
    this.liquidacionProcesoFormEdit.controls["numOrdenProceso"].setValue(data.NumeroOrdenProcesoPlanta);
    this.liquidacionProcesoFormEdit.controls["razonSocial"].setValue(data.RazonSocialOrganizacion);
    this.liquidacionProcesoFormEdit.controls["certificacion"].setValue(data.Certificacion);
    this.liquidacionProcesoFormEdit.controls["certificadora"].setValue(data.EntidadCertificadora);
    this.liquidacionProcesoFormEdit.controls["ordenProcesoPlantaId"].setValue(data.OrdenProcesoPlantaId);
    this.liquidacionProcesoFormEdit.controls["observacion"].setValue(data.Observacion);
    this.liquidacionProcesoFormEdit.controls["envases"].setValue(data.EnvasesProductos);
    this.liquidacionProcesoFormEdit.controls["trabajos"].setValue(data.TrabajosRealizados);
    this.liquidacionProcesoFormEdit.controls["numDefectos"].setValue(data.NumeroDefectos);
    this.EmpaqueId = data.EmpaqueId;
    this.TipoId = data.TipoId;
    this.liquidacionProcesoFormEdit.controls["envases"].disable() 

    this.numero = data.Numero;

    data.Resultado.forEach(
      x => {
        this.formGroupSacos.get(x.ReferenciaId + '%sacos').setValue(x.CantidadSacos == 0 ? "": x.CantidadSacos);
        this.formGroupKg.get(x.ReferenciaId + '%Kg').setValue(x.KGN ==0 ? "": x.KGN);
        this.formGroupEmpaque.get(x.ReferenciaId + '%empaque').setValue(x.EmpaqueId == ""? null: x.EmpaqueId);
        this.formGroupTipoEmpaque.get(x.ReferenciaId + '%tipoempaque').setValue(x.TipoId == ""? null: x.TipoId);
      }
    );
    
    data.Detalle.forEach(
      x => {
        var valorRounded = Math.round((x.KilosNetos + Number.EPSILON) * 100) / 100
        x.KilosNetos = valorRounded
        
      }
    );
    this.listMateriaPrima = data.Detalle;
    this.tempMateriaPrima = data.Detalle;
    this.rowsMateriaPrima = [...this.tempMateriaPrima];
    this.calcularKilosNetosNotas();
    this.calcularKilosNetos();
    this.fechaRegistro = this.dateUtil.formatDate(new Date(data.FechaRegistro), "/");
    this.responsable = data.UsuarioRegistro;
    this.spinner.hide();

  }

  

  openModal(modalOrdenProceso) {
    this.modalService.open(modalOrdenProceso, { windowClass: 'dark-modal', size: 'xl' });

  }

  calcularKilosNetos() {
    this.rowsResultProceso.forEach(x => {
      var valueSacos = this.formGroupSacos.get(x.Codigo + '%sacos').value;
      var kg = this.formGroupKg.get(x.Codigo + '%Kg').value;
      var kilosNetos = Number(valueSacos) * 69 + Number(kg);
      this.formGroupKilosNetos.get(x.Codigo + '%kilosNetos').setValue(kilosNetos == 0 ? "" : kilosNetos);
      var qqKg = kilosNetos / 46;
      this.formGroupQqkg.get(x.Codigo + '%qqkg').setValue(qqKg == 0 ? "" : qqKg.toFixed(2));
    });
    this.calcularCascarilla();
    this.calcularPorcentaje();
    

  }

  calcularCascarilla()
  {
    var totalKilosNetos = Number(this.calcularTotalKilosNetosSCascarilla());
    //var kilosNetos = Number(this.formGroupKilosNetos.get('14%kilosNetos').value);
    var cascarilla = this.sumKilosNetos - totalKilosNetos;
     this.formGroupKilosNetos.controls["14%kilosNetos"].setValue(cascarilla.toFixed(2));
     //var porcentajeKilosNetos = (kilosNetos / totalKilosNetos) * 100;
    // this.formGroupPorcentaje.get('14%porcentaje').setValue(porcentajeKilosNetos == 0 ? "" : porcentajeKilosNetos.toFixed(2));
     //this.calcularTotalPorcentaje();
  }
  calcularTotalKilosNetosSCascarilla() {
    var totalKilosNetos = 0;
    this.rowsResultProceso.forEach(x => {
      if(x.Codigo != '14')
      {
      totalKilosNetos = totalKilosNetos + Number(this.formGroupKilosNetos.get(x.Codigo + '%kilosNetos').value);
      }
    });
    this.liquidacionProcesoFormEdit.get('totalKilosNetos').setValue(totalKilosNetos);
    return totalKilosNetos;
  }
  calcularTotalKilosNetos() {
    var totalKilosNetos = 0;
    this.rowsResultProceso.forEach(x => {
      totalKilosNetos = totalKilosNetos + Number(this.formGroupKilosNetos.get(x.Codigo + '%kilosNetos').value);
    });
    this.liquidacionProcesoFormEdit.get('totalKilosNetos').setValue(totalKilosNetos);
    return totalKilosNetos;
  }

  calcularPorcentaje() {
    var totalKilosNetos = this.calcularTotalKilosNetos();
    this.rowsResultProceso.forEach(x => {
      var kilosNetos = Number(this.formGroupKilosNetos.get(x.Codigo + '%kilosNetos').value);
      var porcentajeKilosNetos = (kilosNetos / totalKilosNetos) * 100;
      this.formGroupPorcentaje.get(x.Codigo + '%porcentaje').setValue(porcentajeKilosNetos == 0 ? "" : porcentajeKilosNetos.toFixed(2));
    });
    this.calcularTotalPorcentaje();
  }

  calcularTotalPorcentaje() {
    var totalPorcentaje = 0;
    this.rowsResultProceso.forEach(x => {
      totalPorcentaje = totalPorcentaje + Number(this.formGroupPorcentaje.get(x.Codigo + '%porcentaje').value);
    });
    this.liquidacionProcesoFormEdit.get('totalPorcentaje').setValue(isNaN(totalPorcentaje) ? 0 : Math.round(totalPorcentaje));
  }

  

  get fedit() {
    return this.liquidacionProcesoFormEdit.controls;
  }

  cancelar() {
    this.router.navigate(['/planta/operaciones/liquidacionproceso-list']);
  }

  

  guardar() {
    const form = this;
    if (this.liquidacionProcesoFormEdit.invalid || this.errorGeneral.isError) {
      this.submittedEdit = true;
      return;
    } else {

      debugger
      let liquidacionProcesoPlantaResultado: LiquidacionProcesoPlantaResultado[] = [];
      this.rowsResultProceso.forEach(x => {

        var cantidad = Number(this.formGroupSacos.get(x.Codigo + '%sacos').value);
        var empaque = this.EmpaqueId;
        var tipo = this.TipoId;
        var valor = 0;
        if (empaque == this.CodigoSaco && tipo == this.CodigoTipoYute) {
          var valor = cantidad * this.taraYute;
        } else if (empaque == this.CodigoSaco && tipo != this.CodigoTipoYute) {
          var valor = cantidad * this.tara;
        }
    
    
        var tara = Math.round((valor + Number.EPSILON) * 100) / 100
        
        var kilosNetos = Number(this.formGroupKilosNetos.get(x.Codigo + '%kilosNetos').value) ;
        
        var kilosBrutos = Math.round((kilosNetos + tara + Number.EPSILON) * 100) / 100

        var tipoId = this.formGroupTipoEmpaque.get(x.Codigo + '%tipoempaque').value;
        var empaqueId = this.formGroupEmpaque.get(x.Codigo + '%empaque').value;

        let objectResultProceso = new LiquidacionProcesoPlantaResultado(
          x.Codigo,
          cantidad,
          Number(this.formGroupKg.get(x.Codigo + '%Kg').value),
          kilosNetos,
          kilosBrutos,
          tara,
          tipoId,
          empaqueId

        );
        liquidacionProcesoPlantaResultado.push(objectResultProceso);
      }
      );
      let liquidacionProcesoPlantaDetalle: LiquidacionProcesoPlantaDetalle[] = [];
      this.listMateriaPrima.forEach(x => {
        let ObjectProcesoPlantaDetalle = new LiquidacionProcesoPlantaDetalle(
          x.NotaIngresoAlmacenPlantaId,x.Descripcion,x.PorcentajeHumedad,x.Cantidad,x.KilosNetos,0,0
        );
        liquidacionProcesoPlantaDetalle.push(ObjectProcesoPlantaDetalle);
      });

      let request = new ReqLiquidacionProceso(
        Number(this.id),
        this.liquidacionProcesoFormEdit.get("ordenProcesoPlantaId").value,
        this.numero,
        this.vSessionUser.Result.Data.EmpresaId,
        this.liquidacionProcesoFormEdit.get("observacion").value,
        this.liquidacionProcesoFormEdit.get("envases").value,
        this.CertificacionId,
        this.liquidacionProcesoFormEdit.get("trabajos").value,
        '01',
        this.vSessionUser.Result.Data.NombreUsuario,
        liquidacionProcesoPlantaDetalle,
        liquidacionProcesoPlantaResultado,
        Number(this.liquidacionProcesoFormEdit.get("numDefectos").value)

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

        this.alertUtil.alertRegistro('Confirmación', '¿Está seguro de continuar con la actualización?.', function (result) {
          if (result.isConfirmed) {
            form.actualizarLiquidacionProcesoService(request);
          }
        });

      } else {
        this.alertUtil.alertRegistro('Confirmación', '¿Está seguro de continuar con el registro?.', function (result) {
          if (result.isConfirmed) {
            form.registrarLiquidacionProcesoService(request);
          }
        });

      }


    }
  }

  registrarLiquidacionProcesoService(request: ReqLiquidacionProceso) {
   debugger
    this.liquidacionProcesoPlantaService.Registrar(request)
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            var form = this;
            this.alertUtil.alertOkCallback('Registrado!', 'Liquidacion Proceso', function (result) {
              if (result.isConfirmed) {
                form.router.navigate(['/planta/operaciones/liquidacionproceso-list']);
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
  actualizarLiquidacionProcesoService(request: ReqLiquidacionProceso) {
    this.liquidacionProcesoPlantaService.Actualizar(request)
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            var form = this;
            this.alertUtil.alertOkCallback('Actualizado!', 'Liquidacion Proceso', function (result) {
              if (result.isConfirmed) {
                form.router.navigate(['/planta/operaciones/liquidacionproceso-list']);
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

  agregarOrdenProceso(e) {
    
    this.liquidacionProcesoFormEdit.controls["ordenProcesoPlantaId"].setValue(e[0].OrdenProcesoPlantaId);
    this.liquidacionProcesoFormEdit.controls["tipoProceso"].setValue(e[0].TipoProceso);
    this.liquidacionProcesoFormEdit.controls["ruc"].setValue(e[0].RucOrganizacion);
    this.liquidacionProcesoFormEdit.controls["tipoProduccion"].setValue(e[0].TipoProduccion);
    this.liquidacionProcesoFormEdit.controls["producto"].setValue(e[0].Producto);
    this.liquidacionProcesoFormEdit.controls["productoTerminado"].setValue(e[0].ProductoTerminado);
    this.liquidacionProcesoFormEdit.controls["numOrdenProceso"].setValue(e[0].Numero);
    this.liquidacionProcesoFormEdit.controls["subproducto"].setValue(e[0].SubProducto);
    this.liquidacionProcesoFormEdit.controls["razonSocial"].setValue(e[0].RazonSocialOrganizacion);
    this.liquidacionProcesoFormEdit.controls["certificacion"].setValue(e[0].Certificacion);
    this.liquidacionProcesoFormEdit.controls["certificadora"].setValue(e[0].EntidadCertificadora);
    this.liquidacionProcesoFormEdit.controls["envases"].setValue(e[0].Empaque + ' ' + e[0].Tipo);
    this.liquidacionProcesoFormEdit.controls["envases"].disable()
    //this.EmpaqueId = e[0].EmpaqueId;
    this.CertificacionId = e[0].CertificacionId;
    //this.TipoId = e[0].TipoId;

    if(e[0].FechaInicioProceso!= "")
    {
      this.liquidacionProcesoFormEdit.controls["fechaInicioProceso"].setValue(e[0].FechaInicioProceso);
    }

    if(e[0].FechaFinProceso!= "")
    {
      this.liquidacionProcesoFormEdit.controls["fechaFinProceso"].setValue(e[0].FechaFinProceso);
    }
    

    this.consultarDetalleporId(e[0].OrdenProcesoPlantaId);
    //this.calcularCascarilla();
    //this.calcularPorcentaje();
  }

  consultarDetalleporId(OrdenProcesoPlantaId: number) {
    this.ordenProcesoService.ConsultarPorId(OrdenProcesoPlantaId)
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) 
        {
          if (res.Result.ErrCode == "") 
          {
            this.listMateriaPrima = [];
            
            res.Result.Data.detalle.forEach(data => 
              {
              let object: any = {};
              object.NotaIngresoAlmacenPlantaId = data.NotaIngresoAlmacenPlantaId        
              object.Descripcion = data.NumeroIngresoAlmacenPlanta
              object.PorcentajeHumedad = data.PorcentajeHumedad;     
              object.Cantidad = data.Cantidad
              object.KilosNetos = data.KilosNetos
            
              this.listMateriaPrima.push(object);
            }); 
           
            this.tempMateriaPrima = this.listMateriaPrima;
            this.rowsMateriaPrima = [...this.tempMateriaPrima];
           // this.calcularKilosNetosNotas();
            this.calcularKilosNetosNotas();
            this.calcularKilosNetos();
          }
          else if (res.Result.Message != "" && res.Result.ErrCode != "") 
          {
            this.errorGeneral = { isError: true, errorMessage: res.Result.Message };
          } else {
            this.errorGeneral = { isError: true, errorMessage: this.mensajeErrorGenerico };
          }
        } 
        else 
        {
          this.errorGeneral = { isError: true, errorMessage: this.mensajeErrorGenerico };
        }
      },
        err => {
          this.spinner.hide();
          console.log(err);
          this.errorGeneral = { isError: false, errorMessage: this.mensajeErrorGenerico };
        }
      );
    this.modalService.dismissAll();
  }

  calcularKilosNetosNotas()
  {
    const form = this;
    var totalKilosNetos= 0;
    if (form.listMateriaPrima.length != 0)
    {
      form.listMateriaPrima.forEach(x => {
      totalKilosNetos = totalKilosNetos + x.KilosNetos
    });
    this.sumKilosNetos = totalKilosNetos.toFixed(2);
    }
    return totalKilosNetos;
  }
  imprimir(): void {
    let link = document.createElement('a');
    document.body.appendChild(link);
    link.href = `${host}NotaSalidaAlmacen/GenerarPDFGuiaRemision?id=${this.id}`;
    link.download = "GuiaRemision.pdf"
    link.target = "_blank";
    link.click();
    link.remove();
  }

  ListaProductores(): void {
    let link = document.createElement('a');
    document.body.appendChild(link);
    link.href = `${host}NotaSalidaAlmacen/GenerarPDFListaProductores?id=${this.id}`;
    link.download = "ListaProductoresGR.pdf"
    link.target = "_blank";
    link.click();
    link.remove();
  }

  RegistroSeguridad(): void {
    let link = document.createElement('a');
    document.body.appendChild(link);
    link.href = `${host}NotaSalidaAlmacen/GenerarPDFRegistroSeguridad?id=${this.id}`;
    link.download = "ListaProductoresGR.pdf"
    link.target = "_blank";
    link.click();
    link.remove();
  }

  ImprimirLiquidacionProceso() {
    let link = document.createElement('a');
    document.body.appendChild(link);
    link.href = `${host}LiquidacionProcesoPlanta/GenerarPDFLiquidacionProceso?id=${this.id}&empresaId=${this.vSessionUser.Result.Data.EmpresaId}`;
    link.download = "ListaProductoresGR.pdf"
    link.target = "_blank";
    link.click();
    link.remove();
  }
  emptySumm() {
    return null;
  }

}
