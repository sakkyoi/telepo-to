import { Routes } from '@angular/router';
import { ReceiverComponent } from "./receiver/receiver.component";
import { ConnectorComponent } from "./connector/connector.component";

export const routes: Routes = [
  { path: '', component: ReceiverComponent },
  { path: ':id', component: ConnectorComponent },
];
