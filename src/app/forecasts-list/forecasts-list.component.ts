import { Component, Inject } from "@angular/core";
import { WeatherService } from "../shared/services/weather.service";
import { ActivatedRoute } from "@angular/router";
import { Forecast } from "../shared/interfaces/forecast.type";
import { NgDestroy } from "app/shared/services/ng-destroy.service";
import { pipe } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "app-forecasts-list",
  templateUrl: "./forecasts-list.component.html",
  styleUrls: ["./forecasts-list.component.css"],
  providers: [NgDestroy],
})
export class ForecastsListComponent {
  zipcode: string;
  forecast: Forecast;

  constructor(
    @Inject(WeatherService) public readonly weatherService: WeatherService,
    @Inject(ActivatedRoute) private readonly route: ActivatedRoute,
    @Inject(NgDestroy) private readonly destroy$: NgDestroy
  ) {
    route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.zipcode = params["zipcode"];
      weatherService
        .getForecast(this.zipcode)
        .subscribe((data) => (this.forecast = data));
    });
  }
}
