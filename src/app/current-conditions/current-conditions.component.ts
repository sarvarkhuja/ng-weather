import { Component, inject, OnInit, Signal } from "@angular/core";
import { WeatherService } from "../shared/services/weather.service";
import { LocationService } from "../shared/services/location.service";
import { Router } from "@angular/router";
import { ConditionsAndZip } from "../shared/interfaces/conditions-and-zip.type";
import { NgDestroy } from "app/shared/services/ng-destroy.service";
import { takeUntil } from "rxjs/operators";

const ACTIVE_TAB_INDEX = "activeTabIndex";

@Component({
  selector: "app-current-conditions",
  templateUrl: "./current-conditions.component.html",
  styleUrls: ["./current-conditions.component.css"],
  providers: [NgDestroy],
})
export class CurrentConditionsComponent implements OnInit {
  private weatherService = inject(WeatherService);
  private router = inject(Router);

  protected locationService = inject(LocationService);
  protected currentConditionsByZip: Signal<ConditionsAndZip[]> =
    this.weatherService.getCurrentConditions();

  public get activeTabIndex(): number {
    const activeTabIndex = +localStorage.getItem(ACTIVE_TAB_INDEX);
    return activeTabIndex;
  }
  public set activeTabIndex(v: number) {
    localStorage.setItem(ACTIVE_TAB_INDEX, v.toString());
  }

  ngOnInit(): void {
    this.listenLocationsChange();
  }

  private listenLocationsChange() {
    this.weatherService.getAllCurrentConditions(
      this.locationService.locations()
    );
  }

  showForecast(zipcode: string) {
    this.router.navigate(["/forecast", zipcode]);
  }

  removeCondition(index: number) {
    const zipcode = this.currentConditionsByZip()[index].zip;
    this.locationService.removeLocation(zipcode);
    if (index < this.activeTabIndex) this.activeTabIndex--;
    else if (index === this.activeTabIndex) this.activeTabIndex = 0;
  }
}
