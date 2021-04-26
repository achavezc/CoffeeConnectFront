import { Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { FincaFotoGeoreferenciadaService } from '../../../../services/finca-foto-georeferenciada.service';
import { FincaDocumentoAdjuntoService } from '../../../../services/finca-documento-adjunto.service';

@Component({
  selector: 'app-lista-documentos',
  templateUrl: './lista-documentos.component.html',
  styleUrls: ['./lista-documentos.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MListaDocumentosComponent implements OnInit {

  @ViewChild('vform') validationForm: FormGroup;
  listaDocumentosForm: FormGroup;
  public rows = [];
  public limitRef = 10;
  selected = [];
  mensajeErrorGenerico = "Ocurrio un error interno.";
  errorGeneral: any = { isError: false, errorMessage: '' };
  @Input() codeForm: any;
  @Input() FincaId: any;
  titleModal: any;
  subTitleModal: any;
  @ViewChild(DatatableComponent) tblListDocuments: DatatableComponent;

  constructor(private spinner: NgxSpinnerService,
    private modalService: NgbModal,
    private fotoGeoreferenciadaService: FincaFotoGeoreferenciadaService,
    private documentoAdjuntoService: FincaDocumentoAdjuntoService) {
    this.singleSelectCheck = this.singleSelectCheck.bind(this);
  }

  ngOnInit(): void {
    if (this.codeForm === 'frmMdlListaFotosGeoreferenciadas') {
      this.titleModal = 'CARGA DE FOTOS GEOREFERENCIADAS';
      this.subTitleModal = 'LISTA DE DOCUMENTOS';
    } else if (this.codeForm === 'frmMdlAttachments') {
      this.titleModal = 'CARGA DE OTROS DOCUMENTOS';
      this.subTitleModal = 'LISTA DE DOCUMENTOS';
    }
    this.LoadFiles();
  }

  singleSelectCheck(row: any) {
    return this.selected.indexOf(row) === -1;
  }

  CloseModal() {
    this.modalService.dismissAll();
  }

  openModal(modal) {
    this.modalService.open(modal, { windowClass: 'dark-modal', size: 'lg', centered: true });
  }

  modalResponse(event) {
    this.modalService.dismissAll();
  }

  LoadFiles(): void {
    if (this.codeForm === 'frmMdlListaFotosGeoreferenciadas') {
      this.GetPhotosGeoreferenced();
    } else if (this.codeForm === 'frmMdlAttachments') {
      this.GetAttachments();
    }
  }

  GetPhotosGeoreferenced(): void {
    this.spinner.show();
    this.errorGeneral = { isError: false, errorMessage: '' };
    this.fotoGeoreferenciadaService.SearchByFincaId({ FincaId: this.FincaId }).subscribe((res: any) => {
      this.spinner.hide();
      if (res.Result.Success) {
        this.rows = res.Result.Data;
      } else {
        this.errorGeneral = { isError: true, errorMessage: res.Result.Message };
      }
    }, (err: any) => {
      console.log(err);
      this.spinner.hide();
      this.errorGeneral = { isError: true, errorMessage: this.mensajeErrorGenerico };
    });
  }

  GetAttachments(): void {
    this.spinner.show();
    this.errorGeneral = { isError: false, errorMessage: '' };
    this.documentoAdjuntoService.SearchByFincaId({ FincaId: this.FincaId }).subscribe((res: any) => {
      this.spinner.hide();
      if (res.Result.Success) {
        this.rows = res.Result.Data;
      } else {
        this.errorGeneral = { isError: true, errorMessage: res.Result.Message };
      }
    }, (err: any) => {
      console.log(err);
      this.spinner.hide();
      this.errorGeneral = { isError: true, errorMessage: this.mensajeErrorGenerico };
    });
  }

}
