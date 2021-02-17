import { Component, OnInit, ViewEncapsulation, Input, ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent, ColumnMode } from "@swimlane/ngx-datatable";
import { Observable } from 'rxjs';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: 'app-pesadoCafe',
  templateUrl: './pesadoCafe.component.html',
  styleUrls: ['./pesadoCafev.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PesadoCafe implements OnInit {
    ngOnInit(): void {
    }

}
