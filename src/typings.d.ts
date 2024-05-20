import { DataConnection } from "peerjs";
import { pki } from "node-forge";

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
