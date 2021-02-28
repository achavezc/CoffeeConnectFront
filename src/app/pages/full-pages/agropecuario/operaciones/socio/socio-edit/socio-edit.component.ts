import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators, FormGroup, ValidatorFn, ValidationErrors } from '@angular/forms';

import { MaestroUtil } from '../../../../../../services/util/maestro-util';
import { SocioService } from '../../../../../../services/socio.service';

@Component({
  selector: 'app-socio-edit',
  templateUrl: './socio-edit.component.html',
  styleUrls: ['./socio-edit.component.scss']
})
export class SocioEditComponent implements OnInit {

  constructor(private maestroUtil: MaestroUtil,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private socioService: SocioService) { }

  socioEditForm: any;
  listTiposDocs: [] = [];
  listDepartamentos: [] = [];
  listProvincias: [] = [];
  listDistritos: [] = [];
  listZonas: [] = [];
  selectedTipoDoc: any;
  selectedDepartamento: any;
  selectedProvincia: any;
  selectedDistrito: any;
  selectedZona: any;
  id: number;
  vTitle: string;
  isNew: boolean = true;

  ngOnInit(): void {
    this.LoadForm();
    this.LoadCombos();
    this.id = this.route.snapshot.params['id'];
    if (!this.id) {
      this.vTitle = 'NUEVO';
      this.isNew = true;
    } else {
      this.vTitle = 'MODIFICAR';
      this.isNew = false;
    }
  }

  // [Validators.minLength(5), Validators.maxLength(25), Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$'),Validators.required ]
  LoadForm(): void {
    this.socioEditForm = this.fb.group({
      codSocio: [''],
      fecRegistro: [''],
      estado: [''],
      productor: [''],
      tipoDocumento: [''],
      nroDocumento: [''],
      direccion: [''],
      nombreCompleto: [''],
      departamento: [''],
      razonSocial: [''],
      provincia: [''],
      telefonoFijo: [''],
      distrito: [''],
      telefCelular: [''],
      zona: ['']
    });
  }

  LoadCombos(): void {
    let form = this;
    this.maestroUtil.obtenerMaestros("TipoDocumento", function (res: any) {
      if (res.Result.Success) {
        form.listTiposDocs = res.Result.Data;
      }
    });
    this.maestroUtil.GetDepartments('PE', function (res: any) {
      if (res.Result.Success) {
        form.listDepartamentos = res.Result.Data;
      }
    });
  }

  onChangeDepartament(event: any): void {
    const form = this;
    this.selectedDepartamento = event;
    this.maestroUtil.GetProvinces(event.Codigo, event.CodigoPais, function (res: any) {
      if (res.Result.Success) {
        form.listProvincias = res.Result.Data;
      }
    });
  }

  onChangeProvince(event: any): void {
    const form = this;
    this.selectedProvincia = event;
    this.maestroUtil.GetDistricts(this.selectedDepartamento.Codigo, event.Codigo, event.CodigoPais, function (res: any) {
      if (res.Result.Success) {
        form.listDistritos = res.Result.Data;
      }
    });
  }

  SearchProductor(): void {
    // const response = this.modalService.open(ProductorComponent);
  }

  Save(): void {
    if (this.isNew) {
      this.CreateSocio();
    } else {
      this.UpdateSocio();
    }
  }

  CreateSocio(): void {
    const request = {
      SocioId: null,
      ProductorId: this.socioEditForm.value,
      Usuario: '',
      EstadoId: null
    }

    this.socioService.Create(request)
      .subscribe((res: any) => {
        if (res) {

        }
      }, (err: any) => {
        console.log(err);
      });
  }

  UpdateSocio(): void {

  }

}
