import { Component, ElementRef, ViewChild, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgIf
  ],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent {
  @ViewChild('dialog') dialog: ElementRef | undefined;
  @Input() buttonText: string | undefined;
  @Input() title: string | undefined;
}
