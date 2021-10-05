import { Component, OnInit, ViewChild, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn, FormBuilder } from '@angular/forms';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent, ColumnMode } from "@swimlane/ngx-datatable";
import { NgxSpinnerService } from "ngx-spinner";
import { TransportistaService } from '../../../../services/transportista.service';


@Component({
  selector: 'app-consultar-transportista',
  templateUrl: './consultar-transportista.component.html',
  styleUrls: ['./consultar-transportista.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})

export class MConsultarTransportista implements OnInit {

    constructor(
        private spinner: NgxSpinnerService,
        private transportistaService: TransportistaService,
        private modalService: NgbModal
      ) {
        this.singleSelectCheck = this.singleSelectCheck.bind(this);
       }

    @ViewChild(DatatableComponent) tableTranspotistas: DatatableComponent;
    @Output() transportistaEvent = new EventEmitter<any[]>();
    consultaTransportistas: FormGroup;
    errorTransportista: any = { isError: false, errorMessage: '' };
    selectedT = [];
    submittedT = false;
    mensajeErrorGenerico = "Ocurrio un error interno.";
    filtrosTransportista: any = {};
    private tempDataT = [];
    public rowsT = [];
    public limitRefT = 10;
    transportista: any[];
    public ColumnMode = ColumnMode;

    ngOnInit(): void {
        this.cargarTransportista();
    }

    singleSelectCheck(row: any) {
        return this.selectedT.indexOf(row) === -1;
      }

    close() {
        this.modalService.dismissAll();
      }

      filterUpdateT(event) {
        const val = event.target.value.toLowerCase();
        const temp = this.tempDataT.filter(function (d) {
          return d.Numero.toLowerCase().indexOf(val) !== -1 || !val;
        });
        this.rowsT = temp;
        this.tableTranspotistas.offset = 0;
      }

      get fT() {
        return this.consultaTransportistas.controls;
      }

      updateLimitT(limit) {
        this.limitRefT = limit.target.value;
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
      seleccionarTransportista(e) {
        this.transportista = e;
        this.transportistaEvent.emit(this.transportista)
      
      }
}