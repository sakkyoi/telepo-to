import { Injectable } from '@angular/core';
import { Peer, DataConnection } from 'peerjs';
import { pki } from 'node-forge';
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';
import { createAvatar } from '@dicebear/core';
import { thumbs } from '@dicebear/collection';

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
  keyPairInitialized: boolean = false;
  establishedStatus: boolean = false;

  constructor() {
    this.initKeyPair(); // Generate a keypair when the service is created

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

  initKeyPair() {
    if (this.loadKeyPair()) {
      console.log('Keypair already generated');
      // If the keypair has already been generated, load it from local storage
      this.keypair = this.loadKeyPair();

      this.keyPairInitialized = true;
      this.updateEstablishedStatus();
    } else {
      // Otherwise, generate a new keypair
      this.generateKeyPair();
    }
  }

  loadKeyPair() {
    const privateKeyPem = localStorage.getItem('privateKey');
    const publicKeyPem = localStorage.getItem('publicKey');
    if (!privateKeyPem || !publicKeyPem) return;

    return <pki.KeyPair> {
      privateKey: pki.privateKeyFromPem(privateKeyPem),
      publicKey: pki.publicKeyFromPem(publicKeyPem),
    };
  }

  generateKeyPair() {
    pki.rsa.generateKeyPair({ bits: 4096, workers: 2 }, (err, keypair) => {
      if (err) {
        console.error(err);
        return;
      }
      this.keypair = keypair;

      localStorage.setItem('privateKey', pki.privateKeyToPem(keypair.privateKey));
      localStorage.setItem('publicKey', pki.publicKeyToPem(keypair.publicKey));

      this.keyPairInitialized = true;
      this.updateEstablishedStatus();
    });
  }

  getPeerName(fingerprint: string | undefined = undefined) {
    if (!fingerprint) fingerprint = this.getFingerprint();
    return uniqueNamesGenerator({
      dictionaries: [colors, adjectives, animals],
      separator: ' ',
      seed: fingerprint,
    });
  }

  getPeerAvatar(fingerprint: string | undefined = undefined, config = {}) {
    if (!fingerprint) fingerprint = this.getFingerprint();
    return createAvatar(thumbs, Object.assign(
      {
        seed: fingerprint,
      },
      config,
    )).toDataUriSync();
  }

  getPublicKeyAsPem() {
    if (!this.keypair) return '';
    return pki.publicKeyToPem(this.keypair.publicKey);
  }

  getFingerprint(publicKey: pki.PublicKey | undefined = undefined) {
    if (!publicKey) publicKey = this.keypair?.publicKey!;
    return pki.getPublicKeyFingerprint(publicKey, { encoding: 'hex' });
  }

  updateEstablishedStatus() {
    this.establishedStatus = this.peerEstablished && this.keyPairInitialized;
  }

  setWelcomeModalShown() {
    localStorage.setItem('welcomeModalShown', 'true');
  }

  getWelcomeModalShown() {
    return localStorage.getItem('welcomeModalShown') === 'true';
  }
}
