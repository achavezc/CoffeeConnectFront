import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-contrato-edit',
  templateUrl: './contrato-edit.component.html',
  styleUrls: ['./contrato-edit.component.scss']
})
export class ContratoEditComponent implements OnInit {

  constructor(private fb: FormBuilder) { }

  contratoEditForm: FormGroup;

  ngOnInit(): void {
    this.LoadForm();
  }

  LoadForm(): void {
    this.contratoEditForm = this.fb.group({

    });
  }

  get f() {
    return this.contratoEditForm.controls;
  }

}
