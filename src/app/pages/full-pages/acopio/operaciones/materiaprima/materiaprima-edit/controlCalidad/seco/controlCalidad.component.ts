import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn, FormArray, FormBuilder } from '@angular/forms';
import { AcopioService } from '../../../../../../../../services/acopio.service';
import {
  ReqControlCalidad, AnalisisFisicoColorDetalleList, AnalisisFisicoOlorDetalleList, AnalisisFisicoDefectoPrimarioDetalleList,
  AnalisisFisicoDefectoSecundarioDetalleList, RegistroTostadoIndicadorDetalleList, AnalisisSensorialDefectoDetalleList,
  AnalisisSensorialAtributoDetalleList
} from '../../../../../../../../services/models/req-controlcalidad-actualizar'
import { NgxSpinnerService } from "ngx-spinner";
import swal from 'sweetalert2';
import { AlertUtil } from '../../../../../../../../services/util/alert-util';
import { Router,ActivatedRoute } from "@angular/router";
import { ILogin } from '../../../../../../../../services/models/login';
import { DateUtil } from '../../../../../../../../services/util/date-util';
import { MaestroService } from '../../../../../../../../services/maestro.service';
import { LoteService } from '../../../../../../../../services/lote.service';
import { OrdenservicioControlcalidadService } from '../../../../../../../../services/ordenservicio-controlcalidad.service';
import { ControlCalidadService } from '../controlCalidadServices';
import { PlantaService } from '../../../../../../../../services/planta.service';
import { MaestroUtil } from '../../../../../../../../services/util/maestro-util';
@Component({
  selector: 'app-controlCalidadSeco',
  templateUrl: './controlCalidad.component.html',
  styleUrls: ['./controlCalidad.component.scss']
})
export class ControlCalidadComponent implements OnInit {

  @ViewChild('vform') validationForm: FormGroup;
  @Input() detalle: any;
  @Input() form;


  submitted = false;
  controlCalidadSeco: FormGroup;
  formControlCalidad: FormGroup;
  tableOlor: FormGroup;
  tableColor: FormGroup;
  tableDefectosPrimarios: FormGroup;
  tableDefectosSecundarios: FormGroup;
  tableSensorialDefectos: FormGroup;
  tableSensorialRanking: FormGroup;
  tableRegistroTostado: FormGroup;
  listaDefectosPrimarios: any[];
  listaDefectosSecundarios: any[];
  listaOlor: any[];
  listaColor: any[];
  listaSensorialAtributos: any[];
  listaSensorialRanking: any[];
  listaSensorialDefectos: any[];
  listaIndicadorTostado: any[];
  listaEmpaque: any[];
  selectedEmpaque: any;
  listaTipo: any[];
  selectedTipo: any;
  CodigoSacao = "01";
  CodigoTipoYute = "01";
  taraYute = 0.7
  tara = 0.2;
  reqControlCalidad: ReqControlCalidad;
  minSensorial: number;
  maxSensorial: number;
  login: ILogin;
  errorGeneral: any = { isError: false, errorMessage: '' };
  error: any = { isError: false, errorMessage: '' };
  mensajeErrorGenerico = "Ocurrio un error interno.";
  responsable: string;
  fechaCalidad: string;
  estadoPesado = "01";
  estadoAnalizado = "02";
  estadoAnulado = "00";
  estadoEnviadoAlmacen = "03";
  page: any;
  btnGuardarCalidad = true;
  calculocascarilla = 400;
  formDefectos : FormGroup;
  subtotalDefectos: number;
  @Input() readonly;
  constructor(
    private maestroUtil: MaestroUtil,
    private spinner: NgxSpinnerService,
    private router: Router, private dateUtil: DateUtil,
    private maestroService: MaestroService,
    private controlCalidadService: ControlCalidadService,
    private loteService: LoteService,
    private alertUtil: AlertUtil,
    private ordenServicio: OrdenservicioControlcalidadService,
    private acopioService: AcopioService,
    private notaIngresoPlantaService: PlantaService,
    private route: ActivatedRoute
  ) {

  }

  ngOnInit(): void {
    this.login = JSON.parse(localStorage.getItem("user"));
    this.page = this.route.routeConfig.data.title;
    this.cargarForm();
    this.cargarCombos();

  }

  async cargaTipo() {

    var data = await this.maestroService.obtenerMaestros("TipoEmpaque").toPromise();
    if (data.Result.Success) {
      this.listaTipo = data.Result.Data;
    }
  }
  async cargaEmpaque() {
    var data = await this.maestroService.obtenerMaestros("Empaque").toPromise();
    if (data.Result.Success) {
      this.listaEmpaque = data.Result.Data;
    }
  }
  async cargarCombos() {
    var form = this;
    await this.cargaTipo();
    await this.cargaEmpaque();
    var dataDefP = await this.maestroService.obtenerMaestros("DefectosPrimarios").toPromise();
    if (dataDefP.Result.Success) {
      form.listaDefectosPrimarios = dataDefP.Result.Data;
      let group = {}
      form.listaDefectosPrimarios.forEach(input_template => {
        group['DefPrimario%' + input_template.Codigo] = new FormControl('', []);
      })
      group['SubTotalDefPrimarios'] = new FormControl('', []);
      form.tableDefectosPrimarios = new FormGroup(group);
    }
    var dataDefS = await this.maestroService.obtenerMaestros("DefectosSecundarios").toPromise();
    if (dataDefS.Result.Success) {
      form.listaDefectosSecundarios = dataDefS.Result.Data;
      let group = {}
      form.listaDefectosSecundarios.forEach(input_template => {
        group['DefSecundarios%' + input_template.Codigo] = new FormControl('', []);
      })

      form.tableDefectosSecundarios = new FormGroup(group);
    }
    var dataOlor = await this.maestroService.obtenerMaestros("Olor").toPromise();
    if (dataOlor.Result.Success) {
      form.listaOlor = dataOlor.Result.Data;
      let group = {}
      form.listaOlor.forEach(input_template => {
        group['CheckboxOlor%' + input_template.Codigo] = new FormControl('', []);
      })
      form.tableOlor = new FormGroup(group);
    }
    var dataColor = await this.maestroService.obtenerMaestros("Color").toPromise();
    if (dataColor.Result.Success) {
      form.listaColor = dataColor.Result.Data;
      let group = {}
      form.listaColor.forEach(input_template => {
        group['CheckboxColor%' + input_template.Codigo] = new FormControl('', []);
      })
      form.tableColor = new FormGroup(group);
    }
    var dataSenR = await this.maestroService.obtenerMaestros("SensorialRanking").toPromise();
    if (dataSenR.Result.Success) {
      form.listaSensorialRanking = dataSenR.Result.Data;
      form.valorMinMax();
    }
    var dataSenA = await this.maestroService.obtenerMaestros("SensorialAtributos").toPromise();
    if (dataSenA.Result.Success) {
      form.listaSensorialAtributos = dataSenA.Result.Data;
      let group = {}
      form.listaSensorialAtributos.forEach(input_template => {
        group['sensorialAtrib%' + input_template.Codigo] = new FormControl('', [Validators.max(form.maxSensorial), Validators.min(form.minSensorial)]);
        group['sensorialAtribRanking%' + input_template.Codigo] = new FormControl('', []);
      })
      form.tableSensorialRanking = new FormGroup(group);
    }
    var dataSenD = await this.maestroService.obtenerMaestros("SensorialDefectos").toPromise();
    if (dataSenD.Result.Success) {
      form.listaSensorialDefectos = dataSenD.Result.Data;
      let group = {}
      form.listaSensorialDefectos.forEach(input_template => {
        group['checkboxSenDefectos%' + input_template.Codigo] = new FormControl('', []);
      })
      form.tableSensorialDefectos = new FormGroup(group);
    }
    var dataInT = await this.maestroService.obtenerMaestros("IndicadorTostado").toPromise();;
    if (dataInT.Result.Success) {
      form.listaIndicadorTostado = dataInT.Result.Data;
      let group = {}
      form.listaIndicadorTostado.forEach(input_template => {
        group['tostado%' + input_template.Codigo] = new FormControl('', []);
      })
      form.tableRegistroTostado = new FormGroup(group);
    }

    if (this.detalle) {
      this.obtenerDetalle();
    }
  }
  changeEmpaque(e) {
    this.calcularTara();
  }
  changeTipo(e) {
    this.calcularTara();
  }
  calcularTara() {
    var cantidad = this.formControlCalidad.controls['cantidadControlCalidad'].value;
    var empaque = this.formControlCalidad.controls['empaque'].value;
    var tipo = this.formControlCalidad.controls['tipo'].value;
    var valor = 0;
    if (empaque == this.CodigoSacao && tipo == this.CodigoTipoYute) {
      var valor = cantidad * this.taraYute;
    } else if (empaque == this.CodigoSacao && tipo != this.CodigoTipoYute) {
      var valor = cantidad * this.tara;
    }


    var valorRounded = Math.round((valor + Number.EPSILON) * 100) / 100
    this.formControlCalidad.controls['taraControlCalidad'].setValue(valorRounded);
    this.calcularKilosNetos();
  }

  calcularKilosNetos(){
    var tara = this.formControlCalidad.controls['taraControlCalidad'].value;
    var kilosBrutos = this.formControlCalidad.controls['pesoBrutoControlCalidad'].value;
    var valor = kilosBrutos - tara;
    var valorRounded = Math.round((valor + Number.EPSILON) * 100) / 100
    this.formControlCalidad.controls['kilosNetosControlCalidad'].setValue(valorRounded);
  }

  cargarForm() {
    this.formDefectos = new FormGroup(
      {
        tasa:  new FormControl('', []),
        intensidad:  new FormControl('', []),
        subtotal:  new FormControl('', []),
        puntajeFinal:  new FormControl('', [])
      }
    );
    this.formControlCalidad = new FormGroup(
      {
        exportGramos: new FormControl('', [Validators.required]),
        exportPorcentaje: new FormControl('', []),
        descarteGramos: new FormControl('', [Validators.required]),
        descartePorcentaje: new FormControl('', []),
        cascarillaGramos: new FormControl('', [Validators.required]),
        cascarillaPorcentaje: new FormControl('', []),

        cantidadControlCalidad: new FormControl('', [Validators.required]),
        pesoBrutoControlCalidad: new FormControl('', [Validators.required]),
        taraControlCalidad: new FormControl('', []),
        kilosNetosControlCalidad: new FormControl('', []),
        tipo: new FormControl('', [Validators.required]),
        empaque: new FormControl('', [Validators.required]),

        humedad: new FormControl('', [Validators.required]),
        totalGramos: new FormControl('', []),
        totalPorcentaje: new FormControl('', []),
        SubTotalDefSecundario: new FormControl('', []),
        SubTotalDefPrimario: new FormControl('', []),
        ToTalEquiDefectos: new FormControl('', []),
        ObservacionAnalisisFisico: new FormControl('', []),
        ObservacionRegTostado: new FormControl('', []),
        ObservacionAnalisisSensorial: new FormControl('', []),
        SubToTalSensorial: new FormControl('', [])
      });
    this.formControlCalidad.setValidators(this.comparisonValidator());
    this.formControlCalidad.get("taraControlCalidad").disable();
    this.formControlCalidad.get("kilosNetosControlCalidad").disable();

    this.desactivarControlesPlanta();
  }

  valorMinMax() {
    let max = [];
    let min = [];
    for (let item in this.listaSensorialRanking) {
      max.push(Number(this.listaSensorialRanking[item].Val2));
      min.push(Number(this.listaSensorialRanking[item].Val1));
    }
    this.minSensorial = Math.min(...min);
    this.maxSensorial = Math.max(...max);
  }
  get frendExport() {
    return this.formControlCalidad.controls;
  }
  get fSensorialRanking() {
    return this.tableSensorialRanking.controls;
  }

  evaluar(value) {
    const item = this.listaSensorialRanking.filter(obj => Number(value) >= Number(obj.Val1) && Number(value) <= Number(obj.Val2));
    if (item.length > 0) {
      return item[0].Label;
    }
    else {
      return "";
    }

  }
  evaluarRanking(i, value) {
    const item = this.listaSensorialRanking.filter(obj => Number(value) >= Number(obj.Val1) && Number(value) <= Number(obj.Val2));
    if (item.length > 0) {
      this.tableSensorialRanking.controls['sensorialAtribRanking%' + i].setValue(item[0].Label);
    }
    else {
      this.tableSensorialRanking.controls['sensorialAtribRanking%' + i].setValue("");
    }
    this.calcularSubTotalSensorial();
    this.calcularPuntajeFinal();
  }

  calcularSubTotalSensorial() {
    let SubToTalSensorial = 0;
    for (let i = 0; i < this.listaSensorialAtributos.length; i++) {
      SubToTalSensorial = Number(this.tableSensorialRanking.controls['sensorialAtrib%' + this.listaSensorialAtributos[i].Codigo].value) + SubToTalSensorial;
    }
    this.formControlCalidad.controls["SubToTalSensorial"].setValue(SubToTalSensorial.toFixed(2));
  }

  calcularTotalDefPrimario() {

    let totalDefPrimarios: number = 0;
    let totalDefSecundario: number = 0;
    for (let i = 0; i < this.listaDefectosPrimarios.length; i++) {
      totalDefPrimarios = Number(this.tableDefectosPrimarios.controls['DefPrimario%' + this.listaDefectosPrimarios[i].Codigo].value) + totalDefPrimarios;
    }
    this.formControlCalidad.controls["SubTotalDefPrimario"].setValue(totalDefPrimarios);
    totalDefSecundario = Number(this.formControlCalidad.controls["SubTotalDefSecundario"].value);
    this.formControlCalidad.controls["ToTalEquiDefectos"].setValue(totalDefPrimarios + totalDefSecundario);


  }

  calcularTotalDefSecundario() {
    let totalDefSecundario: number = 0;
    let totalDefPrimarios: number = 0;
    for (let i = 0; i < this.listaDefectosSecundarios.length; i++) {
      totalDefSecundario = Number(this.tableDefectosSecundarios.controls['DefSecundarios%' + this.listaDefectosSecundarios[i].Codigo].value) + totalDefSecundario;
    }
    this.formControlCalidad.controls['SubTotalDefSecundario'].setValue(totalDefSecundario);
    totalDefPrimarios = Number(this.formControlCalidad.controls["SubTotalDefPrimario"].value);
    this.formControlCalidad.controls["ToTalEquiDefectos"].setValue(totalDefPrimarios + totalDefSecundario);
  }

  public comparisonValidator(): ValidatorFn {
    return (group: FormGroup): ValidationErrors => {
      const totalPorcentaje = Number((group.controls["totalPorcentaje"].value).split("%")[0]);
      if ((totalPorcentaje > 100 || totalPorcentaje < 100)) {

        this.error = { isError: true, errorMessage: 'Total de Porcentaje debe ser 100%' };

      }
      else {
        this.error = { isError: false, errorMessage: '' };
      }
      return;
    };
  }

  calcularSubTotalDefectos()
  {
  
    this.subtotalDefectos = Number(this.formDefectos.controls['tasa'].value) * Number(this.formDefectos.controls['intensidad'].value);
    this.formDefectos.controls['subtotal'].setValue(this.subtotalDefectos.toFixed(2));
    this. calcularPuntajeFinal();

  }

  calcularPuntajeFinal()
  {
    const subTotalSensorial = this.formControlCalidad.controls['SubToTalSensorial'].value;
    const totalAnalisisSensorial = subTotalSensorial - this.subtotalDefectos;
   this.formDefectos.controls['puntajeFinal'].setValue(totalAnalisisSensorial.toFixed(2));
  }

  actualizarAnalisisControlCalidad(e) {
    const form = this;
    swal.fire({
      title: 'Confirmación',
      text: `¿Está seguro de actualizar el análisis de control de calidad?`,
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
    }).then(function (result) {
      if (result.value) {
        form.modificarAnalisisControlCalidad();
      }
    });
  }

  modificarAnalisisControlCalidad() {
    if (this.formControlCalidad.invalid || this.errorGeneral.isError || this.error.isError || this.tableSensorialRanking.invalid) {
      this.submitted = true;
      this.alertUtil.alertWarning('Advertencia', 'Por favor completar todos los campos obligatorios.');
      return;
    }
    else {

      let listaDetalleOlor = Array<AnalisisFisicoOlorDetalleList>();
      let listaDetalleColor = Array<AnalisisFisicoColorDetalleList>();
      let listaDefectosPrimarios = Array<AnalisisFisicoDefectoPrimarioDetalleList>();
      let listaDefectosSecundarios = Array<AnalisisFisicoDefectoSecundarioDetalleList>();
      let listaRegistroTostado = Array<RegistroTostadoIndicadorDetalleList>();
      let listaAnalisisSensorialDefectos = Array<AnalisisSensorialDefectoDetalleList>();
      let listaAnalisisSensorialAtrib = Array<AnalisisSensorialAtributoDetalleList>();
      var controlFormControlCalidad = this.formControlCalidad.controls;
      var controlDefectos = this.formDefectos.controls;
      listaDetalleOlor = this.obtenerDetalleAnalisisFisicoOlor(this.tableOlor);
      listaDetalleColor = this.obtenerDetalleAnalisisFisicoColor(this.tableColor);
      listaDefectosPrimarios = this.obtenerDetalleDefectosPrimarios(this.tableDefectosPrimarios)
      listaDefectosSecundarios = this.obtenerDetalleDefectosSecundarios(this.tableDefectosSecundarios)
      listaRegistroTostado = this.obtenerRegistroTostado(this.tableRegistroTostado);
      listaAnalisisSensorialDefectos = this.obtenerAnalisisSensorialDefectos(this.tableSensorialDefectos)
      listaAnalisisSensorialAtrib = this.obtenerAnalisisSensorialAtributos(this.tableSensorialRanking);
      this.reqControlCalidad = new ReqControlCalidad(
        this.login.Result.Data.EmpresaId,
        this.detalle.ControlCalidadPlantaId,
        Number(controlFormControlCalidad["cantidadControlCalidad"].value),
        Number(controlFormControlCalidad["pesoBrutoControlCalidad"].value),
        Number(controlFormControlCalidad["taraControlCalidad"].value),
        Number(controlFormControlCalidad["kilosNetosControlCalidad"].value),
        String(controlFormControlCalidad["tipo"].value),
        String(controlFormControlCalidad["empaque"].value),

        Number(controlFormControlCalidad["humedad"].value),
        this.login.Result.Data.NombreUsuario,
        this.detalle.GuiaRecepcionMateriaPrimaId ? Number(this.detalle.GuiaRecepcionMateriaPrimaId) : null,
        this.detalle.NotaSalidaAlmacenId ? Number(this.detalle.NotaSalidaAlmacenId) : null,
        this.detalle.LoteId ? Number(this.detalle.LoteId) : null,
        this.detalle.NotaIngresoPlantaId ? Number(this.detalle.NotaIngresoPlantaId) : null,
        this.detalle.OrdenServicioControlCalidadId ? Number(this.detalle.OrdenServicioControlCalidadId) : null,
        controlFormControlCalidad["ObservacionAnalisisFisico"].value,
        listaDetalleOlor,
        listaDetalleColor,
        Number(controlFormControlCalidad["exportGramos"].value),
        Number((controlFormControlCalidad["exportPorcentaje"].value).split("%")[0]),
        Number(controlFormControlCalidad["descarteGramos"].value),
        Number((controlFormControlCalidad["descartePorcentaje"].value).split("%")[0]),
        Number(controlFormControlCalidad["cascarillaGramos"].value),
        Number((controlFormControlCalidad["cascarillaPorcentaje"].value).split("%")[0]),
        Number(controlFormControlCalidad["totalGramos"].value),
        Number((controlFormControlCalidad["totalPorcentaje"].value).split("%")[0]),
        controlFormControlCalidad["ObservacionRegTostado"].value,
        controlFormControlCalidad["ObservacionAnalisisSensorial"].value,
        Number(controlFormControlCalidad["SubToTalSensorial"].value),
        Number(controlDefectos["tasa"].value),
        Number(controlDefectos["intensidad"].value),
        Number(controlDefectos["subtotal"].value),
        Number(controlDefectos["puntajeFinal"].value),
        listaDefectosPrimarios,
        listaDefectosSecundarios,
        listaRegistroTostado,
        listaAnalisisSensorialDefectos,
        listaAnalisisSensorialAtrib,
        Number(controlFormControlCalidad["SubToTalSensorial"].value)
      );
      let json = JSON.stringify(this.reqControlCalidad);
      this.spinner.show(undefined,
        {
          type: 'ball-triangle-path',
          size: 'medium',
          bdColor: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          fullScreen: true
        });
      if (this.form == "materiaprima") {
        this.actualizarControlCalidadMateriaPrima(this.reqControlCalidad);
      }
      else if (this.form == "lote") {
        this.actualizarControlCalidadLote(this.reqControlCalidad);

      }
      else if (this.form == "ordenServicio") {
        this.actualizarControlCalidadOrdenServicio(this.reqControlCalidad);
      }
      else if (this.form == "notaingresoplanta" || this.form == "controlcalidadplanta") {
        this.actualizarControlCalidadNotaIngresoPlanta(this.reqControlCalidad);
      }
    }
  }

  actualizarControlCalidadMateriaPrima(reqControlCalidad: any) {
    this.acopioService.Actualizar(reqControlCalidad)
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            var form = this;
            this.alertUtil.alertOkCallback('Registrado!', 'Analisis Control Calidad', function (result) {
              if (result.isConfirmed) {
                form.router.navigate(['/operaciones/guiarecepcionmateriaprima-list']);
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

  actualizarControlCalidadNotaIngresoPlanta(reqControlCalidad: any) {
    this.notaIngresoPlantaService.ActualizarAnalisisCalidad(reqControlCalidad)
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            var form = this;
            this.alertUtil.alertOkCallback('Registrado!', 'Analisis Control Calidad', function (result) {
              if (result.isConfirmed) {
                form.router.navigate(['/planta/operaciones/controlcalidad-list']);
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
  actualizarControlCalidadLote(reqControlCalidad: any) {
    var form = this;
    form.loteService.ActualizarAnalisisCalidad(reqControlCalidad)
      .subscribe(res => {
        form.spinner.hide();
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {

            form.alertUtil.alertOkCallback('Registrado!', 'Analisis Control Calidad', function (result) {
              if (result.isConfirmed) {
                form.router.navigate(['/operaciones/lotes-list']);
              }
            }
            );
          } else if (res.Result.Message != "" && res.Result.ErrCode != "") {
            form.errorGeneral = { isError: true, errorMessage: res.Result.Message };
          } else {
            form.errorGeneral = { isError: true, errorMessage: this.mensajeErrorGenerico };
          }
        } else {
          return form.errorGeneral = { isError: true, errorMessage: this.mensajeErrorGenerico };
        }
      },
        err => {
          form.spinner.hide();
          console.log(err);
          form.errorGeneral = { isError: true, errorMessage: this.mensajeErrorGenerico };
        }
      );
  }

  actualizarControlCalidadOrdenServicio(reqControlCalidad: any) {
    this.ordenServicio.ActualizarAnalisisCalidad(reqControlCalidad)
      .subscribe(res => {
        this.spinner.hide();
        if (res.Result.Success) {
          if (res.Result.ErrCode == "") {
            var form = this;
            this.alertUtil.alertOkCallback('Registrado!', 'Analisis Control Calidad', function (result) {
              if (result.isConfirmed) {
                form.router.navigate(['/operaciones/orderservicio-controlcalidadexterna-list']);
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


  obtenerDetalleAnalisisFisicoOlor(tableOlor) {
    let result: any[];
    let listDetalleOlor = new Array<AnalisisFisicoOlorDetalleList>();
    result = this.obtenerValues(tableOlor);
    var list = this.mergeById(this.listaOlor, result)
    for (let item in list) {
      var detalleOlor = new AnalisisFisicoOlorDetalleList();

      detalleOlor.Valor = list[Number(item)].valor ? list[Number(item)].valor : false;
      detalleOlor.OlorDetalleId = list[Number(item)].Codigo;
      detalleOlor.OlorDetalleDescripcion = list[Number(item)].Label;
      listDetalleOlor.push(detalleOlor);

    }
    return listDetalleOlor;
  }

  obtenerDetalleAnalisisFisicoColor(tableColor) {
    let result: any[];
    let listDetalleColor = new Array<AnalisisFisicoColorDetalleList>();
    result = this.obtenerValues(tableColor);
    var list = this.mergeById(this.listaColor, result)
    for (let item in list) {

      var detalleColor = new AnalisisFisicoColorDetalleList();
      detalleColor.Valor = list[Number(item)].valor ? list[Number(item)].valor : false;
      detalleColor.ColorDetalleId = list[Number(item)].Codigo;
      detalleColor.ColorDetalleDescripcion = list[Number(item)].Label;
      listDetalleColor.push(detalleColor);

    }
    return listDetalleColor;
  }
  obtenerDetalleDefectosPrimarios(tableDefectosPrimarios) {
    let result: any[];
    let listDetalleDefectosPrimarios = new Array<AnalisisFisicoDefectoPrimarioDetalleList>();
    result = this.obtenerValues(tableDefectosPrimarios);
    var list = this.mergeById(this.listaDefectosPrimarios, result)
    for (let item in list) {

      var detalleDefectoPrimario = new AnalisisFisicoDefectoPrimarioDetalleList();
      detalleDefectoPrimario.Valor = list[Number(item)].valor != null && list[Number(item)].valor != "" ? Number(list[Number(item)].valor) : null;
      detalleDefectoPrimario.DefectoDetalleDescripcion = list[Number(item)].Label;
      detalleDefectoPrimario.DefectoDetalleEquivalente = list[Number(item)].Val1;
      detalleDefectoPrimario.DefectoDetalleId = list[Number(item)].Codigo;
      listDetalleDefectosPrimarios.push(detalleDefectoPrimario);



    }
    return listDetalleDefectosPrimarios;
  }

  obtenerDetalleDefectosSecundarios(tableDefectosSecundarios) {
    let result: any[];
    let listDetalleDefectosSecundarios = new Array<AnalisisFisicoDefectoSecundarioDetalleList>();

    result = this.obtenerValues(tableDefectosSecundarios);
    var list = this.mergeById(this.listaDefectosSecundarios, result)
    for (let item in list) {

      var detalleDefectoSecundario = new AnalisisFisicoDefectoSecundarioDetalleList();
      detalleDefectoSecundario.Valor = list[Number(item)].valor != null && list[Number(item)].valor != "" ? Number(list[Number(item)].valor) : null;
      detalleDefectoSecundario.DefectoDetalleDescripcion = list[Number(item)].Label;
      detalleDefectoSecundario.DefectoDetalleEquivalente = list[Number(item)].Val1;
      detalleDefectoSecundario.DefectoDetalleId = list[Number(item)].Codigo;
      listDetalleDefectosSecundarios.push(detalleDefectoSecundario);


    }
    return listDetalleDefectosSecundarios;
  }

  obtenerAnalisisSensorialAtributos(tableSensorialRanking) {
    let result: any[];
    let listAnalisisAtributos = new Array<AnalisisSensorialAtributoDetalleList>();
    result = this.obtenerValuesAtrib(tableSensorialRanking);
    var list = this.mergeById(this.listaSensorialAtributos, result)
    for (let item in list) {

      var detalleAtributo = new AnalisisSensorialAtributoDetalleList();
      detalleAtributo.Valor = list[Number(item)].valor != null && list[Number(item)].valor != "" ? Number(list[Number(item)].valor) : null;
      detalleAtributo.AtributoDetalleDescripcion = list[Number(item)].Label;
      detalleAtributo.AtributoDetalleId = list[Number(item)].Codigo;
      listAnalisisAtributos.push(detalleAtributo);


    }
    return listAnalisisAtributos;
  }
  obtenerAnalisisSensorialDefectos(tableSensorialDefectos) {
    let result: any[];
    let listAnalisisDefectos = new Array<AnalisisSensorialDefectoDetalleList>();

    result = this.obtenerValues(tableSensorialDefectos);
    var list = this.mergeById(this.listaSensorialDefectos, result)
    for (let item in list) {

      var detalleDefectos = new AnalisisSensorialDefectoDetalleList();
      detalleDefectos.Valor = list[Number(item)].valor ? list[Number(item)].valor : false;
      detalleDefectos.DefectoDetalleDescripcion = list[Number(item)].Label;
      detalleDefectos.DefectoDetalleId = list[Number(item)].Codigo;
      listAnalisisDefectos.push(detalleDefectos);

    }
    return listAnalisisDefectos;
  }

  obtenerRegistroTostado(tableRegistroTostado) {
    let result: any[];
    let listRegistroTostado = new Array<RegistroTostadoIndicadorDetalleList>();

    result = this.obtenerValues(tableRegistroTostado);
    var list = this.mergeById(this.listaIndicadorTostado, result)
    for (let item in list) {
      var detalleRegistroTostado = new RegistroTostadoIndicadorDetalleList();
      detalleRegistroTostado.Valor = list[Number(item)].valor != null && list[Number(item)].valor != "" ? Number(list[Number(item)].valor) : null;
      detalleRegistroTostado.IndicadorDetalleDescripcion = list[Number(item)].Label;
      detalleRegistroTostado.IndicadorDetalleId = list[Number(item)].Codigo;
      listRegistroTostado.push(detalleRegistroTostado);
    }
    return listRegistroTostado;
  }
  calcularTotalesRendExportable() {
    if (this.formControlCalidad.controls["exportGramos"].value == null && this.formControlCalidad.controls["descarteGramos"].value == null &&
      this.formControlCalidad.controls["cascarillaGramos"].value == null) {
      this.formControlCalidad.controls['totalPorcentaje'].setValue(0 + "%");
      this.formControlCalidad.controls['totalGramos'].setValue(0);
      this.formControlCalidad.controls['cascarillaPorcentaje'].setValue(0 + "%");
      this.formControlCalidad.controls['exportPorcentaje'].setValue(0 + "%");
      this.formControlCalidad.controls['descartePorcentaje'].setValue(0 + "%");
    }
    else {
      
      const exportGramos = Number(this.formControlCalidad.controls["exportGramos"].value);
      const descarteGramos = Number(this.formControlCalidad.controls["descarteGramos"].value);
      var cascarillaGramos = 0 ;
      if (this.page == "ControlCalidadPlantaEdit")
      {
        cascarillaGramos = this.calculocascarilla-exportGramos - descarteGramos;
        this.formControlCalidad.controls["cascarillaGramos"].setValue(cascarillaGramos);
      }      
      
      const totalRendExportable = exportGramos + descarteGramos + cascarillaGramos;
      this.formControlCalidad.controls['totalGramos'].setValue(totalRendExportable);
      this.formControlCalidad.controls['cascarillaPorcentaje'].setValue(cascarillaGramos == 0 ? "0%" : (Number(cascarillaGramos / totalRendExportable) * 100).toFixed(2) + "%");
      this.formControlCalidad.controls['exportPorcentaje'].setValue(exportGramos == 0 ? "0%" : (Number(exportGramos / totalRendExportable) * 100).toFixed(2) + "%");
      this.formControlCalidad.controls['descartePorcentaje'].setValue(descarteGramos == 0 ? "0%" : (Number(descarteGramos / totalRendExportable) * 100).toFixed(2) + "%");
      const cascarillaPorcentaje = this.formControlCalidad.controls["cascarillaPorcentaje"].value;
      const exportPorcentaje = this.formControlCalidad.controls["exportPorcentaje"].value;
      const descartePorcentaje = this.formControlCalidad.controls["descartePorcentaje"].value;
      const totalPorcentaje = Number(cascarillaPorcentaje.slice(0, cascarillaPorcentaje.length - 1)) + Number(exportPorcentaje.slice(0, exportPorcentaje.length - 1)) + Number(descartePorcentaje.slice(0, descartePorcentaje.length - 1));

      this.formControlCalidad.controls['totalPorcentaje'].setValue(Math.round(totalPorcentaje) + "%");

    }
  }

  mergeById(array1, array2) {
    return array1.map(itm => ({
      ...array2.find((item) => (item.Codigo === itm.Codigo) && item),
      ...itm
    }));
  }

  obtenerValues(table) {
    let result: any[];
    result = [];
    for (let key in table.value) {
      result.push({ Codigo: key.split("%")[1], valor: table.value[key] })
    }
    return result;
  }
  obtenerValuesAtrib(table) {
    let result: any[], key;
    result = [];
    for (key in table.value) {
      if (key.split("%")[0] != "sensorialAtribRanking") {
        result.push({ Codigo: key.split("%")[1], valor: table.value[key] })
      }
    }
    return result;
  }


  obtenerDetalle() {

    this.desactivarControlesPlanta();
    var form = this;
    let subToTalSensorial: number = 0;
    var controlFormControlCalidad = this.formControlCalidad.controls;
    var controlDefectos = this.formDefectos.controls;
   
  

    controlFormControlCalidad["cantidadControlCalidad"].setValue(this.detalle.CantidadControlCalidad);
    controlFormControlCalidad["pesoBrutoControlCalidad"].setValue(this.detalle.PesoBrutoControlCalidad);
    controlFormControlCalidad["taraControlCalidad"].setValue(this.detalle.TaraControlCalidad);
    controlFormControlCalidad["kilosNetosControlCalidad"].setValue(this.detalle.KilosNetosControlCalidad);
    controlFormControlCalidad["tipo"].setValue(this.detalle.ControlCalidadTipoId);
    controlFormControlCalidad["empaque"].setValue(this.detalle.ControlCalidadEmpaqueId);
    ///Ddddddddddddddddddd

    controlFormControlCalidad["exportGramos"].setValue(this.detalle.ExportableGramosAnalisisFisico);
    controlFormControlCalidad["exportPorcentaje"].setValue(this.detalle.ExportablePorcentajeAnalisisFisico == null ? "" : this.detalle.ExportablePorcentajeAnalisisFisico + "%");
    controlFormControlCalidad["descarteGramos"].setValue(this.detalle.DescarteGramosAnalisisFisico);
    controlFormControlCalidad["descartePorcentaje"].setValue(this.detalle.DescartePorcentajeAnalisisFisico == null ? "" : this.detalle.DescartePorcentajeAnalisisFisico + "%");
    controlFormControlCalidad["cascarillaGramos"].setValue(this.detalle.CascarillaGramosAnalisisFisico);
    controlFormControlCalidad["cascarillaPorcentaje"].setValue(this.detalle.CascarillaPorcentajeAnalisisFisico == null ? "" : this.detalle.CascarillaPorcentajeAnalisisFisico + "%");
    controlFormControlCalidad["totalGramos"].setValue(this.detalle.TotalGramosAnalisisFisico);
    controlFormControlCalidad["totalPorcentaje"].setValue(this.detalle.TotalPorcentajeAnalisisFisico == null ? "" : this.detalle.TotalPorcentajeAnalisisFisico + "%");
    controlFormControlCalidad["humedad"].setValue(this.detalle.HumedadPorcentajeAnalisisFisico);
    controlFormControlCalidad["ObservacionAnalisisFisico"].setValue(this.detalle.ObservacionAnalisisFisico);
    controlFormControlCalidad["ObservacionRegTostado"].setValue(this.detalle.ObservacionRegistroTostado);
    controlFormControlCalidad["ObservacionAnalisisSensorial"].setValue(this.detalle.ObservacionAnalisisSensorial);
    controlDefectos["tasa"].setValue(this.detalle.Taza);
    controlDefectos["intensidad"].setValue(this.detalle.Intensidad);
    form.responsable = this.detalle.UsuarioCalidad;
    if (this.detalle.FechaCalidad) {
      form.fechaCalidad = form.dateUtil.formatDate(new Date(this.detalle.FechaCalidad), "/");
    }

    if (this.detalle.AnalisisFisicoColorDetalle != null) {
      let analisisFisicoColorDetalleList: AnalisisFisicoColorDetalleList[] = this.detalle.AnalisisFisicoColorDetalle;
      analisisFisicoColorDetalleList.forEach(function (value) {
        form.tableColor.controls["CheckboxColor%" + value.ColorDetalleId].setValue(value.Valor);
      });
    }

    if (this.detalle.AnalisisFisicoOlorDetalle != null) {
      let analisisFisicoOlorDetalleList: AnalisisFisicoOlorDetalleList[] = this.detalle.AnalisisFisicoOlorDetalle;
      analisisFisicoOlorDetalleList.forEach(function (value) {
        form.tableOlor.controls["CheckboxOlor%" + value.OlorDetalleId].setValue(value.Valor);
      });
    }

    if (this.detalle.AnalisisFisicoDefectoPrimarioDetalle != null) {
      let analisisFisicoDefectoPrimarioDetalleList: AnalisisFisicoDefectoPrimarioDetalleList[] = this.detalle.AnalisisFisicoDefectoPrimarioDetalle;
      analisisFisicoDefectoPrimarioDetalleList.forEach(function (value) {
        form.tableDefectosPrimarios.controls["DefPrimario%" + value.DefectoDetalleId].setValue(value.Valor);
      });
    }

    if (this.detalle.AnalisisFisicoDefectoSecundarioDetalle != null) {
      let analisisFisicoDefectoSecundarioDetalleList: AnalisisFisicoDefectoSecundarioDetalleList[] = this.detalle.AnalisisFisicoDefectoSecundarioDetalle;
      analisisFisicoDefectoSecundarioDetalleList.forEach(function (value) {
        form.tableDefectosSecundarios.controls["DefSecundarios%" + value.DefectoDetalleId].setValue(value.Valor);
      });
    }

    if (this.detalle.AnalisisSensorialAtributoDetalle != null) {
      let analisisSensorialAtributoDetalleList: AnalisisSensorialAtributoDetalleList[] = this.detalle.AnalisisSensorialAtributoDetalle;
      analisisSensorialAtributoDetalleList.forEach(function (value) {
        subToTalSensorial = subToTalSensorial + value.Valor;
        form.tableSensorialRanking.controls["sensorialAtrib%" + value.AtributoDetalleId].setValue(value.Valor);
        form.tableSensorialRanking.controls["sensorialAtribRanking%" + value.AtributoDetalleId].setValue(form.evaluar(value.Valor));
      });
    }

    if (this.detalle.AnalisisSensorialDefectoDetalle != null) {
      let analisisSensorialDefectoDetalleList: AnalisisSensorialDefectoDetalleList[] = this.detalle.AnalisisSensorialDefectoDetalle;
      analisisSensorialDefectoDetalleList.forEach(function (value) {
        form.tableSensorialDefectos.controls["checkboxSenDefectos%" + value.DefectoDetalleId].setValue(value.Valor);
      });
    }

    if (this.detalle.RegistroTostadoIndicadorDetalle != null) {
      let registroTostadoIndicadorDetalleList: RegistroTostadoIndicadorDetalleList[] = this.detalle.RegistroTostadoIndicadorDetalle;
      registroTostadoIndicadorDetalleList.forEach(function (value) {
        form.tableRegistroTostado.controls["tostado%" + value.IndicadorDetalleId].setValue(value.Valor);

      });
    }
    var redondear = subToTalSensorial.toFixed(2)
    controlFormControlCalidad["SubToTalSensorial"].setValue(redondear);
    this.calcularSubTotalDefectos();
    this.desactivarControles(this.detalle.EstadoId, this.detalle.UsuarioCalidad);
  }

  desactivarControlesPlanta ()
  {
    if (this.page == "NotaIngresoPlantaEdit" || this.page == "ControlCalidadPlantaEdit")
    {
      this.formControlCalidad.controls["cascarillaGramos"].disable();
    }
  }
  desactivarControles(estado: string, usuarioAnalizado: string) {
    var usuarioLogueado = this.login.Result.Data.NombreUsuario
    if (estado == this.estadoAnalizado && usuarioAnalizado == usuarioLogueado) {


      //Calidad Editable
      //NotaCompra Editable
    } else if (estado == this.estadoAnalizado && usuarioAnalizado != usuarioLogueado) {


      //Calidad ReadOnly
      this.formControlCalidad.disable();
      this.btnGuardarCalidad = false;
      //NotaCompra Editable
    } else if (estado == this.estadoAnulado || estado == this.estadoEnviadoAlmacen) {


      //Calidad ReadOnly
      this.formControlCalidad.disable();
      this.btnGuardarCalidad = false;
      //NotaCompra ReadOnly
    }

  }

  cancelar() {
    if (this.form == "materiaprima") {
      this.router.navigate(['/operaciones/guiarecepcionmateriaprima-list']);
    }
    else if (this.form == "lote") {
      this.router.navigate(['/acopio/operaciones/lotes-list']);
    }
    else if (this.form == "ordenServicio") {
      this.router.navigate(['/acopio/operaciones/orderservicio-controlcalidadexterna-list']);
    }
    else if (this.form == "notaingresoplanta") {
      this.router.navigate(['/planta/operaciones/notaingreso-list']);
    }
    else if (this.form == "controlcalidadplanta") {
      this.router.navigate(['/planta/operaciones/controlcalidad-list']);
    }
  }
}
