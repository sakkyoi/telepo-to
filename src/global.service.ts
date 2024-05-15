import { Injectable } from '@angular/core';
import { Peer, DataConnection } from 'peerjs';
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

  connections: { [key: string]: DataConnection } = {};

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

    // TODO: Implement the connection logic
    // Listen for the peer to be connected
    this.peer.on('connection', (connection) => {
      console.log('Connected to', connection.peer);
      this.connections[connection.peer] = connection;
      this.connections[connection.peer].on('data', (data) => {
        console.log('Received', data);
        console.log(this.connections)
        connection.send('Hello, I received your message!');
      });
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

  setWelcomeModalShown() {
    localStorage.setItem('welcomeModalShown', 'true');
  }

  getWelcomeModalShown() {
    return localStorage.getItem('welcomeModalShown') === 'true';
  }
}
