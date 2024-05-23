import {Injectable, NgZone, ViewContainerRef} from '@angular/core';
import { Router } from "@angular/router";
import { DataConnection, Peer } from 'peerjs';
import { pki } from 'node-forge';
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';
import { createAvatar } from '@dicebear/core';
import { thumbs } from '@dicebear/collection';
import { AlertComponent } from "./app/alert/alert.component";

export enum ConnectionStatus {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
}

export type Connection = {
  status: ConnectionStatus,
  peer: DataConnection,
  publicKey: pki.PublicKey | undefined,
}

@Injectable({
  providedIn: 'root',
})
export class GlobalService {
  rootContainer: ViewContainerRef | undefined;
  peer: Peer = new Peer({
    host: 'localhost',
    port: 9000
  });
  keypair: pki.KeyPair | undefined;

  connections: { [key: string]: Connection } = {};

  peerEstablished: boolean = false;
  connectionEstablished: boolean = true; // this will manually be set to true if is in the connector route
  keyPairInitialized: boolean = false;
  establishedStatus: boolean = false;
  initializedConnector: string | undefined;

  constructor(
    private router: Router,
    private ngZone: NgZone,
  ) {
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
          status: ConnectionStatus.CONNECTING,
          peer: connection,
          publicKey: undefined,
        };
      }

      // wait for the destination peer to send their public key
      this.connections[connection.peer].peer.on('data', this.dataListener(connection.peer));

      // Listen for disconnections
      this.connections[connection.peer].peer.on('close', this.disconnectListener(connection.peer));
    });
  }

  establishConnection(destinationId: string) {
    // Initiate a store for the connection
    this.connections[destinationId] = {
      status: ConnectionStatus.CONNECTING,
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

      // Listen for disconnections
      this.connections[destinationId].peer.on('close', this.disconnectListener(destinationId));
    });

    // TODO: Add a timeout for the connection to be established, and if it isn't, handle it
    setTimeout(() => {
      console.log(this.connections[destinationId]);
      if (this.connections[destinationId].status === 'connecting') {
        console.error('Connection timed out');
        const alert = this.rootContainer?.createComponent(AlertComponent)!;
        alert.setInput('title', 'Connection timed out');
        alert.setInput('message', 'The connection to the destination peer timed out, but the connection may still try to establish.');
      }
    }, 10000);
  }

  getPeerList() {
    return Object.keys(this.connections).map((id) => id).filter((id) => this.connections[id].status === 'connected');
  }

  connectToPeers(peers: string[]) {
    for (const peer of peers) {
      if (!this.connections[peer]) {
        this.establishConnection(peer);
      }
    }
  }

  dataListener(id: string) {
    return (data: any) => {
      switch (data.type) {
        // connector to receiver
        case 'establish': {
          this.connections[id].publicKey = data.publicKey;
          this.connections[id].status = ConnectionStatus.CONNECTED;
          this.connections[id].peer.send({
            type: 'acknowledge',
            publicKey: this.getPublicKeyAsPem(),
            peers: this.getPeerList().filter((peer) => peer !== id),
          });
          // keep the chain of connections
          this.keepPeerChain(id);
          return;
        }
        // receiver answer to connector
        case 'acknowledge': {
          this.connections[id].publicKey = data.publicKey;
          this.connections[id].status = ConnectionStatus.CONNECTED;

          this.connectToPeers(data.peers);

          this.connectionEstablished = true; // the connection is now established
          this.updateEstablishedStatus();
          return;
        }
        default: {
          console.error('Unknown data type', data.type);
        }
      }
    }
  }

  disconnectListener(id: string) {
    return () => {
      // set the connection status to disconnected
      this.connections[id].status = ConnectionStatus.DISCONNECTED;
      // if the connection disconnected was the one in the connector route, push the user to another route
      this.keepPeerChain(id);
    }
  }

  keepPeerChain(id: string) {
    if (!this.initializedConnector || this.initializedConnector === id) {
      // find a peer that is still connected
      const connectedPeer = Object.keys(this.connections).find((peer) => this.connections[peer].status === 'connected');

      this.initializedConnector = connectedPeer;

      // if there is a connected peer, push the user to that peer's route
      if (connectedPeer) {
        this.ngZone.run(() => this.router.navigate(['/', connectedPeer])).then(_ => {} );
      } else {
        this.ngZone.run(() => this.router.navigate(['/'])).then(_ => {} );
      }
    }
  }

  initKeyPair() {
    if (this.loadKeyPair()) {
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
    this.establishedStatus = this.peerEstablished && this.keyPairInitialized && this.connectionEstablished;
  }

  setWelcomeModalShown() {
    localStorage.setItem('welcomeModalShown', 'true');
  }

  getWelcomeModalShown() {
    return localStorage.getItem('welcomeModalShown') === 'true';
  }
}
