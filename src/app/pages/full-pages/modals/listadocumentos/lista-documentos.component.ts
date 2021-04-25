import { Component, EventEmitter, Input, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

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
  titleModal: any;
  subTitleModal: any;
  @Output() responseEvent = new EventEmitter<any[]>();
  @ViewChild(DatatableComponent) tblListDocuments: DatatableComponent;

  constructor(private spinner: NgxSpinnerService,
    private modalService: NgbModal) {
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
  }

  singleSelectCheck(row: any) {
    return this.selected.indexOf(row) === -1;
  }

  close() {
    this.modalService.dismissAll();
  }

}
