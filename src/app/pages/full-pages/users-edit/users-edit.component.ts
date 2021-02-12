import { Component, OnInit, ViewEncapsulation,Input,ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent, ColumnMode } from "@swimlane/ngx-datatable";
import { materiaPrimaListData } from "../../../acopio/operaciones/materiaprima/materiaprima-list/data/materiaprima-list.data";

@Component({
  selector: 'app-users-edit',
  templateUrl: './users-edit.component.html',
  styleUrls: ['./users-edit.component.scss', '/assets/sass/pages/page-users.scss', '/assets/sass/libs/select.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UsersEditComponent implements OnInit {
  @Input() name;
  closeResult: string;
 
  selectedLanguages = ["English"];
  languages = [
      { value: "English", name: 'English' },
      { value: "Spanish", name: 'Spanish'},
      { value: "French", name: 'French' },
      { value: "Russian", name: 'Russian' },
      { value: "German", name: 'German'},
      { value: "Hindi", name: 'Hindi' },
      { value: "Arabic", name: 'Arabic' },
      { value: "Sanskrit", name: 'Sanskrit'},
  ];

  selectedMusic = ["Jazz", "Hip Hop"];
  music = [
      { value: "Rock", name: 'Rock' },
      { value: "Jazz", name: 'Jazz'},
      { value: "Disco", name: 'Disco' },
      { value: "Pop", name: 'Pop' },
      { value: "Techno", name: 'Techno'},
      { value: "Folk", name: 'Folk' },
      { value: "Hip Hop", name: 'Hip Hop' },
  ];

  selectedMovies = ["The Dark Knight", "Perl Harbour"];
  movies = [
      { value: "Avatar", name: 'Avatar' },
      { value: "The Dark Knight", name: 'The Dark Knight'},
      { value: "Harry Potter", name: 'Harry Potter' },
      { value: "Iron Man", name: 'Iron Man' },
      { value: "Spider Man", name: 'Spider Man'},
      { value: "Perl Harbour", name: 'Perl Harbour' },
      { value: "Airplane!", name: 'Airplane!' },
  ];

  selectedEstado: any;
  popupModel;
  listaEstado = [
    { id: 1, name: 'Anulado' },
    { id: 2, name: 'Pesado' },
    { id: 3, name: 'Analizado' }
];
@ViewChild(DatatableComponent) table: DatatableComponent;

    // row data
    public rows = materiaPrimaListData;
    public ColumnMode = ColumnMode;
    public limitRef = 10;

    // column header
    public columns = [
        { name: "ID", prop: "ID" },
        { name: "Username", prop: "Username" },
        { name: "Name", prop: "Name" },
        { name: "Last Activity", prop: "Last Activity" },
        { name: "Verified", prop: "Verified" },
        { name: "Role", prop: "Role" },
        { name: "Status", prop: "Status" },
        { name: "Actions", prop: "Actions" },
    ];

    // private
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

// This function is used in open
private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
        return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
        return 'by clicking on a backdrop';
    } else {
        return `with: ${reason}`;
    }
}

}
