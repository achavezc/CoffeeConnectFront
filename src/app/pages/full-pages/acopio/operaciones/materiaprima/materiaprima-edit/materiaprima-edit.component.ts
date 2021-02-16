import { Component, OnInit, ViewEncapsulation, Input, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent, ColumnMode } from "@swimlane/ngx-datatable";
import { MaestroService } from '../../../../../../services/maestro.service';
import { Observable } from 'rxjs';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn } from '@angular/forms';
import { AcopioService, FiltrosProveedor } from '../../../../../../services/acopio.service';
import { NgxSpinnerService } from "ngx-spinner";
import { host } from '../../../../../../shared/hosts/main.host';
import { ILogin } from '../../../../../../services/models/login';

@Component({
  selector: 'app-materiaprima-list',
  templateUrl: './materiaprima-edit.component.html',
  styleUrls: ['./materiaprima-edit.component.scss', '/assets/sass/pages/page-users.scss', '/assets/sass/libs/select.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MateriaPrimaEditComponent implements OnInit {

  @ViewChild('vform') validationForm: FormGroup;
  @Input() name;
  submitted = false;
  closeResult: string;
  consultaMateriaPrimaFormEdit: FormGroup;
  consultaProveedor: FormGroup;
  listaProducto: any[];
  listaSubProducto: any[];
  listaTipoProveedor: any[];
  selectTipoProveedor: any;
  selectedEstado: any;
  selectProducto: any;
  selectSubProducto: any;
  listSub: any[];
  selected = [];
  popupModel;
  login: ILogin;
  private tempData = [];
  public rows = [];
  public ColumnMode = ColumnMode;
  public limitRef = 10;
  errorGeneral: any = { isError: false, errorMessage: '' };
  mensajeErrorGenerico = "Ocurrio un error interno.";
  listTipoSocio: any[];

  @ViewChild(DatatableComponent) table: DatatableComponent;

  constructor(private modalService: NgbModal, private maestroService: MaestroService, private filtrosProveedor: FiltrosProveedor,
    private spinner: NgxSpinnerService, private acopioService: AcopioService) {
    this.singleSelectCheck = this.singleSelectCheck.bind(this);
  }
  singleSelectCheck(row: any) {
    return this.selected.indexOf(row) === -1;
  }
  ngOnInit(): void {
    this.cargarForm();
    this.cargarcombos();
    this.login = JSON.parse(localStorage.getItem("user"));
  }

  cargarForm() {
    this.consultaMateriaPrimaFormEdit = new FormGroup(
      {
        numGuia: new FormControl('', []),
        numReferencia: new FormControl('', []),
        producto: new FormControl('', []),
        subproducto: new FormControl('', []),
        provNombre: new FormControl('', []),
        provDocumento: new FormControl('', []),
        provTipoSocio: new FormControl('', []),
        provCodigo: new FormControl('', []),
        provDepartamento: new FormControl('', []),
        provProvincia: new FormControl('', []),
        provDistrito: new FormControl('', []),
        provZona: new FormControl('', [])
      });
  }
  /*open(content) {
    this.modalService.open(content).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
<<<<<<< HEAD
}*/
  openModal(customContent) {
    this.modalService.open(customContent, { windowClass: 'dark-modal', size: 'lg' });
    this.cargarProveedor();
  }

  /*private getDismissReason(reason: any): string {
      if (reason === ModalDismissReasons.ESC) {
          return 'by pressing ESC';
      } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
          return 'by clicking on a backdrop';
      } else {
          return `with: ${reason}`;
      }
  }*/

  cargarcombos() {
    this.maestroService.obtenerMaestros("Producto")
      .subscribe(res => {
        if (res.Result.Success) {
          this.listaProducto = res.Result.Data;
        }
      },
        err => {
          console.error(err);
        }
      );

  }
  changeSubProducto(e) {
    let filterProducto = e.Codigo;

    this.maestroService.obtenerMaestros("SubProducto")
      .subscribe(res => {
        if (res.Result.Success) {
          this.listaSubProducto = res.Result.Data.filter(obj => obj.Val1 == filterProducto);
        }
      },
        err => {
          console.error(err);
        }
      );
  }

  filterUpdate(event) {
    const val = event.target.value.toLowerCase();
    // filter our data
    const temp = this.tempData.filter(function (d) {
      return d.Numero.toLowerCase().indexOf(val) !== -1 || !val;
    });
    // update the rows
    this.rows = temp;
    // Whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }
  updateLimit(limit) {
    this.limitRef = limit.target.value;
  }
  cargarProveedor() {
    this.consultaProveedor = new FormGroup(
      {
        tipoproveedor: new FormControl('', []),
        ruc: new FormControl('', []),
        dni: new FormControl('', [Validators.minLength(8), Validators.maxLength(8)]),
        socio: new FormControl('', []),
        rzsocial: new FormControl('', [])
      });
    this.consultaProveedor.setValidators(this.comparisonValidator())

    this.maestroService.obtenerMaestros("TipoProveedor")
      .subscribe(res => {
        if (res.Result.Success) {
          this.listaTipoProveedor = res.Result.Data;
        }
      },
        err => {
          console.error(err);
        }
      );
  }
  get f() {
    return this.consultaProveedor.controls;
  }
  public comparisonValidator(): ValidatorFn {
    return (group: FormGroup): ValidationErrors => {
      const tipoproveedor = group.controls['tipoproveedor'];
      const ruc = group.controls['ruc'];
      const dni = group.controls['dni'];
      const socio = group.controls['socio'];
      const rzsocial = group.controls['rzsocial'];
      if ((tipoproveedor.value == "" || tipoproveedor.value == undefined) && ruc.value == "" && dni.value == "" && socio.value == "" && rzsocial.value == "") {

        this.errorGeneral = { isError: true, errorMessage: 'Ingrese por lo menos un campo' };

      } else {
        this.errorGeneral = { isError: false, errorMessage: '' };
      }
      return;
    };
  }

  seleccionarProveedor(e) {
    this.listTipoSocio = this.listaTipoProveedor;
    this.consultaMateriaPrimaFormEdit.get('provNombre').setValue(e[0].NombreRazonSocial);
    this.consultaMateriaPrimaFormEdit.get('provDocumento').setValue(e[0].NumeroDocumento);
    this.consultaMateriaPrimaFormEdit.get('provDocumento').setValue(e[0].NumeroDocumento);
    this.consultaMateriaPrimaFormEdit.get('provTipoSocio').setValue("0" + e[0].SocioId);
    this.consultaMateriaPrimaFormEdit.get('provCodigo').setValue(e[0].CodigoSocio);
    this.consultaMateriaPrimaFormEdit.get('provDepartamento').setValue(e[0].Departamento);
    this.consultaMateriaPrimaFormEdit.get('provProvincia').setValue(e[0].Provincia);
    this.consultaMateriaPrimaFormEdit.get('provDistrito').setValue(e[0].Distrito);
    this.consultaMateriaPrimaFormEdit.get('provZona').setValue(e[0].Zona);
    this.modalService.dismissAll();
  }
  buscar() {
    if (this.consultaProveedor.invalid || this.errorGeneral.isError) {
      this.submitted = true;
      return;
    } else {
      this.submitted = false;
      this.filtrosProveedor.TipoProveedorId = this.consultaProveedor.controls['tipoproveedor'].value;
      this.filtrosProveedor.NombreRazonSocial = this.consultaProveedor.controls['ruc'].value;
      this.filtrosProveedor.TipoDocumentoId = this.consultaProveedor.controls['dni'].value;
      this.filtrosProveedor.NumeroDocumento = this.consultaProveedor.controls['socio'].value;
      this.filtrosProveedor.CodigoSocio = this.consultaProveedor.controls['rzsocial'].value;
      this.spinner.show(undefined,
        {
          type: 'ball-triangle-path',
          size: 'medium',
          bdColor: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          fullScreen: true
        });
      this.acopioService.consultarProveedor(this.filtrosProveedor)
        .subscribe(res => {
          this.spinner.hide();
          if (res.Result.Success) {
            if (res.Result.ErrCode == "") {

              this.tempData = res.Result.Data;
              this.rows = [...this.tempData];
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
            console.error(err);
            this.errorGeneral = { isError: true, errorMessage: this.mensajeErrorGenerico };
          }
        );
    }
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  ExportPDF(id: number): void {
    let link = document.createElement('a');
    document.body.appendChild(link);
    link.href = `${host}NotaCompra/GenerarPDF?id=${id === undefined ? 1 : id}`;
    link.download = "NotaCompra.pdf"
    link.target = "_blank";
    link.click();
    link.remove();
  }
}

