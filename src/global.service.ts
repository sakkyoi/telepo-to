import { Injectable } from '@angular/core';
import { Peer } from 'peerjs';
import { pki } from 'node-forge';

@Injectable({
  providedIn: 'root',
})
export class GlobalService {
  peer: Peer = new Peer({
    host: 'localhost',
    port: 9000
  });
  keypair: pki.KeyPair | undefined;

  peerEstablished: boolean = false;
  keyPairGenerated: boolean = false;
  establishedStatus: boolean = false;

  constructor() {
    this.generateKeyPair(); // Generate a keypair when the service is created

    // Listen for the peer to be established
    this.peer.on('open', (_) => {
      this.peerEstablished = true;
      this.updateEstablishedStatus();
    });
  }

  generateKeyPair() {
    pki.rsa.generateKeyPair({ bits: 4096, workers: 2 }, (err, keypair) => {
      if (err) {
        console.error(err);
        return;
      }
      this.keypair = keypair;
      this.keyPairGenerated = true;
      this.updateEstablishedStatus();
    });
  }

  getPublicKeyAsPem() {
    if (!this.keypair) return '';
    return pki.publicKeyToPem(this.keypair.publicKey);
  }

  updateEstablishedStatus() {
    this.establishedStatus = this.peerEstablished && this.keyPairGenerated;
  }
}
