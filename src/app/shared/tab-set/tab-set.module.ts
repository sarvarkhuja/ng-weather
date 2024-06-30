import { NgModule } from "@angular/core";

import { TabSetComponent } from "./tab-set.component";
import { CommonModule } from "@angular/common";
import { TabDirective } from "./tab/tab.directive";

@NgModule({
  imports: [CommonModule],
  exports: [TabSetComponent, TabDirective],
  declarations: [TabSetComponent, TabDirective],
  providers: [],
})
export class TabSetModule {}
