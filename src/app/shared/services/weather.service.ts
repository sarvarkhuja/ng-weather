import { Injectable, Signal, signal } from "@angular/core";
import { Observable, of } from "rxjs";

import { HttpClient, HttpParams } from "@angular/common/http";
import { CurrentConditions } from "../interfaces/current-conditions.type";

import { Forecast, ForecastWithUpdatedDate } from "../interfaces/forecast.type";
import { map, tap } from "rxjs/operators";
import {
  ConditionsAndZip,
  ConditionsAndZipWithUpdatedDate,
} from "../interfaces/conditions-and-zip.type";

export const DURATION_FOR_CACHE = 1000 * 60 * 60 * 2; // 2 hours
@Injectable()
export class WeatherService {
  private static CONFIG: WeatherConfig = {
    API_URL: "https://api.openweathermap.org/data/2.5",
    APP_ID: "5a4b2d457ecbef9eb2a71e480b947604",
    ICON_BASE_URL:
      "https://raw.githubusercontent.com/udacity/Sunshine-Version-2/sunshine_master/app/src/main/res/drawable-hdpi/",
  };

  private currentConditions = signal<ConditionsAndZip[]>([]);

  public getCurrentConditions(): Signal<ConditionsAndZip[]> {
    return this.currentConditions.asReadonly();
  }
  constructor(private http: HttpClient) {}

  private concatPrefixAndZipcode(
    zipcode: string,
    prefix: "CurrentCondition-" | "Forecast-" = "CurrentCondition-"
  ): string {
    return prefix + zipcode;
  }

  private getForecastKey(zipcode: string) {
    return this.concatPrefixAndZipcode(zipcode, "Forecast-");
  }

  private getCurrentConditionKey(zipcode: string) {
    return this.concatPrefixAndZipcode(zipcode, "CurrentCondition-");
  }

  private getForecastOnCache(zipcode: string) {
    const forecast: ForecastWithUpdatedDate | null = JSON.parse(
      localStorage.getItem(this.getForecastKey(zipcode))
    );
    if (forecast && !this.isExpiredCacheData(forecast.updatedDate)) {
      return forecast;
    }
    return null;
  }
  private isExpiredCacheData(updatedDate: string) {
    const difference = new Date().getTime() - new Date(updatedDate).getTime();
    return difference >= DURATION_FOR_CACHE;
  }

  public getAllCurrentConditions(locations: string[]): void {
    this.clearCurrentConditions();
    locations.forEach((loc) => this.addCurrentConditions(loc));
  }

  private addCurrentConditions(zipcode: string): void {
    if (this.getCachedCurrentCondition(zipcode)) return;

    const params = new HttpParams()
      .set("zip", `${zipcode},us`)
      .set("units", "imperial")
      .set("APPID", WeatherService.CONFIG.APP_ID);

    this.http
      .get<CurrentConditions>(`${WeatherService.CONFIG.API_URL}/weather`, {
        params,
      })
      .pipe(
        map((data) => ({
          zip: zipcode,
          data,
          updatedDate: new Date().toLocaleString(),
        }))
      )
      .subscribe((conditionsAndZip) => {
        this.updateLocalStorage(zipcode, conditionsAndZip);
        this.updateCurrentConditions(conditionsAndZip);
      });
  }

  private clearCurrentConditions() {
    this.currentConditions.set([]);
  }

  private getCachedCurrentCondition(
    zipcode: string
  ): ConditionsAndZipWithUpdatedDate | null {
    const cachedData = localStorage.getItem(
      this.getCurrentConditionKey(zipcode)
    );
    if (!cachedData) return null;

    const parsedData: ConditionsAndZipWithUpdatedDate = JSON.parse(cachedData);
    if (this.isExpiredCacheData(parsedData.updatedDate)) return null;

    this.updateCurrentConditions(parsedData);
    return parsedData;
  }

  private updateLocalStorage(
    zipcode: string,
    data: ConditionsAndZipWithUpdatedDate
  ): void {
    localStorage.setItem(
      this.getCurrentConditionKey(zipcode),
      JSON.stringify(data)
    );
  }

  private updateCurrentConditions(
    newCondition: ConditionsAndZipWithUpdatedDate
  ): void {
    this.currentConditions.update((conditions) => [
      ...conditions,
      newCondition,
    ]);
  }

  public getForecast(zipcode: string): Observable<Forecast> {
    const forecastOnCache = this.getForecastOnCache(zipcode);
    if (forecastOnCache) return of(forecastOnCache);
    const params = new HttpParams()
      .set("zip", `${zipcode},us`)
      .set("units", "imperial")
      .set("cnt", "5")
      .set("APPID", WeatherService.CONFIG.APP_ID);
    return this.http
      .get<Forecast>(`${WeatherService.CONFIG.API_URL}/forecast/daily`, {
        params,
      })
      .pipe(
        tap((data) => {
          localStorage.setItem(
            this.getForecastKey(zipcode),
            JSON.stringify({
              ...data,
              updatedDate: new Date().toLocaleString(),
            } as ForecastWithUpdatedDate)
          );
        })
      );
  }

  public getWeatherIcon(id: number): string {
    const iconMap = {
      storm: [200, 232],
      rain: [501, 511],
      light_rain: [500, 520, 531],
      snow: [600, 622],
      clouds: [801, 804],
      fog: [741, 761],
    };

    for (const [weather, range] of Object.entries(iconMap)) {
      if (id >= range[0] && id <= range[1]) {
        return `${WeatherService.CONFIG.ICON_BASE_URL}art_${weather}.png`;
      }
    }

    return `${WeatherService.CONFIG.ICON_BASE_URL}art_clear.png`;
  }
}
