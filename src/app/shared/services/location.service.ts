import { Inject, Injectable, Signal, signal } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { WeatherService } from "./weather.service";

export const LOCATIONS: string = "locations";

@Injectable()
export class LocationService {
  private locationsSignal = signal<string[]>([]);

  constructor(@Inject(WeatherService) private weatherService: WeatherService) {
    let locationsString = localStorage.getItem(LOCATIONS);
    if (locationsString) {
      const locations = JSON.parse(locationsString);
      this.locationsSignal.set(locations);
    }
  }

  get locations(): Signal<string[]> {
    return this.locationsSignal.asReadonly();
  }

  addLocation(zipcode: string) {
    this.locationsSignal.update((locations) => {
      if (locations.includes(zipcode)) {
        alert("Location already exists");
        return locations;
      }
      const newLocations = [...locations, zipcode];
      this.updateLocalStorage(newLocations);
      return newLocations;
    });
  }

  removeLocation(zipcode: string) {
    this.locationsSignal.update((locations) => {
      const index = locations.indexOf(zipcode);
      if (index !== -1) {
        const newLocations = locations.filter((loc) => loc !== zipcode);
        this.weatherService.removeCurrentConditions(zipcode);
        this.updateLocalStorage(newLocations);
        return newLocations;
      }
      return locations;
    });
  }

  private updateLocalStorage(locations: string[]) {
    localStorage.setItem(LOCATIONS, JSON.stringify(locations));
  }
}
