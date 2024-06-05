import { Component, CUSTOM_ELEMENTS_SCHEMA, ViewChild, ViewContainerRef } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { QRCodeModule } from 'angularx-qrcode';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  iconoirBrightCrown,
  iconoirCopy,
  iconoirQrCode,
  iconoirDataTransferDown,
  iconoirDataTransferUp,
  iconoirArrowDownLeft,
  iconoirArrowUpRight,
  iconoirCloudUpload,
} from '@ng-icons/iconoir';
import { LoadingComponent } from "./loading/loading.component";
import { ThemeSwitcherComponent } from "./theme-switcher/theme-switcher.component";
import { ModalComponent } from "./modal/modal.component";
import { GlobalService } from "../global.service";
import { IMAGE_LOADER, ImageLoaderConfig, KeyValuePipe, NgOptimizedImage } from "@angular/common";
import { createAvatar } from "@dicebear/core";
import { thumbs } from "@dicebear/collection";

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
    NgOptimizedImage,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers: [
    provideIcons({
      iconoirQrCode,
      iconoirCopy,
      iconoirBrightCrown,
      iconoirDataTransferDown,
      iconoirDataTransferUp,
      iconoirArrowDownLeft,
      iconoirArrowUpRight,
      iconoirCloudUpload,
    }),
    {
      provide: IMAGE_LOADER,
      useValue: (config: ImageLoaderConfig) => {
        return createAvatar(thumbs, Object.assign(
          {
            seed: config.src,
          },
          config,
        )).toDataUriSync();
      }
    }],
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
