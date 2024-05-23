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
    protected globalService: GlobalService
  ) {
    this.globalService.connectionEstablished = false;
    this.route.params.subscribe(params => {
      this.destinationId = params['id'];
    });

    // wait for the peer to be established
    this.globalService.peer.on('open', (_) => {
      this.globalService.initializedConnector = this.destinationId;
      globalService.establishConnection(this.destinationId);
    });
  }
}
