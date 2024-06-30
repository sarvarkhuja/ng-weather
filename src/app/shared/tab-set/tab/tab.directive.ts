import { Directive, ElementRef, Input, TemplateRef } from "@angular/core";

@Directive({
  selector: "tab",
})
export class TabDirective {
  @Input()
  title: string | TemplateRef<any>;

  constructor(public elementRef: ElementRef) {
    elementRef.nativeElement.style.border = "1px solid #ddd";
    elementRef.nativeElement.style.padding = "20px";
  }
}
