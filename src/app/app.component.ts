import { Component, CUSTOM_ELEMENTS_SCHEMA, ViewChild, ViewContainerRef } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { QRCodeModule } from 'angularx-qrcode';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { iconoirQrCode, iconoirCopy, iconoirBrightCrown } from '@ng-icons/iconoir';
import { LoadingComponent } from "./loading/loading.component";
import { ThemeSwitcherComponent } from "./theme-switcher/theme-switcher.component";
import { ModalComponent } from "./modal/modal.component";
import { GlobalService } from "../global.service";
import { KeyValuePipe } from "@angular/common";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    LoadingComponent,
    ThemeSwitcherComponent,
    ModalComponent,
    QRCodeModule,
    NgIconComponent,
    KeyValuePipe,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers: [provideIcons({ iconoirQrCode, iconoirCopy, iconoirBrightCrown })],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
})
export class AppComponent {
  title = 'telepo-to';

  @ViewChild('welcomeModal') welcomeModal!: ModalComponent;

  constructor(
    protected globalService: GlobalService,
    private viewContainer: ViewContainerRef,
  ) {
    this.globalService.rootContainer = viewContainer;
  }

  ngAfterViewInit() {
    if (!this.globalService.getWelcomeModalShown()) this.welcomeModal.showModal(); // Show the welcome modal if it hasn't been shown yet
  }

  test() {
    console.log(this.globalService.connections);
  }

  protected readonly window = window;
  protected readonly navigator = navigator;
}
