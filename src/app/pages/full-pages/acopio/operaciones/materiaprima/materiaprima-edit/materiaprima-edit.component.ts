import { Component, OnInit, ViewEncapsulation, Input, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent, ColumnMode } from "@swimlane/ngx-datatable";
import { materiaPrimaListData } from "../../materiaprima/materiaprima-list/data/materiaprima-list.data";
import { host } from '../../../../../../shared/hosts/main.host';

@Component({
  selector: 'app-materiaprima-list',
  templateUrl: './materiaprima-edit.component.html',
  styleUrls: ['./materiaprima-edit.component.scss', '/assets/sass/pages/page-users.scss', '/assets/sass/libs/select.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MateriaPrimaEditComponent implements OnInit {
  @Input() name;
  closeResult: string;

  selectedEstado: any;
  popupModel;
  listaEstado = [
    { id: 1, name: 'Anulado' },
    { id: 2, name: 'Pesado' },
    { id: 3, name: 'Analizado' }
  ];
  @ViewChild(DatatableComponent) table: DatatableComponent;

  public rows = materiaPrimaListData;
  public ColumnMode = ColumnMode;
  public limitRef = 10;
  private tempData = [];


  constructor(private modalService: NgbModal) {
    this.tempData = materiaPrimaListData;
  }

  ngOnInit(): void {
  }

  open(content) {
    this.modalService.open(content).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
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
