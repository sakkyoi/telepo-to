import { Injectable } from '@angular/core';
import { Peer, DataConnection } from 'peerjs';
import { pki } from 'node-forge';
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';
import { createAvatar } from '@dicebear/core';
import { thumbs } from '@dicebear/collection';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';
export type Connection = {
  status: ConnectionStatus,
  peer: DataConnection,
  publicKey: pki.PublicKey | undefined,
}

@Injectable({
  providedIn: 'root',
})
export class GlobalService {
  peer: Peer = new Peer({
    host: 'localhost',
    port: 9000
  });
  keypair: pki.KeyPair | undefined;

  connections: { [key: string]: Connection } = {};

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

    // Listen for the peer to be connected
    this.peer.on('connection', (connection) => {
      // Initiate a store for the connection if it doesn't exist
      if (!this.connections[connection.peer]) {
        this.connections[connection.peer] = {
          status: 'connecting',
          peer: connection,
          publicKey: undefined,
        };
      }

      // wait for the destination peer to send their public key
      this.connections[connection.peer].peer.on('data', this.dataListener(connection.peer));
    });
  }

  establishConnection(destinationId: string) {
    // Initiate a store for the connection
    this.connections[destinationId] = {
      status: 'connecting',
      peer: this.peer.connect(destinationId),
      publicKey: undefined,
    };

    // wait for the peer to be established
    this.connections[destinationId].peer.on('open', () => {
      // Send the public key to the destination peer
      this.connections[destinationId].peer.send({
        type: 'establish',
        publicKey: this.getPublicKeyAsPem(),
      });

      // wait for the destination peer to send their public key back
      this.connections[destinationId].peer.on('data', this.dataListener(destinationId));

      // TODO: Listen for disconnections
    });
  }

  dataListener(id: string) {
    return (data: any) => {
      switch (data.type) {
        case 'establish': {
          this.connections[id].publicKey = data.publicKey;
          this.connections[id].status = 'connected';
          this.connections[id].peer.send({
            type: 'acknowledge',
            publicKey: this.getPublicKeyAsPem(),
          });
          break;
        }
        case 'acknowledge': {
          this.connections[id].publicKey = data.publicKey;
          this.connections[id].status = 'connected';
          break;
        }
        default: {
          console.error('Unknown data type', data.type);
        }
      }
    }
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

  getFingerprint(publicKey: pki.PublicKey | string | undefined = undefined) {
    if (!publicKey) publicKey = this.keypair?.publicKey!;

    // If still undefined, return
    if (!publicKey) return;

    if (typeof publicKey === 'string') publicKey = pki.publicKeyFromPem(publicKey);
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
