import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, Validators, ValidatorFn, ValidationErrors, FormGroup } from '@angular/forms';

import { DateUtil } from '../../../../services/util/date-util';
import { MaestroUtil } from '../../../../services/util/maestro-util';
import { ProductorService } from '../../../../services/productor.service';

@Component({
  selector: 'app-m-consultar-productor',
  templateUrl: './m-consultar-productor.component.html',
  styleUrls: ['./m-consultar-productor.component.scss']
})
export class MConsultarProductorComponent implements OnInit {

  @Input() fromParent: any;

  constructor(public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private dateUtil: DateUtil,
    private maestroUtil: MaestroUtil,
    private productorService: ProductorService) { }

  modalProductorForm: any;
  listTiposDocumentos: [];
  selectedTipoDocumento: any;
  errorGeneral = { isError: false, errorMessage: '' };

  page: number = 1;
  pageSize: number = 10;
  collectionSize: number;
  searchTerm: string;
  currentRate: number = 8;
  productores: any[];
  allRows: any[];

  ngOnInit(): void {
    this.LoadForm();
    this.LoadCombos();
    this.modalProductorForm.controls.fechaFin.setValue(this.dateUtil.currentDate());
    this.modalProductorForm.controls.fechaInicio.setValue(this.dateUtil.currentMonthAgo());
    this.addValidations();
    this.modalProductorForm.controls.nombRazonSocial.setValue('acevedo');
    this.Buscar();
  }

  LoadForm(): void {
    this.modalProductorForm = this.fb.group({
      codProductor: [''],
      tipoDocumento: [],
      nroDocumento: [''],
      nombRazonSocial: [''],
      fechaInicio: [, [Validators.required]],
      fechaFin: [, [Validators.required]]
    });
    this.modalProductorForm.setValidators(this.comparisonValidator());
  }

  public comparisonValidator(): ValidatorFn {
    return (group: FormGroup): ValidationErrors => {
      if (!group.value.fechaInicio || !group.value.fechaFin) {
        this.errorGeneral = { isError: true, errorMessage: 'Por favor seleccionar ambas fechas.' };
      } else {
        this.errorGeneral = { isError: false, errorMessage: '' };
      }
      return;
    };
  }

  addValidations(): void {
    const nroDoc = this.modalProductorForm.controls.nroDocumento;
    const tipoDoc = this.modalProductorForm.controls.tipoDocumento;
    this.modalProductorForm.controls.tipoDocumento.valueChanges.subscribe((res: any) => {
      if (res) {
        nroDoc.setValidators(Validators.required);
      } else {
        nroDoc.clearValidators();
      }
      nroDoc.updateValueAndValidity();
    });
  }

  get f() {
    return this.modalProductorForm.controls;
  }

  LoadCombos(): void {
    let form = this;
    this.maestroUtil.obtenerMaestros("TipoDocumento", function (res: any) {
      if (res.Result.Success) {
        form.listTiposDocumentos = res.Result.Data;
      }
    });
  }

  compareTwoDates(): void {

  }

  search(value: string): void {
    this.productores = this.allRows.filter((val) => val.name.toLowerCase().includes(value));
    this.collectionSize = this.productores.length;
  }

  Buscar(): void {
    if (this.modalProductorForm.invalid || this.errorGeneral.isError) {
      // this.submitted = true;
      return;
    } else {
      // this.submitted = false;
      let request = {
        Numero: this.modalProductorForm.value.codProductor,
        NombreRazonSocial: this.modalProductorForm.value.nombRazonSocial,
        TipoDocumentoId: this.modalProductorForm.value.tipoDocumento ?? '',
        NumeroDocumento: this.modalProductorForm.value.nroDocumento,
        EstadoId: '',
        FechaInicio: new Date(this.modalProductorForm.value.fechaInicio),
        FechaFin: new Date(this.modalProductorForm.value.fechaFin)
      };

      // this.spinner.show();

      this.productorService.Search(request)
        .subscribe(res => {
          // this.spinner.hide();
          if (res.Result.Success) {
            if (!res.Result.ErrCode) {
              res.Result.Data.forEach((obj: any) => {
                obj.FechaRegistroString = this.dateUtil.formatDate(new Date(obj.FechaRegistro));
              });
              // this.tempData = res.Result.Data;
              this.collectionSize = res.Result.Data.length;
              this.productores = res.Result.Data;
              this.allRows = this.productores;
            } else if (res.Result.Message && res.Result.ErrCode) {
              this.errorGeneral = { isError: true, errorMessage: res.Result.Message };
            } else {
              // this.errorGeneral = { isError: true, errorMessage: this.mensajeErrorGenerico };
            }
          } else {
            // this.errorGeneral = { isError: true, errorMessage: this.mensajeErrorGenerico };
          }
        },
          err => {
            // this.spinner.hide();
            console.error(err);
            // this.errorGeneral = { isError: true, errorMessage: this.mensajeErrorGenerico };
          }
        );
    }
  }

  closeModal(sendData): void {
    this.activeModal.close(sendData);
  }

}
