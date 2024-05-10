import {Component, EventEmitter, Input, Output} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Peer } from 'peerjs';
import { FormsModule } from "@angular/forms";
import { ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'telepo-to';
  peer: Peer;

  @Input() theme: boolean = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  @ViewChild('welcomeModal') welcomeModal: ElementRef | undefined;

  constructor() {

    this.peer = new Peer({
      host: 'localhost',
      port: 9000,
    });

    this.peer.on('open', (id) => {
      console.log('My peer ID is: ' + id);
    });

    this.peer.on('connection', (conn) => {
      conn.on('data', (data: any) => {
        console.log(data);
      });
    });
  }

  ngAfterViewInit() {
    // this.welcomeModal?.nativeElement.showModal();
  }
}
