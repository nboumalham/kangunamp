import {Directive, ElementRef, HostListener} from '@angular/core';

@Directive({ selector: 'img' })
export class LazyImageDirective {
  constructor({ nativeElement }: ElementRef<HTMLImageElement>) {
    const supports = 'loading' in HTMLImageElement.prototype;

    if (supports) {
      nativeElement.setAttribute('loading', 'lazy');
    }
  }

  @HostListener('load', ['$event'])
  public onImageLoad(event: Event) {
    const target = event.target as HTMLImageElement;
    target.classList.add('loaded');
  }
  @HostListener('error', ['$event'])
  public onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = "/assets/images/album.png";
  }

}
