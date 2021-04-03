import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import swal from 'sweetalert2';
import { ILogin } from '../../../../../../services/models/login';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn, FormBuilder } from '@angular/forms';
import { MaestroService } from '../../../../../../services/maestro.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import {TagOrdenServicioComponent} from '../../ordenservicio/ordenservicio-edit/tag-ordenservicio/tag-ordenservicio.component'

@Component({
  selector: 'app-orden-servicio-edit',
  templateUrl: './ordenservicio-edit.component.html',
  styleUrls: ['./ordenservicio-edit.component.scss', "/assets/sass/libs/datatables.scss"]
})
export class OrdenServicioEditComponent implements OnInit {

    @ViewChild('vform') validationForm: FormGroup;
    @ViewChild(DatatableComponent) table: DatatableComponent;
    login: ILogin;
    ordenServicioFormEdit: FormGroup;
    viewTagSeco: boolean;
    listaEstado: any[];
    selectEstado: any;
    submittedEdit =  false;
    submitted = false;
    detalle: any;
    disabledControl: any;
    form: string = "ordenServicio";
    numero: any;
    fechaRegistro: any;
    listTipoSocio: any[];
    selectTipoSocio: any;
    esEdit: true;
    listaTipoProveedor: any[];
    listaTipoDocumento: any[];
    selectedTipoDocumento: any;
    selectTipoProveedor: any;
    rows: any[];
    errorGeneral: any = { isError: false, errorMessage: '' };
    selectEmpresa:any[];
    

    constructor(private fb: FormBuilder,
      private spinner: NgxSpinnerService,
      private maestroService: MaestroService,
      private modalService: NgbModal) {
    }

  receiveMessage($event) {
    this.selectEmpresa = $event
    this.ordenServicioFormEdit.get('destinatario').setValue(this.selectEmpresa[0].RazonSocial);
    this.ordenServicioFormEdit.get('ruc').setValue(this.selectEmpresa[0].Ruc);
    this.ordenServicioFormEdit.get('dirDestino').setValue(this.selectEmpresa[0].Direccion + " - " + this.selectEmpresa[0].Distrito + " - " + this.selectEmpresa[0].Provincia + " - " + this.selectEmpresa[0].Departamento);
    this.modalService.dismissAll();
  }
 
  receiveSubProducto($event) {
    this.viewTagSeco = $event;
  }
  
  ngOnInit(): void {
    this.login = JSON.parse(localStorage.getItem("user"));
    this.cargarForm();
  }

  openModal(modalEmpresa) {
    this.modalService.open(modalEmpresa, { windowClass: 'dark-modal', size: 'xl' });
  
  }

  cargarForm() 
  {
      this.ordenServicioFormEdit =this.fb.group(
        {
          numOrdenServicio:  new FormControl('', []),
          estado: new FormControl('', [Validators.required]),
          destinatario: ['',[Validators.required] ],
          ruc:   new FormControl('', []),
          dirPartida:  [this.login.Result.Data.DireccionEmpresa, []],
          dirDestino:   new FormControl('', []),
          tagordenservicio:this.fb.group({
            tipoProduccion: new FormControl('', []),
            producto: new FormControl('', []),
            subproducto: new FormControl('', []),
            rendimiento: new FormControl('', []),
            unidadmedida: new FormControl('', []),
            cantidad: new FormControl('', [])
          }),
        });

        this.maestroService.obtenerMaestros("EstadoOrdenServicioControlCalidad")
        .subscribe(res => {
          if (res.Result.Success) {
            this.listaEstado = res.Result.Data;
          }
        },
          err => {
            console.error(err);
          }
        );
  }

  get fedit() {
    return this.ordenServicioFormEdit.controls;
  }
}