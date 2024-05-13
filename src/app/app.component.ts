import {Component, Input} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Peer } from 'peerjs';
import { FormsModule } from "@angular/forms";
import { ElementRef, ViewChild } from '@angular/core';
import { QRCodeModule } from 'angularx-qrcode';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { iconoirQrCode, iconoirCopy } from '@ng-icons/iconoir';
import { NgIf } from '@angular/common';
import { pki } from 'node-forge';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, QRCodeModule, NgIconComponent, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers: [provideIcons({ iconoirQrCode, iconoirCopy })]
})
export class AppComponent {
  title = 'telepo-to';
  peer: Peer;
  privateKey: pki.rsa.PrivateKey | undefined;
  publicKey: pki.rsa.PublicKey | undefined;
  qrCodeColor: string = '';

  @Input() theme: boolean = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  @ViewChild('welcomeModal') welcomeModal: ElementRef | undefined;

  constructor() {
    this.peer = new Peer();

    this.peer.on('open', (id) => {
      console.log('My peer ID is: ' + id);
    });

    this.peer.on('connection', (conn) => {
      conn.on('data', (data: any) => {
        console.log(data);
      });
    });

    // this.generateKeyPair();
  }

  ngAfterViewInit() {
    // this.welcomeModal?.nativeElement.showModal();
  }

  generateKeyPair() {
    pki.rsa.generateKeyPair({ bits: 4096, workers: 2 }, (err, keypair) => {
      if (err) {
        console.error(err);
        return;
      }
      this.privateKey = keypair.privateKey;
      this.publicKey = keypair.publicKey;
    })
  }
}
