import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-diagnostico-edit',
  templateUrl: './diagnostico-edit.component.html',
  styleUrls: ['./diagnostico-edit.component.scss']
})
export class DiagnosticoEditComponent implements OnInit {

  frmFincaDiagnosticoEdit: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
  }

  LoadForm(): void {
    this.frmFincaDiagnosticoEdit = this.fb.group({
      tokenNumber: [''],
      registrationDate: ['']
    });
  }

  get f() {
    return this.frmFincaDiagnosticoEdit.controls;
  }

  Save(): void {

  }

  Cancel(): void {

  }

}
