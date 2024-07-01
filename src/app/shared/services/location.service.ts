import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

export const LOCATIONS: string = "locations";

@Injectable()
export class LocationService {
  locations: string[] = [];
  locations$ = new BehaviorSubject<string[]>(this.locations);

  constructor() {
    let locationsString = localStorage.getItem(LOCATIONS);
    if (locationsString) {
      this.locations = JSON.parse(locationsString);
      this.locations$.next(this.locations);
    }
  }

  addLocation(zipcode: string) {
    if (this.locations.indexOf(zipcode) !== -1) {
      alert("Location already exists");
      return;
    }
    this.locations.push(zipcode);
    localStorage.setItem(LOCATIONS, JSON.stringify(this.locations));
    this.locations$.next(this.locations);
  }

  removeLocation(zipcode: string) {
    let index = this.locations.indexOf(zipcode);
    if (index !== -1) {
      this.locations.splice(index, 1);
      localStorage.setItem(LOCATIONS, JSON.stringify(this.locations));
      this.locations$.next(this.locations);
    }
  }
}
