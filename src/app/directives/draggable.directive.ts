import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appDraggable]'
})
export class DraggableDirective {
  private isDragging = false;
  private initialMarginLeft = 0; // Store the initial margin-left value as a percentage

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    this.isDragging = true;
    const startMarginLeft = parseFloat(this.el.nativeElement.style.marginLeft) || 0;
    this.initialMarginLeft = startMarginLeft;

    const parentWidth = this.el.nativeElement.parentElement.offsetWidth;
    const handleWidth = this.el.nativeElement.offsetWidth;

    const moveListener = (moveEvent: MouseEvent) => {
      if (this.isDragging) {
        const offsetX = moveEvent.clientX - event.clientX;
        let newMarginLeft = this.initialMarginLeft + (offsetX / parentWidth) * 100; // Convert offsetX to percentage
        newMarginLeft = Math.min(Math.max(0, newMarginLeft), 100 - (handleWidth / parentWidth) * 100); // Ensure it stays within boundaries

        // Calculate the margin-left in percentage
        const percentage = newMarginLeft + '%';

        // Update the handle position
        this.renderer.setStyle(this.el.nativeElement, 'margin-left', percentage);
      }
    };

    const upListener = () => {
      if (this.isDragging) {
        this.isDragging = false;

        // Calculate the final percentage of drag
        const finalMarginLeft = parseFloat(this.el.nativeElement.style.marginLeft) || 0;
        const finalPercentage = finalMarginLeft;

        // Trigger a custom event with the percentage
        const dragEndEvent = new CustomEvent('dragend', {
          detail: { percentage: finalPercentage }
        });
        this.el.nativeElement.dispatchEvent(dragEndEvent);
      }

      // Remove event listeners
      window.removeEventListener('mousemove', moveListener);
      window.removeEventListener('mouseup', upListener);
    };

    window.addEventListener('mousemove', moveListener);
    window.addEventListener('mouseup', upListener);
  }
}
