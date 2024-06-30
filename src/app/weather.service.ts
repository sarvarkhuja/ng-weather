import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { tap } from "rxjs/operators";
import {
  ConditionsAndZip,
  ConditionsAndZipWithUpdatedDate,
} from "./conditions-and-zip.type";
import { CurrentConditions } from "./current-conditions/current-conditions.type";
import {
  Forecast,
  ForecastWithUpdatedDate,
} from "./forecasts-list/forecast.type";
import { Injectable, signal, Signal } from "@angular/core";

const CACHE_DURATION = 1000; // 2 hours in milliseconds

interface WeatherConfig {
  API_URL: string;
  APP_ID: string;
  ICON_BASE_URL: string;
}

@Injectable()
export class WeatherService {
  private static CONFIG: WeatherConfig = {
    API_URL: "https://api.openweathermap.org/data/2.5",
    APP_ID: "5a4b2d457ecbef9eb2a71e480b947604",
    ICON_BASE_URL:
      "https://raw.githubusercontent.com/udacity/Sunshine-Version-2/sunshine_master/app/src/main/res/drawable-hdpi/",
  };

  private currentConditions = signal<ConditionsAndZip[]>([]);

  constructor(private http: HttpClient) {}

  getAllCurrentConditions(locations: string[]): void {
    this.currentConditions.set([]);
    locations.forEach((loc) => this.addCurrentConditions(loc));
  }

  addCurrentConditions(zipcode: string): void {
    if (this.getConditionsFromCache(zipcode)) return;

    this.fetchCurrentConditions(zipcode).subscribe((data) => {
      const conditionsAndZip = this.createConditionsAndZip(zipcode, data);
      this.cacheConditions(zipcode, conditionsAndZip);
      this.currentConditions.update((conditions) => [
        ...conditions,
        conditionsAndZip,
      ]);
    });
  }

  removeCurrentConditions(zipcode: string): void {
    this.currentConditions.update((conditions) =>
      conditions.filter((condition) => condition.zip !== zipcode)
    );
  }

  getCurrentConditions(): Signal<ConditionsAndZip[]> {
    return this.currentConditions.asReadonly();
  }

  getForecast(zipcode: string): Observable<Forecast> {
    const cachedForecast = this.getForecastFromCache(zipcode);
    if (cachedForecast) return of(cachedForecast);

    return this.fetchForecast(zipcode).pipe(
      tap((data) => this.cacheForecast(zipcode, data))
    );
  }

  getWeatherIcon(id: number): string {
    const iconMap = {
      storm: [200, 232],
      rain: [501, 511],
      lightRain: [500, 520, 531],
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

  private getConditionsFromCache(zipcode: string): boolean {
    const key = this.getCacheKey(zipcode, "CurrentCondition");
    const cachedData: ConditionsAndZipWithUpdatedDate | null = JSON.parse(
      localStorage.getItem(key)
    );

    if (cachedData && !this.isCacheExpired(cachedData.updatedDate)) {
      this.currentConditions.update((conditions) => [
        ...conditions,
        { ...cachedData },
      ]);
      return true;
    }

    return false;
  }

  private getForecastFromCache(
    zipcode: string
  ): ForecastWithUpdatedDate | null {
    const key = this.getCacheKey(zipcode, "Forecast");
    const cachedData: ForecastWithUpdatedDate | null = JSON.parse(
      localStorage.getItem(key)
    );

    return cachedData && !this.isCacheExpired(cachedData.updatedDate)
      ? cachedData
      : null;
  }

  private fetchCurrentConditions(
    zipcode: string
  ): Observable<CurrentConditions> {
    const params = this.getCommonParams(zipcode);

    return this.http.get<CurrentConditions>(
      `${WeatherService.CONFIG.API_URL}/weather`,
      { params }
    );
  }

  private fetchForecast(zipcode: string): Observable<Forecast> {
    const params = this.getCommonParams(zipcode).set("cnt", "5");

    return this.http.get<Forecast>(
      `${WeatherService.CONFIG.API_URL}/forecast/daily`,
      { params }
    );
  }

  private getCommonParams(zipcode: string): HttpParams {
    return new HttpParams()
      .set("zip", `${zipcode},us`)
      .set("units", "imperial")
      .set("APPID", WeatherService.CONFIG.APP_ID);
  }

  private createConditionsAndZip(
    zipcode: string,
    data: CurrentConditions
  ): ConditionsAndZipWithUpdatedDate {
    return {
      zip: zipcode,
      data,
      updatedDate: new Date().toLocaleString(),
    };
  }

  private cacheConditions(
    zipcode: string,
    data: ConditionsAndZipWithUpdatedDate
  ): void {
    const key = this.getCacheKey(zipcode, "CurrentCondition");
    localStorage.setItem(key, JSON.stringify(data));
  }

  private cacheForecast(zipcode: string, data: Forecast): void {
    const key = this.getCacheKey(zipcode, "Forecast");
    const dataWithTimestamp: ForecastWithUpdatedDate = {
      ...data,
      updatedDate: new Date().toLocaleString(),
    };
    localStorage.setItem(key, JSON.stringify(dataWithTimestamp));
  }

  private getCacheKey(
    zipcode: string,
    prefix: "CurrentCondition" | "Forecast"
  ): string {
    return `${prefix}-${zipcode}`;
  }

  private isCacheExpired(updatedDate: string): boolean {
    const difference = new Date().getTime() - new Date(updatedDate).getTime();
    return difference >= CACHE_DURATION;
  }
}
