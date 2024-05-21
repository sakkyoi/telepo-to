import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.css'
})
export class AlertComponent implements AfterViewInit {
  @ViewChild('dialog') dialog!: ElementRef;
  @Input() title!: string;
  @Input() message!: string;

  constructor() {}

  ngAfterViewInit() {
    this.dialog?.nativeElement.showModal(); // Show the dialog when the component is initialized
  }

  destroy() {
    this.dialog.nativeElement.parentElement.remove(); // Remove the dialog from the DOM
  }
}
