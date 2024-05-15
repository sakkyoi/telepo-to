import { Component, ElementRef, ViewChild, Input } from '@angular/core';
import { NgIf } from "@angular/common";
import { GlobalService } from "../../global.service";

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [
    NgIf
  ],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent {
  @ViewChild('dialog') dialog: ElementRef | undefined;
  @Input() buttonText: string | undefined;
  @Input() title: string | undefined;

  constructor(
    protected global: GlobalService
  ) {}

  showModal() {
    this.dialog?.nativeElement.showModal();
  }
}
