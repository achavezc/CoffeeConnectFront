import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators, FormGroup, ValidatorFn, ValidationErrors } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { MaestroUtil } from '../../../../../../services/util/maestro-util';
import { SocioService } from '../../../../../../services/socio.service';
import { DateUtil } from '../../../../../../services/util/date-util';
import { MConsultarProductorComponent } from '../../../../modals/consultarproductor/m-consultar-productor.component';

@Component({
  selector: 'app-socio-edit',
  templateUrl: './socio-edit.component.html',
  styleUrls: ['./socio-edit.component.scss']
})
export class SocioEditComponent implements OnInit {

  constructor(private maestroUtil: MaestroUtil,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private socioService: SocioService,
    private router: Router,
    private dateUtil: DateUtil,
    private modalService: NgbModal) { }

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
  vId: number;

  ngOnInit(): void {
    this.LoadForm();
    this.LoadCombos();
    this.vId = this.route.snapshot.params['id'];
    if (!this.vId) {
      this.socioEditForm.controls.estado.setValue('01');
      this.socioEditForm.controls.fecRegistro.setValue(this.dateUtil.currentDate());
    } else {
      this.vId = parseInt(this.route.snapshot.params['id']);
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
    this.maestroUtil.GetProvinces(event.Codigo, event.CodigoPais, function (res: any) {
      if (res.Result.Success) {
        form.listProvincias = res.Result.Data;
      }
    });
  }

  onChangeProvince(event: any): void {
    const form = this;
    this.maestroUtil.GetDistricts(this.selectedDepartamento, event.Codigo, event.CodigoPais, function (res: any) {
      if (res.Result.Success) {
        form.listDistritos = res.Result.Data;
      }
    });
  }

  SearchProductor(): void {
    const modalRef = this.modalService.open(MConsultarProductorComponent, {
      scrollable: true,
      windowClass: 'dark-modal',
      size: 'xl',
      centered: true
    });
    // windowClass: 'myCustomModalClass',
    // keyboard: false,
      // backdrop: 'static'
      
    let data = {
      prop1: 'Some Data',
      prop2: 'From Parent Component',
      prop3: 'This Can be anything'
    }

    modalRef.componentInstance.fromParent = data;
    modalRef.result.then((result) => {
      console.log(result);
    }, (reason) => {
      console.log(reason);
    });
  }

  Save(): void {
    if (!this.vId) {
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

  Cancel(): void {
    this.router.navigate(['/agropecuario/operaciones/socio/list']);
  }
}
