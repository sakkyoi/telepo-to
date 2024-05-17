import { Component } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { GlobalService } from "../../global.service";

@Component({
  selector: 'app-connector',
  standalone: true,
  imports: [],
  templateUrl: './connector.component.html',
  styleUrl: './connector.component.css'
})
export class ConnectorComponent {
  destinationId!: string;

  constructor(
    private route: ActivatedRoute,
    protected global: GlobalService
  ) {
    this.global.connectionEstablished = false;
    this.route.params.subscribe(params => {
      this.destinationId = params['id'];
    });

    // wait for the peer to be established
    this.global.peer.on('open', (_) => {
      this.global.initializedConnector = this.destinationId;
      global.establishConnection(this.destinationId);
    });
  }
}
