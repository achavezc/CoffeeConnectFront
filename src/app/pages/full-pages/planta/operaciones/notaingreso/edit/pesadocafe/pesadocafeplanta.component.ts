import { Component, Input, Output, OnInit, EventEmitter, ViewChild } from '@angular/core';
import { MaestroUtil } from '../../../../../../../services/util/maestro-util';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn, ControlContainer } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";
import { DatatableComponent, ColumnMode } from "@swimlane/ngx-datatable";
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
//import { EventEmitter } from 'events';
import { TransportistaService } from '../../../../../../../services/transportista.service';
@Component({
  selector: '[formGroup] app-pesadoCafePlanta,[formGroupName] app-pesadoCafePlanta',
  templateUrl: './pesadoCafePlanta.component.html',
  styleUrls: ['./pesadoCafePlanta.component.scss']
})
export class PesadoCafePlantaComponent implements OnInit {
  public pesadoFormGroup: FormGroup;
  listaUnidadMedida: any[];
  selectedUnidadMedida: any;
  listaMotivo: any[];
  selectedMotivo: any;
  consultaTransportistas: FormGroup;
  listaEmpaque: any[];
  selectedEmpaque: any;
  listaTipo: any[];
  selectedTipo: any;
  listaCalidad: any[];
  selectedCalidad: any;
  listaGrado: any[];
  selectedGrado: any;
  @Input() submittedEdit;
  @Output() miEvento = new EventEmitter<any>();
  CodigoSacao = "01";
  CodigoTipoYute = "01";
  kilos = 7;
  tara = 0.2;
  taraYute = 0.7
  mensaje = "";
  submittedT = false;
  errorTransportista: any = { isError: false, errorMessage: '' };
  selectedT = [];
  filtrosTransportista: any = {};
  public rowsT = [];
  private tempDataT = [];
  mensajeErrorGenerico = "Ocurrio un error interno.";
  public limitRefT = 10;
  public ColumnMode = ColumnMode;
  @ViewChild(DatatableComponent) tableTranspotistas: DatatableComponent;

  constructor(private maestroUtil: MaestroUtil,
    private controlContainer: ControlContainer,
    private spinner: NgxSpinnerService,
    private transportistaService: TransportistaService,
    private modalService: NgbModal
    
  ) {
  }

  ngOnInit(): void {
    this.cargarcombos();
    this.cargarForm();
    this.pesadoFormGroup = <FormGroup>this.controlContainer.control;
  }

  cargarTransportista() {
    this.consultaTransportistas = new FormGroup(
      {
        rzsocial: new FormControl('', [Validators.minLength(5), Validators.maxLength(100)]),
        ruc: new FormControl('', [Validators.minLength(8), Validators.maxLength(20)])
      }
    );
    this.consultaTransportistas.setValidators(this.comparisonValidatorTransportista())
  }

  public comparisonValidatorTransportista(): ValidatorFn {
    return (group: FormGroup): ValidationErrors => {
      let rzsocial = group.controls['rzsocial'].value;
      let ruc = group.controls['ruc'].value;
      if (rzsocial == "" && ruc == "") {
        this.errorTransportista = { isError: true, errorMessage: 'Por favor ingresar por lo menos un filtro.' };
      }
      else {
        this.errorTransportista = { isError: false, errorMessage: '' };
      }
      return;
    };
  }
  updateLimitT(limit) {
    this.limitRefT = limit.target.value;
  }
  seleccionarTransportista(e) {
    this.pesadoFormGroup.controls.transportista.setValue(e[0].RazonSocial);
    this.pesadoFormGroup.controls.ruc.setValue(e[0].Ruc);
    this.pesadoFormGroup.controls.placaVehiculo.setValue(e[0].PlacaTractor);
    this.pesadoFormGroup.controls.chofer.setValue(e[0].Conductor);
    this.pesadoFormGroup.controls.numeroBrevete.setValue(e[0].Licencia);
    this.pesadoFormGroup.controls.marca.setValue(e[0].MarcaTractor);

    /*
    this.tagNotadeSalida.get('propietario').setValue(e[0].RazonSocial);
    this.tagNotadeSalida.get('domiciliado').setValue(e[0].Direccion);
    this.tagNotadeSalida.get('ruc').setValue(e[0].Ruc);
    this.tagNotadeSalida.get('conductor').setValue(e[0].Conductor);
    this.tagNotadeSalida.get('brevete').setValue(e[0].Licencia);
    this.tagNotadeSalida.get('codvehicular').setValue(e[0].ConfiguracionVehicular);
    this.tagNotadeSalida.get('marca').setValue(e[0].MarcaTractor);
    this.tagNotadeSalida.get('placa').setValue(e[0].PlacaTractor);
    this.tagNotadeSalida.get('numconstanciamtc').setValue(e[0].NumeroConstanciaMTC);
    */
    this.modalService.dismissAll();
  }
  get fT() {
    return this.consultaTransportistas.controls;
  }
  openModalTransportista(modalTransportista) {
    this.modalService.open(modalTransportista, { windowClass: 'dark-modal', size: 'lg' });
    this.cargarTransportista();
    //this.clear();
  }
  buscarTransportista() {

    if (this.consultaTransportistas.invalid || this.errorTransportista.isError) {
      this.submittedT = true;
      return;
    } else {
      this.selectedT = [];
      this.submittedT = false;
      this.filtrosTransportista.RazonSocial = this.consultaTransportistas.controls['rzsocial'].value;
      this.filtrosTransportista.Ruc = this.consultaTransportistas.controls['ruc'].value;
      this.filtrosTransportista.EmpresaId = 1;
      this.spinner.show(undefined,
        {
          type: 'ball-triangle-path',
          size: 'large',
          bdColor: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          fullScreen: true
        });
      this.transportistaService.Consultar(this.filtrosTransportista)
        .subscribe(res => {
          this.spinner.hide();
          if (res.Result.Success) {
            if (res.Result.ErrCode == "") {
              this.tempDataT = res.Result.Data;
              this.rowsT = [...this.tempDataT];
            } else if (res.Result.Message != "" && res.Result.ErrCode != "") {
              this.errorTransportista = { isError: true, errorMessage: res.Result.Message };
            } else {
              this.errorTransportista = { isError: true, errorMessage: this.mensajeErrorGenerico };
            }
          } else {
            this.errorTransportista = { isError: true, errorMessage: this.mensajeErrorGenerico };
          }
        },
          err => {
            this.spinner.hide();
            console.error(err);
            this.errorTransportista = { isError: false, errorMessage: this.mensajeErrorGenerico };
          }
        );
    }

  };

  filterUpdateT(event) {
    const val = event.target.value.toLowerCase();
    const temp = this.tempDataT.filter(function (d) {
      return d.Numero.toLowerCase().indexOf(val) !== -1 || !val;
    });
    this.rowsT = temp;
    this.tableTranspotistas.offset = 0;
  }
  cargarcombos() {
    var form = this;
    this.maestroUtil.obtenerMaestros("MotivoIngresoPlanta", function (res) {
      if (res.Result.Success) {
        form.listaMotivo = res.Result.Data;
      }
    });

    this.maestroUtil.obtenerMaestros("Empaque", function (res) {
      if (res.Result.Success) {
        form.listaEmpaque = res.Result.Data;
      }
    });

    this.maestroUtil.obtenerMaestros("TipoEmpaque", function (res) {
      if (res.Result.Success) {
        form.listaTipo = res.Result.Data;
      }
    });

    this.maestroUtil.obtenerMaestros("Calidad", function (res) {
      if (res.Result.Success) {
        form.listaCalidad = res.Result.Data;
      }
    });

    this.maestroUtil.obtenerMaestros("Grado", function (res) {
      if (res.Result.Success) {
        form.listaGrado = res.Result.Data;
      }
    });
  }
  cargarForm() {
  }

  changeEmpaque(e) {
    this.calcularTara();
  }
  changeTipo(e) {
    this.calcularTara();
  }
  changeCantidad() {
    this.calcularTara();
  }
  changePesoBruto(){
    this.calcularKilosNetos();
  }

  calcularTara() {
    var cantidad = this.pesadoFormGroup.controls['cantidad'].value;
    var empaque = this.pesadoFormGroup.controls['empaque'].value;
    var tipo = this.pesadoFormGroup.controls['tipo'].value;
    var valor = 0;
    if (empaque == this.CodigoSacao && tipo == this.CodigoTipoYute) {
      var valor = cantidad * this.taraYute;
    } else if (empaque == this.CodigoSacao && tipo != this.CodigoTipoYute) {
      var valor = cantidad * this.tara;
    }


    var valorRounded = Math.round((valor + Number.EPSILON) * 100) / 100
    this.pesadoFormGroup.controls['tara'].setValue(valorRounded);
    this.calcularKilosNetos();
  }
  consultarSocioFinca() {
    this.miEvento.emit(this.mensaje);
  }

  calcularKilosNetos(){
    var tara = this.pesadoFormGroup.controls['tara'].value;
    var kilosBrutos = this.pesadoFormGroup.controls['kilosBrutos'].value;
    var valor = kilosBrutos - tara;
    var valorRounded = Math.round((valor + Number.EPSILON) * 100) / 100
    this.pesadoFormGroup.controls['kilosNetos'].setValue(valorRounded);
  }

  cleanKilosBrutos() {
    this.pesadoFormGroup.controls['kilosBruto'].setValue("");
  }

}
