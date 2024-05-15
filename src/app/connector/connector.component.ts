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
    this.route.params.subscribe(params => {
      this.destinationId = params['id'];
    });

    // TODO: Implement the connection logic
    // wait for the peer to be established
    this.global.peer.on('open', (_) => {
      this.global.connections[this.destinationId] = this.global.peer.connect(this.destinationId);
      this.global.connections[this.destinationId].on('open', () => {
        // send a message to the destination peer
        this.global.connections[this.destinationId].send('Hello');
      });

      // listen for data from the destination peer
      this.global.connections[this.destinationId].on('data', (data) => {
        console.log('Received', data);
      });
    });
  }
}
