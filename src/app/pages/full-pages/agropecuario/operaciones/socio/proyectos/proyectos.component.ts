import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { Router } from '@angular/router';

@Component({
  selector: 'app-proyectos',
  templateUrl: './proyectos.component.html',
  styleUrls: ['./proyectos.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProyectosComponent implements OnInit {

  limitRef = 10;
  rows = [];
  selected: [];
  @ViewChild(DatatableComponent) tblData: DatatableComponent;

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  New(): void {
    this.router.navigate(['/agropecuario/operaciones/socio/proyectos/create']);
  }

  Delete(): void {

  }

  updateLimit(event: any): void {

  }

  filterUpdate(event: any): void {

  }
}
