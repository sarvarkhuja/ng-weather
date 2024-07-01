import { Component, inject } from "@angular/core";
import { LocationService } from "../shared/services/location.service";
import { WeatherService } from "app/shared/services/weather.service";
import { NgDestroy } from "app/shared/services/ng-destroy.service";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "app-zipcode-entry",
  templateUrl: "./zipcode-entry.component.html",
  providers: [NgDestroy],
})
export class ZipcodeEntryComponent {
  private weatherService = inject(WeatherService);
  private locationService = inject(LocationService);
  private destroy$ = inject(NgDestroy);

  addLocation(zipcode: string) {
    if (zipcode.length !== 5) {
      alert("Please enter a valid zipcode");
      return;
    }

    this.weatherService.addCurrentConditions(zipcode).subscribe((data) => {
      if (data) {
        this.locationService.addLocation(zipcode);
        const conditionsAndZip = this.weatherService.createConditionsAndZip(
          zipcode,
          data
        );
        this.weatherService.cacheConditions(zipcode, conditionsAndZip);
        this.weatherService.currentConditions.update((conditions) => [
          ...conditions,
          conditionsAndZip,
        ]);
      }
    });
  }
}
