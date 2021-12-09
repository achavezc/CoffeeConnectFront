import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { Router, ActivatedRoute } from '@angular/router';
import swal from 'sweetalert2';
import { MaestroUtil } from '../../../../../../../services/util/maestro-util';
import { DateUtil } from '../../../../../../../services/util/date-util';
import { AlertUtil } from '../../../../../../../services/util/alert-util';
import { SocioFincaService } from '../../../../../../../services/socio-finca.service';
import { ProductorFincaService } from '../../../../../../../services/productor-finca.service';
import { MaestroService } from '../../../../../../../services/maestro.service';
import { number } from 'ngx-custom-validators/src/app/number/validator';

@Component({
  selector: 'app-finca-edit',
  templateUrl: './finca-edit.component.html',
  styleUrls: ['./finca-edit.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FincaEditComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private dateUtil: DateUtil,
    private spinner: NgxSpinnerService,
    private alertUtil: AlertUtil,
    private router: Router,
    private maestroUtil: MaestroUtil,
    private socioFincaService: SocioFincaService,
    private route: ActivatedRoute,
    private maestroService: MaestroService,
    private productorFincaService: ProductorFincaService) { }

  socioFincaEditForm: FormGroup;
  listFincas: any[];
  listEstados: any[];
  selectedFinca: any;
  selectedEstado: any;
  codeFincaPartner: number;

  listDepartamentos: any[];
  listProvincias: any[];
  listFuentesEnergia: any[];
  listDistritos: any[];
  listFuentesAgua: any[];
  listMaterialVivienda: any[];
  listZonas: any[];
  listInternet: any[];
  listSenialTelefonica: any[];
  listEstableSalud: any[];
  listFlagsCentroEducativo: any[];
  listCentrosEducativos: any[];
  listVariedad: any[];
  selectedDepartamento: any;
  selectedProvincia: any;
  selectedFuenteEnergia: any;
  selectedDistrito: any;
  selectedFuenteAgua: any;
  selectedMaterialVivienda: any;
  selectedVariedad: any;
  
  selectedZona: any;
  selectedInternet: any;
  selectedSenialTelefonica: any;
  selectedEstableSalud: any;
  selectedFlagCentroEdu: any;
  selectedCentroEdu: any;


  objParams: any;
  vMsgErrGenerico = "Ha ocurrido un error interno.";
  vSessionUser: any;
  selected = [];
  rows = [];
  tempRows = [];
  @ViewChild(DatatableComponent) table: DatatableComponent;
  codePartner: Number;
  codeProducer: Number;
  nameProductor: any;
  ngOnInit(): void {
    this.codePartner = this.route.snapshot.params['partner'] ? parseInt(this.route.snapshot.params['partner']) : 0
    this.codeProducer = this.route.snapshot.params['producer'] ? parseInt(this.route.snapshot.params['producer']) : 0
    this.codeFincaPartner = this.route.snapshot.params['fincapartner'] ? parseInt(this.route.snapshot.params['fincapartner']) : 0
    this.nameProductor = this.route.snapshot.params['title'];
    this.vSessionUser = JSON.parse(localStorage.getItem('user'));
    this.LoadForm();
    this.LoadCombos();
    if (this.codeFincaPartner > 0) {
      this.SearchById();
    } else {
      this.GetFincas(this.codeProducer);
    }
    // this.route.queryParams.subscribe((params) => {
    //   this.objParams = params;
    //   this.LoadForm();
    //   if (params) {
    //     this.GetEstados();
    //     if (this.vId > 0) {
    //       this.SearchById();
    //     } else {
    //       this.GetFincas(parseInt(params.idProductor));
    //     }
    //   }
    // });
  }

  LoadForm(): void {
    this.socioFincaEditForm = this.fb.group({
      idSocio: [],
      idSocioFinca: [],
      finca: [, [Validators.required]],
      viasAcceso: [''],
      distanciaKM: [],
      tiempoTotal: [],
      medioTransporte: [''],
      cultivo: [''],
      precipitacion: [''],
      nroPersonalCosecha: [],
      nombreSocio: [],

      idProductorFinca: [],
      idProductor: [],
      nombreFinca: ['', []],

      latitud: [],
      direccion: ['', []],
      longitud: [],
      departamento: ['', []],
      altitud: [],
      provincia: ['', []],
      fuenteEnergia: [],
      distrito: ['', []],
      fuenteAgua: [],
      zona: ['', []],
      nroAnimalesMenores: [],
      materialVivienda: [],
      fInternet: [],
      suelo: [],
      senialTelefonica: [],
      establecimientoSalud: [],
      tiempoUnidadCentroSalud: [],
      fCentroEducativo: [],
      centroEducativo: [],
      estado: ['', []],

      latitud2: [],
      longitud2: [],

      areaTotal: [],
      areaCafe: [],
      crecimiento: [],
      bosque: [],
      purma: [],
      panLlevar: [],
      vivienda: []


    });

    this.socioFincaEditForm.controls["nombreSocio"].setValue(this.nameProductor);
    this.socioFincaEditForm.controls["nombreSocio"].disable();

    this.socioFincaEditForm.controls["latitud"].disable();
    this.socioFincaEditForm.controls["direccion"].disable();
    this.socioFincaEditForm.controls["longitud"].disable();
    this.socioFincaEditForm.controls["departamento"].disable();
    this.socioFincaEditForm.controls["altitud"].disable();
    this.socioFincaEditForm.controls["provincia"].disable();
    this.socioFincaEditForm.controls["fuenteEnergia"].disable();
    this.socioFincaEditForm.controls["distrito"].disable();

    this.socioFincaEditForm.controls["fuenteAgua"].disable();
    this.socioFincaEditForm.controls["zona"].disable();
    this.socioFincaEditForm.controls["nroAnimalesMenores"].disable();
    this.socioFincaEditForm.controls["materialVivienda"].disable();
    this.socioFincaEditForm.controls["fInternet"].disable();
    this.socioFincaEditForm.controls["suelo"].disable();

    
    this.socioFincaEditForm.controls["senialTelefonica"].disable();
    this.socioFincaEditForm.controls["establecimientoSalud"].disable();
    this.socioFincaEditForm.controls["tiempoUnidadCentroSalud"].disable();
    this.socioFincaEditForm.controls["fCentroEducativo"].disable();
    this.socioFincaEditForm.controls["centroEducativo"].disable();
    this.socioFincaEditForm.controls["estado"].disable();
  
  }

  async GetDepartments() {
    this.listDepartamentos = [];
    const res: any = await this.maestroUtil.GetDepartmentsAsync('PE');
    if (res.Result.Success) {
      this.listDepartamentos = res.Result.Data;
    }
  }
  onChangeFinca(event: any): void {
    this.SearchProducerFincaById(event.ProductorFincaId);
  }
  SearchProducerFincaById(idProductorFinca): void {
    this.spinner.show();
    this.productorFincaService.SearcById({ ProductorFincaId: idProductorFinca })
      .subscribe((res: any) => {
        if (res.Result.Success) {
          this.AutocompleteFormProductor(res.Result.Data);
        }
      }, (err: any) => {
        console.log(err);
      });
  }
  async AutocompleteFormProductor(data: any) {
    this.socioFincaEditForm.controls.idProductorFinca.setValue(data.ProductorFincaId);
    //this.FincaId = data.ProductorFincaId
    this.socioFincaEditForm.controls.idProductor.setValue(data.ProductorId);
    this.socioFincaEditForm.controls.nombreFinca.setValue(data.Nombre);
    if (data.Latitud) {
      this.socioFincaEditForm.controls.latitud.setValue(data.Latitud);
    }
    this.socioFincaEditForm.controls.direccion.setValue(data.Direccion);
    if (data.Longuitud) {
      this.socioFincaEditForm.controls.longitud.setValue(data.Longuitud);
    }
    await this.GetDepartments();
    this.socioFincaEditForm.controls.departamento.setValue(data.DepartamentoId);
    if (data.Altitud) {
      this.socioFincaEditForm.controls.altitud.setValue(data.Altitud);
    }
    await this.GetProvincias();
    this.socioFincaEditForm.controls.provincia.setValue(data.ProvinciaId);
    if (data.FuenteEnergiaId)
      this.socioFincaEditForm.controls.fuenteEnergia.setValue(data.FuenteEnergiaId);
    await this.GetDistritos();
    this.socioFincaEditForm.controls.distrito.setValue(data.DistritoId);
    if (data.FuenteAguaId)
      this.socioFincaEditForm.controls.fuenteAgua.setValue(data.FuenteAguaId);
    if (data.ZonaId) {
      await this.GetZonas();
      if (this.listZonas.length > 0) {
        this.socioFincaEditForm.controls.zona.setValue(data.ZonaId);
      }
    }
    if (data.CantidadAnimalesMenores)
      this.socioFincaEditForm.controls.nroAnimalesMenores.setValue(data.CantidadAnimalesMenores);
    if (data.MaterialVivienda)
      this.socioFincaEditForm.controls.materialVivienda.setValue(data.MaterialVivienda);
    if (data.InternetId)
      this.socioFincaEditForm.controls.fInternet.setValue(data.InternetId);
    if (data.Suelo)
      this.socioFincaEditForm.controls.suelo.setValue(data.Suelo);
    if (data.SenialTelefonicaId)
      this.socioFincaEditForm.controls.senialTelefonica.setValue(data.SenialTelefonicaId);
    if (data.EstablecimientoSaludId)
      this.socioFincaEditForm.controls.establecimientoSalud.setValue(data.EstablecimientoSaludId);
    if (data.TiempoTotalEstablecimientoSalud)
      this.socioFincaEditForm.controls.tiempoUnidadCentroSalud.setValue(data.TiempoTotalEstablecimientoSalud);
    if (data.CentroEducativoId)
      this.socioFincaEditForm.controls.fCentroEducativo.setValue(data.CentroEducativoId);
    if (data.CentroEducativoNivel)
      this.socioFincaEditForm.controls.centroEducativo.setValue(data.CentroEducativoNivel.split('|').map(String));
    if (data.EstadoId) {
      this.socioFincaEditForm.controls.estado.setValue(data.EstadoId);
    }
    if (data.LatitudDms) {
      this.socioFincaEditForm.controls.latitud2.setValue(data.LatitudDms);
    }
    if (data.LonguitudDms) {
      this.socioFincaEditForm.controls.longitud2.setValue(data.LonguitudDms);
    }
   
    if (data.NombreProductor) {
      this.socioFincaEditForm.controls.nombreSocio.setValue(data.NombreProductor);
    }
    this.spinner.hide();
  }
  async GetProvincias() {
    this.listProvincias = [];
    const res: any = await this.maestroUtil.GetProvincesAsync(this.selectedDepartamento, 'PE');
    if (res.Result.Success) {
      this.listProvincias = res.Result.Data;
    }
  }

  async GetDistritos() {
    this.listDistritos = [];
    const res: any = await this.maestroUtil.GetDistrictsAsync(this.selectedDepartamento, this.selectedProvincia, 'PE');
    if (res.Result.Success) {
      this.listDistritos = res.Result.Data;
    }
  }

  async GetZonas() {
    this.listZonas = [];
    const res: any = await this.maestroUtil.GetZonasAsync(this.selectedDistrito);
    if (res.Result.Success) {
      this.listZonas = res.Result.Data;
    }
  }

  async LoadCombos() {
    let res: any = {};
    this.GetDepartments();
    res = await this.maestroService.obtenerMaestros('NivelEducativo').toPromise();
    if (res.Result.Success) {
      this.listCentrosEducativos = res.Result.Data;
    }

    res = await this.maestroService.obtenerMaestros('EstadoMaestro').toPromise();
    if (res.Result.Success) {
      this.listEstados = res.Result.Data;
      if (this.codeFincaPartner <= 0) {
        this.socioFincaEditForm.controls.estado.setValue('01');
      }
    }

    res = await this.maestroService.obtenerMaestros('FuenteEnergia').toPromise();
    if (res.Result.Success) {
      this.listFuentesEnergia = res.Result.Data;
    }

    res = await this.maestroService.obtenerMaestros('FuenteAgua').toPromise();
    if (res.Result.Success) {
      this.listFuentesAgua = res.Result.Data;
    }

    res = await this.maestroService.obtenerMaestros('MaterialVivienda').toPromise();
    if (res.Result.Success) {
      this.listMaterialVivienda = res.Result.Data;
    }

    res = await this.maestroService.obtenerMaestros('SiNo').toPromise();
    if (res.Result.Success) {
      this.listInternet = res.Result.Data;
      this.listEstableSalud = res.Result.Data;
      this.listFlagsCentroEducativo = res.Result.Data;
    }

    res = await this.maestroService.obtenerMaestros('ProveedorTelefonia').toPromise();
    if (res.Result.Success) {
      this.listSenialTelefonica = res.Result.Data;
    }

    res = await this.maestroService.obtenerMaestros('VariedadCafe').toPromise();
    if (res.Result.Success) {
      this.listVariedad = res.Result.Data;
    }
  }

  
  onChangeDepartament(event: any): void {
    this.spinner.show();
    const form = this;
    this.listProvincias = [];
    this.listDistritos = [];
    this.listZonas = [];
    this.socioFincaEditForm.controls.distrito.reset();
    this.socioFincaEditForm.controls.zona.reset();
    this.socioFincaEditForm.controls.provincia.reset();
    this.maestroUtil.GetProvinces(event.Codigo, event.CodigoPais, (res: any) => {
      if (res.Result.Success) {
        form.listProvincias = res.Result.Data;
        this.spinner.hide();
      }
    });
  }

  onChangeProvince(event: any): void {
    this.spinner.show();
    const form = this;
    this.listDistritos = [];
    this.listZonas = [];
    this.socioFincaEditForm.controls.distrito.reset();
    this.socioFincaEditForm.controls.zona.reset();
    this.maestroUtil.GetDistricts(this.selectedDepartamento, event.Codigo, event.CodigoPais,
      (res: any) => {
        if (res.Result.Success) {
          form.listDistritos = res.Result.Data;
          this.spinner.hide();
        }
      });
  }

  onChangeDistrito(event: any): void {
    this.spinner.show();
    this.listZonas = [];
    this.socioFincaEditForm.controls.zona.reset();
    this.maestroUtil.GetZonas(event.Codigo, (res: any) => {
      if (res.Result.Success) {
        this.listZonas = res.Result.Data;
        this.spinner.hide();
      }
    });
  }


  get f() {
    return this.socioFincaEditForm.controls;
  }

  async GetEstados() {
    this.listEstados = [];
    const res = await this.maestroService.obtenerMaestros('EstadoMaestro').toPromise();
    if (res.Result.Success) {
      this.listEstados = res.Result.Data;
      if (!this.codeFincaPartner || this.codeFincaPartner <= 0) {
        this.socioFincaEditForm.controls.estado.setValue('01');
      }
    }
  }

  async GetFincas(id: Number) {
    this.listFincas = [];
    const res = await this.productorFincaService.SearchProducerById({ ProductorId: id }).toPromise();
    if (res.Result.Success) {
      this.listFincas = res.Result.Data;
    }
  }

  SearchById(): void {
    this.spinner.show();
    this.socioFincaService.SearchById({ SocioFincaId: this.codeFincaPartner })
      .subscribe((res: any) => {
        if (res.Result.Success) {
          this.AutocompleteDataForm(res.Result.Data);
        } else {
          this.alertUtil.alertError("ERROR!", res.Result.Message);
        }
      }, (err: any) => {
        console.log(err);
        this.spinner.hide();
        this.alertUtil.alertError("ERROR!", this.vMsgErrGenerico);
      });
  }

  async AutocompleteDataForm(data: any) {
    this.socioFincaEditForm.controls.idSocio.setValue(data.SocioId);
    this.socioFincaEditForm.controls.idProductor.setValue(data.ProductorId);
    await this.GetFincas(data.ProductorId);
    this.socioFincaEditForm.controls.finca.setValue(data.ProductorFincaId);
    if (data.ViasAccesoCentroAcopio) {
      this.socioFincaEditForm.controls.viasAcceso.setValue(data.ViasAccesoCentroAcopio);
    }
    if (data.DistanciaKilometrosCentroAcopio) {
      this.socioFincaEditForm.controls.distanciaKM.setValue(data.DistanciaKilometrosCentroAcopio);
    }
    if (data.TiempoTotalFincaCentroAcopio) {
      this.socioFincaEditForm.controls.tiempoTotal.setValue(data.TiempoTotalFincaCentroAcopio);
    }
    if (data.MedioTransporte) {
      this.socioFincaEditForm.controls.medioTransporte.setValue(data.MedioTransporte);
    }
    if (data.Cultivo) {
      this.socioFincaEditForm.controls.cultivo.setValue(data.Cultivo.split('|').map(String));
    }
    if (data.Precipitacion) {
      this.socioFincaEditForm.controls.precipitacion.setValue(data.Precipitacion);
    }
    if (data.CantidadPersonalCosecha) {
      this.socioFincaEditForm.controls.nroPersonalCosecha.setValue(data.CantidadPersonalCosecha);
    }
    await this.GetEstados();
    if (data.EstadoId) {
      this.socioFincaEditForm.controls.estado.setValue(data.EstadoId);
    }
    var lista = [];
    data.FincaEstimado.forEach(x => {
            var object = {};
            object  =   {
                    Anio : x.Anio,
                    Consumido : x.Consumido,
                    Estimado : x.Estimado,
                    ConsumidoQq :  (x.Consumido / 60).toFixed(2) ,
                    EstimadoQq : (x.Estimado / 60).toFixed(2)
                      }
            lista.push(object);
    });
    this.rows  = lista;
    this.socioFincaEditForm.controls.idProductorFinca.setValue(data.ProductorFincaId);
    this.codeFincaPartner = data.SocioFincaId;
    this.socioFincaEditForm.controls.idProductor.setValue(data.ProductorId);
    this.socioFincaEditForm.controls.nombreFinca.setValue(data.Nombre);
    if (data.Latitud) {
      this.socioFincaEditForm.controls.latitud.setValue(data.Latitud);
    }
    this.socioFincaEditForm.controls.direccion.setValue(data.Direccion);
    if (data.Longuitud) {
      this.socioFincaEditForm.controls.longitud.setValue(data.Longuitud);
    }
    await this.GetDepartments();
    this.socioFincaEditForm.controls.departamento.setValue(data.DepartamentoId);
    if (data.Altitud) {
      this.socioFincaEditForm.controls.altitud.setValue(data.Altitud);
    }
    await this.GetProvincias();
    this.socioFincaEditForm.controls.provincia.setValue(data.ProvinciaId);
    if (data.FuenteEnergiaId)
      this.socioFincaEditForm.controls.fuenteEnergia.setValue(data.FuenteEnergiaId);
    await this.GetDistritos();
    this.socioFincaEditForm.controls.distrito.setValue(data.DistritoId);
    if (data.FuenteAguaId)
      this.socioFincaEditForm.controls.fuenteAgua.setValue(data.FuenteAguaId);
    if (data.ZonaId) {
      await this.GetZonas();
      if (this.listZonas.length > 0) {
        this.socioFincaEditForm.controls.zona.setValue(data.ZonaId);
      }
    }
    if (data.CantidadAnimalesMenores)
      this.socioFincaEditForm.controls.nroAnimalesMenores.setValue(data.CantidadAnimalesMenores);
    if (data.MaterialVivienda)
      this.socioFincaEditForm.controls.materialVivienda.setValue(data.MaterialVivienda);
    if (data.InternetId)
      this.socioFincaEditForm.controls.fInternet.setValue(data.InternetId);
    if (data.Suelo)
      this.socioFincaEditForm.controls.suelo.setValue(data.Suelo);
    if (data.SenialTelefonicaId)
      this.socioFincaEditForm.controls.senialTelefonica.setValue(data.SenialTelefonicaId);
    if (data.EstablecimientoSaludId)
      this.socioFincaEditForm.controls.establecimientoSalud.setValue(data.EstablecimientoSaludId);
    if (data.TiempoTotalEstablecimientoSalud)
      this.socioFincaEditForm.controls.tiempoUnidadCentroSalud.setValue(data.TiempoTotalEstablecimientoSalud);
    if (data.CentroEducativoId)
      this.socioFincaEditForm.controls.fCentroEducativo.setValue(data.CentroEducativoId);
    if (data.CentroEducativoNivel)
      this.socioFincaEditForm.controls.centroEducativo.setValue(data.CentroEducativoNivel.split('|').map(String));
    if (data.EstadoId) {
      this.socioFincaEditForm.controls.estado.setValue(data.EstadoId);
    }
    if (data.LatitudDms) {
      this.socioFincaEditForm.controls.latitud2.setValue(data.LatitudDms);
    }
    if (data.LonguitudDms) {
      this.socioFincaEditForm.controls.longitud2.setValue(data.LonguitudDms);
    }


    if (data.AreaTotal) {
      this.socioFincaEditForm.controls.areaTotal.setValue(data.AreaTotal);
    }
    if (data.AreaCafeEnProduccion) {
      this.socioFincaEditForm.controls.areaCafe.setValue(data.AreaCafeEnProduccion);
    }
    if (data.Crecimiento) {
      this.socioFincaEditForm.controls.crecimiento.setValue(data.Crecimiento);
    }
    if (data.Bosque) {
      this.socioFincaEditForm.controls.bosque.setValue(data.Bosque);
    }
    if (data.Purma) {
      this.socioFincaEditForm.controls.purma.setValue(data.Purma);
    }
    if (data.PanLlevar) {
      this.socioFincaEditForm.controls.panLlevar.setValue(data.PanLlevar);
    }
    if (data.Vivienda) {
      this.socioFincaEditForm.controls.vivienda.setValue(data.Vivienda);
    }
    this.SearchProducerFincaById(data.ProductorFincaId);

    this.spinner.hide();
  }

  GetRequest(): any {
    return {
      SocioFincaId: this.codeFincaPartner ?? 0,
      SocioId: this.codePartner ?? 0,
      ProductorFincaId: this.socioFincaEditForm.value.finca,
      ViasAccesoCentroAcopio:this.socioFincaEditForm.controls["viasAcceso"].value,
      DistanciaKilometrosCentroAcopio: this.socioFincaEditForm.controls["distanciaKM"].value ?? null,
      TiempoTotalFincaCentroAcopio: this.socioFincaEditForm.controls["tiempoTotal"].value ?? null,
      MedioTransporte: this.socioFincaEditForm.controls["medioTransporte"].value,
      Cultivo: this.socioFincaEditForm.controls["cultivo"].value ? this.socioFincaEditForm.controls["cultivo"].value.join('|') : '',
      Precipitacion: this.socioFincaEditForm.controls["precipitacion"].value,
      CantidadPersonalCosecha: this.socioFincaEditForm.controls["nroPersonalCosecha"].value ?? null,
      Usuario: this.vSessionUser.Result.Data.NombreUsuario,
      EstadoId: this.socioFincaEditForm.controls["estado"].value,
      AreaTotal: Number(this.socioFincaEditForm.controls["areaTotal"].value)? Number(this.socioFincaEditForm.controls["areaTotal"].value) : null,
      AreaCafeEnProduccion: Number( this.socioFincaEditForm.controls["areaCafe"].value)? Number(this.socioFincaEditForm.controls["areaCafe"].value) : null,
      Crecimiento: Number(this.socioFincaEditForm.controls["crecimiento"].value)? Number(this.socioFincaEditForm.controls["crecimiento"].value) : null,
      Bosque: Number(this.socioFincaEditForm.controls["bosque"].value)? Number(this.socioFincaEditForm.controls["bosque"].value) : null,
      Purma: Number(this.socioFincaEditForm.controls["purma"].value)? Number(this.socioFincaEditForm.controls["purma"].value) : null,
      PanLlevar:Number(this.socioFincaEditForm.controls["panLlevar"].value)? Number(this.socioFincaEditForm.controls["panLlevar"].value) : null,
      Vivienda: Number(this.socioFincaEditForm.controls["vivienda"].value)? Number(this.socioFincaEditForm.controls["vivienda"].value) : null,
      FincaEstimado: this.rows.filter(x => x.Anio != 0 && x.Estimado != 0)
      //Precipitacion: this.socioFincaEditForm.value.precipitacion,
    }
  }

  Save(): void {
    if (!this.socioFincaEditForm.invalid) {
      const form = this;
      if (this.codeFincaPartner > 0) {
        this.alertUtil.alertRegistro('Confirmación', '¿Está seguro de continuar con la actualización del socio finca?.' , function (result) {
          if (result.isConfirmed) {
            form.Update();
          }
        }); 
      } else {

        this.alertUtil.alertRegistro('Confirmación', '¿Está seguro de continuar con el registro del socio finca?' , function (result) {
          if (result.isConfirmed) {
            form.Create();
          }
        }); 
      }
    }
  }

  Create(): void {
    this.spinner.show();
    const request = this.GetRequest();
    this.socioFincaService.Create(request)
      .subscribe((res: any) => {
        this.spinner.hide();
        if (res.Result.Success) {
          this.alertUtil.alertOkCallback("CONFIRMACIÓN!",
            "Se registro correctamente el socio finca.",
            () => {
              this.Cancel();
            });
        } else {
          this.alertUtil.alertError("ERROR!", res.Result.Message);
        }
      }, (err: any) => {
        console.log(err);
        this.spinner.hide();
        this.alertUtil.alertError("ERROR!", this.vMsgErrGenerico);
      });
  }

  Update(): void {
    this.spinner.show();
    const request = this.GetRequest();
    this.socioFincaService.Update(request)
      .subscribe((res: any) => {
        this.spinner.hide();
        if (res.Result.Success) {
          this.alertUtil.alertOkCallback("CONFIRMACIÓN!",
            "Se actualizo correctamente el socio finca.",
            () => {
              this.Cancel();
            });
        } else {
          this.alertUtil.alertError("ERROR!", res.Result.Message);
        }
      }, (err: any) => {
        console.log(err);
        this.spinner.hide();
        this.alertUtil.alertError("ERROR!", this.vMsgErrGenerico);
      });
  }

  Cancel(): void {
    // if (this.objParams.idSocio) {
    //   this.router.navigate([`/agropecuario/operaciones/socio/finca/list/${this.objParams.idSocio}`],
    //     { queryParams: { idProductor: this.objParams.idProductor } });
    // } else {
    //   this.router.navigate([`/agropecuario/operaciones/socio/finca/list/${this.socioFincaEditForm.value.idSocio}`],
    //     { queryParams: { idProductor: this.socioFincaEditForm.value.idProductor } });
    // }
    this.router.navigate([`/agropecuario/operaciones/socio/finca/list/${this.codePartner}/${this.codeProducer}`]);
  }

  addRow(): void {
    this.rows = [...this.rows, { Anio: 0, Estimado: 0, EstimadoQq: 0, ProductoId: '', Consumido: 0 ,  ConsumidoQq: 0 }];
  }

  EliminarFila(index: any): void {
    this.rows.splice(index, 1);
    this.rows = [...this.rows];
  }

  UpdateValue(event: any, index: any, prop: any): void {
    if (prop === 'anio') {
      this.rows[index].Anio = parseFloat(event.target.value)
    } else if (prop === 'estimado') {
      this.rows[index].Estimado = parseFloat(event.target.value)
      var num = parseFloat(event.target.value) / 60;
      this.rows[index].EstimadoQq = num.toFixed(2);
    }
    /*else if (prop === 'saldo') {
      this.rows[index].Consumido = parseFloat(event.target.value)
      var num = parseFloat(event.target.value) / 60;
      this.rows[index].ConsumidoQq = num.toFixed(2);
    }*/
  }
}
