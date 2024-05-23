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
  @ViewChild('dialog') dialog!: ElementRef;
  @Input() title!: string;

  constructor(
    protected globalService: GlobalService
  ) {}

  showModal() {
    this.dialog?.nativeElement.showModal();
  }
}
