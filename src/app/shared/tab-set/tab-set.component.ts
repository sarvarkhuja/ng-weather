import {
  AfterContentChecked,
  AfterContentInit,
  Component,
  ContentChild,
  ContentChildren,
  EventEmitter,
  Input,
  OnInit,
  Output,
  Query,
  QueryList,
  TemplateRef,
} from "@angular/core";
import { TabDirective } from "./tab/tab.directive";

@Component({
  selector: "tab-set",
  templateUrl: "./tab-set.component.html",
  styles: [
    `
      .nav-link.active {
        border-color: #e4e4e4;
        border-bottom: 0;
      }

      .nav-link .close {
        margin-left: 5px;
      }

      .nav-item {
        cursor: pointer;
      }

      .nav-tabs {
        border: none;
      }

      .tab-set {
        position: relative;
      }
    `,
  ],
})
export class TabSetComponent implements AfterContentChecked {
  @Input()
  closable = false;

  @Input()
  activeTabIndex = 0;

  @Output()
  activeTabIndexChange = new EventEmitter<number>();

  @Output()
  closeTab = new EventEmitter<number>();

  @ContentChildren(TabDirective)
  tabs?: QueryList<TabDirective>;

  get titles() {
    return this.tabs.map((tab) => tab.title);
  }

  private treatActiveTab() {
    this.tabs?.forEach((tab, index) => {
      if (index === this.activeTabIndex)
        tab.elementRef.nativeElement.style.display = "block";
      else tab.elementRef.nativeElement.style.display = "none";
    });
  }

  chooseTab(index: number) {
    this.activeTabIndex = index;
    this.activeTabIndexChange.emit(index);
  }

  close(e: PointerEvent, index: number) {
    e.stopPropagation();
    this.closeTab.emit(index);
  }

  isTitleString(title: string | TemplateRef<any>): title is string {
    return typeof title === "string";
  }

  ngAfterContentChecked(): void {
    this.treatActiveTab();
  }
}
