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
  errorGeneral: any = { isError: false, errorMessage: '' };
  errorEmpresa: any = { isError: false, errorMessage: '' };
  mensajeErrorGenerico = "Ocurrio un error interno.";
  popupModel;
  login: ILogin;
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
  listResultProceso = [];
  popUp = true;


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
    private liquidacionProcesoPlantaService: LiquidacionProcesoPlantaService
  ) {

  }

  ngOnInit(): void {
    this.login = JSON.parse(localStorage.getItem("user"));
    this.cargarForm();
    this.Load();
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

  obtenerDetalle() {
    this.spinner.show();
    this.liquidacionProcesoPlantaService.ConsultaPorId(Number(this.id))
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

  cargarDataFormulario(data: any) {
    this.liquidacionProcesoFormEdit.controls["tipoProceso"].setValue(data.TipoProceso);
    this.liquidacionProcesoFormEdit.controls["ruc"].setValue(data.RucOrganizacion);
    this.liquidacionProcesoFormEdit.controls["tipoProduccion"].setValue(data.TipoProduccion);
    this.liquidacionProcesoFormEdit.controls["producto"].setValue(data.Producto);
    this.liquidacionProcesoFormEdit.controls["subproducto"].setValue(data.SubProducto);
    this.liquidacionProcesoFormEdit.controls["numOrdenProceso"].setValue(data.NumeroOrdenProcesoPlanta);
    this.liquidacionProcesoFormEdit.controls["razonSocial"].setValue(data.RazonSocialOrganizacion);
    this.liquidacionProcesoFormEdit.controls["tipoCertificacion"].setValue(data.TipoCertificacion);
    this.liquidacionProcesoFormEdit.controls["certificadora"].setValue(data.EntidadCertificadora);
    this.liquidacionProcesoFormEdit.controls["ordenProcesoPlantaId"].setValue(data.OrdenProcesoPlantaId);
    this.liquidacionProcesoFormEdit.controls["observacion"].setValue(data.Observacion);
    this.liquidacionProcesoFormEdit.controls["envases"].setValue(data.EnvasesProductos);
    this.liquidacionProcesoFormEdit.controls["trabajos"].setValue(data.TrabajosRealizados);
    this.numero = data.Numero;
    this.fechaRegistro = this.dateUtil.formatDate(new Date(data.FechaRegistro), "/");
    this.responsable = data.UsuarioRegistro;
    this.spinner.hide();

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
        subproducto: new FormControl('', []),
        numOrdenProceso: new FormControl('', []),
        razonSocial: new FormControl('', []),
        tipoCertificacion: new FormControl('', []),
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
        numDefectos: new FormControl('', [])
      });
  }
  Load() {
    this.maestroUtil.obtenerMaestros('TiposCafeProcesado', (res: any) => {
      if (res.Result.Success) {
        this.listResultProceso = res.Result.Data;
        this.tempDataResultProceso = this.listResultProceso;
        this.rowsResultProceso = [... this.tempDataResultProceso];
        let groupsSacos = {}
        let groupKg = {}
        let groupKilosNetos = {}
        let groupPorcentaje = {}
        let groupQqkg = {}
        this.listResultProceso.forEach(input_template => {
          groupsSacos[input_template.Codigo + '%sacos'] = new FormControl('', []);
          groupKg[input_template.Codigo + '%Kg'] = new FormControl('', []);
          groupKilosNetos[input_template.Codigo + '%kilosNetos'] = new FormControl('', []);
          groupPorcentaje[input_template.Codigo + '%porcentaje'] = new FormControl('', []);
          groupQqkg[input_template.Codigo + '%qqkg'] = new FormControl('', []);
        })
        this.formGroupSacos = new FormGroup(groupsSacos);
        this.formGroupKg = new FormGroup(groupKg);
        this.formGroupKilosNetos = new FormGroup(groupKilosNetos)
        this.formGroupPorcentaje = new FormGroup(groupPorcentaje);
        this.formGroupQqkg = new FormGroup(groupQqkg);
      }
    });
  }

  openModal(modalOrdenProceso) {
    this.modalService.open(modalOrdenProceso, { windowClass: 'dark-modal', size: 'xl' });

  }

  calcularSacos() {
    this.calcularTotalSacos();
    this.rowsResultProceso.forEach(x => {
      var valueSacos = Number(this.formGroupSacos.get(x.Codigo + '%sacos').value);
      var kg = Number(this.formGroupKg.get(x.Codigo + '%Kg').value);
      if (valueSacos != 0 || kg != 0) {
        var kilosNetos = valueSacos*69 + kg;
        this.formGroupKilosNetos.get(x.Codigo + '%kilosNetos').setValue(kilosNetos);
        var totalKilosNetos = this.calcularTotalKilosNetos();
        var porcentajeKilosNetos = ((kilosNetos / totalKilosNetos) * 100).toFixed(2);
        var qqKg = (valueSacos / 46).toFixed(2);
        this.formGroupQqkg.get(x.Codigo + '%qqkg').setValue(qqKg);
        this.formGroupPorcentaje.get(x.Codigo + '%porcentaje').setValue(porcentajeKilosNetos);
        this.calcularTotalKg();
      }
    });
    this.calcularTotalPorcentaje();
  }
  calcularTotalPorcentaje() {
    var totalPorcentaje = 0;
    this.rowsResultProceso.forEach(x => {
      totalPorcentaje = totalPorcentaje + Number(this.formGroupPorcentaje.get(x.Codigo + '%porcentaje').value);
    });
    this.liquidacionProcesoFormEdit.get('totalPorcentaje').setValue(Math.round(totalPorcentaje));
  }
  calcularTotalSacos() {
    var totalSacos = 0;
    this.rowsResultProceso.forEach(x => {
      totalSacos = totalSacos + Number(this.formGroupSacos.get(x.Codigo + '%sacos').value);
    });
    this.liquidacionProcesoFormEdit.get('totalSacos').setValue(totalSacos);
    return totalSacos;
  }
  calcularTotalKg() {
    var totalKg = 0;
    this.rowsResultProceso.forEach(x => {
      totalKg = totalKg + Number(this.formGroupKg.get(x.Codigo + '%Kg').value);
    });
    this.liquidacionProcesoFormEdit.get('totalKg').setValue(totalKg);
  }
  calcularTotalKilosNetos() {
    var totalKilosNetos = 0;
    this.rowsResultProceso.forEach(x => {
      totalKilosNetos = totalKilosNetos + Number(this.formGroupKilosNetos.get(x.Codigo + '%kilosNetos').value);
    });
    this.liquidacionProcesoFormEdit.get('totalKilosNetos').setValue(totalKilosNetos);
    return totalKilosNetos;
  }

  get fedit() {
    return this.liquidacionProcesoFormEdit.controls;
  }

  cancelar() {
    this.router.navigate(['/planta/operaciones/liquidacionproceso-list']);
  }

  guardar() {
    if (this.liquidacionProcesoFormEdit.invalid || this.errorGeneral.isError) {
      this.submittedEdit = true;
      return;
    } else {

      let liquidacionProcesoPlantaResultado: LiquidacionProcesoPlantaResultado[] = [];
      this.rowsResultProceso.forEach(x => {
        let objectResultProceso = new LiquidacionProcesoPlantaResultado(
          x.Codigo,
          Number(this.formGroupSacos.get(x.Codigo + '%sacos').value),
          Number(this.formGroupKg.get(x.Codigo + '%Kg').value),
          Number(this.formGroupKilosNetos.get(x.Codigo + '%kilosNetos').value) ,
        );
        liquidacionProcesoPlantaResultado.push(objectResultProceso);
      }
      );

      let liquidacionProcesoPlantaDetalle: LiquidacionProcesoPlantaDetalle[] = [];
      this.listMateriaPrima.forEach(x => {
        let ObjectProcesoPlantaDetalle = new LiquidacionProcesoPlantaDetalle(
          String(x.NotaIngresoPlantaId)
        );
        liquidacionProcesoPlantaDetalle.push(ObjectProcesoPlantaDetalle);
      });

      let request = new ReqLiquidacionProceso(
        Number(this.id),
        this.liquidacionProcesoFormEdit.get("ordenProcesoPlantaId").value,
        this.numero,
        this.login.Result.Data.EmpresaId,
        this.liquidacionProcesoFormEdit.get("observacion").value,
        this.liquidacionProcesoFormEdit.get("envases").value,
        this.liquidacionProcesoFormEdit.get("trabajos").value,
        '01',
        this.login.Result.Data.NombreUsuario,
        liquidacionProcesoPlantaDetalle,
        liquidacionProcesoPlantaResultado

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
        this.actualizarLiquidacionProcesoService(request);
      } else {
        this.registrarLiquidacionProcesoService(request);
      }


    }
  }

  registrarLiquidacionProcesoService(request: ReqLiquidacionProceso) {
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
    this.liquidacionProcesoFormEdit.controls["numOrdenProceso"].setValue(e[0].Numero);
    this.liquidacionProcesoFormEdit.controls["subproducto"].setValue(e[0].SubProducto);
    this.liquidacionProcesoFormEdit.controls["razonSocial"].setValue(e[0].RazonSocialOrganizacion);
    this.liquidacionProcesoFormEdit.controls["tipoCertificacion"].setValue(e[0].TipoCertificacion);
    this.liquidacionProcesoFormEdit.controls["certificadora"].setValue(e[0].EntidadCertificadora);
    this.consultarDetalleporId(e[0].OrdenProcesoPlantaId)
  }

  consultarDetalleporId(OrdenProcesoPlantaId: number) {
    this.ordenProcesoService.ConsultarPorId(OrdenProcesoPlantaId)
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            this.listMateriaPrima = res.Result.Data.detalle;
            this.tempMateriaPrima = this.listMateriaPrima;
            this.rowsMateriaPrima = [...this.tempMateriaPrima]

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
    this.modalService.dismissAll();
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
    link.href = `${host}LiquidacionProcesoPlanta/GenerarPDFLiquidacionProceso?id=1`;
    link.download = "ListaProductoresGR.pdf"
    link.target = "_blank";
    link.click();
    link.remove();
  }

}
