import { Component } from "@angular/core";
import { LocationService } from "../../../shared/services/location.service";

@Component({
  selector: "app-zipcode-entry",
  templateUrl: "./zipcode-entry.component.html",
})
export class ZipcodeEntryComponent {
  constructor(private service: LocationService) {}

  addLocation(zipcode: string) {
    if (zipcode.length !== 5){
      alert("Please enter a valid zipcode");
      return;
    };
    
    this.service.addLocation(zipcode);
  }
}
