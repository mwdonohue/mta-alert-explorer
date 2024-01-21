import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Observable, forkJoin, map } from 'rxjs';
import { stations } from './stations';
import Event from '../../../common/types/event';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  startDate: string = '';
  endDate: string = '';
  events: Array<Event>;
  serviceForm!: FormGroup;
  serviceHover?: string;
  typeForm!: FormGroup;
  typeHover?: string;
  stopForm!: FormGroup;
  stopHover?: string;
  constructor(private httpClient: HttpClient, private fb: FormBuilder) {
    this.events = [];
    let observables = [this.getServices(), this.getTypes(), this.getStops()];

    forkJoin(observables).subscribe(([services, types, stops]) => {
      this.serviceForm = this.fb.group({
        servicesArray: this.fb.array(
          (() => {
            let x: any = services.map((svc) =>
              this.fb.group({
                name: svc,
                id: svc,
                selected: true,
              })
            );

            x.push(
              this.fb.group({
                name: 'Untagged',
                id: [],
                selected: true,
              })
            );

            return x;
          })()
        ),
      });
      this.typeForm = this.fb.group({
        typeArray: this.fb.array(
          (() => {
            let x: any = types.map((type) => {
              return this.fb.group({
                name: type,
                id: type,
                selected: true,
              });
            });
            x.push(
              this.fb.group({
                name: 'Untagged',
                id: ['Untagged'],
                selected: true,
              })
            );

            return x;
          })()
        ),
      });

      this.stopForm = this.fb.group({
        stopArray: this.fb.array(
          (() => {
            let x: any = stops.map((stop: keyof any) => {
              return this.fb.group({
                name:
                  stations[stop]['stop_name'] +
                  ' | ' +
                  stations[stop]['routes'] +
                  ' | ' +
                  stations[stop]['borough'],
                id: stop,
                selected: true,
              });
            });

            x.push(
              this.fb.group({
                name: 'Untagged',
                id: [],
                selected: true,
              })
            );

            return x;
          })()
        ),
      });
      this.getEvents();
    });
  }
  ngOnInit(): void {
    this.startDate = this.getStartDate();
    this.endDate = this.getEndDate();
  }

  get servicesArray() {
    return this.serviceForm.get('servicesArray') as FormArray;
  }

  get typeArray() {
    return this.typeForm.get('typeArray') as FormArray;
  }

  get stopArray() {
    return this.stopForm.get('stopArray') as FormArray;
  }

  setServiceHover($e: any) {
    this.serviceHover = $e;
  }
  getServiceFormFilterButton(): string {
    let numSelected = this.serviceForm.value.servicesArray.filter(
      (e: any) => e.selected === true
    ).length;

    let service = this.serviceForm.value.servicesArray.find(
      (e: any) => e.selected === true
    );

    if (numSelected === 1 && service.id === this.serviceHover) {
      return 'All';
    }
    return 'Only';
  }
  handleServiceFilterClick($e: any) {
    if ($e.filterText === 'Only') {
      let newServiceArray = this.serviceForm.value.servicesArray.map(
        (e: any) => {
          if (e.id === $e.filter) {
            e.selected = true;
          } else {
            e.selected = false;
          }
          return e;
        }
      );

      this.servicesArray.setValue(newServiceArray);
    } else if ($e.filterText === 'All') {
      let newServiceArray = this.serviceForm.value.servicesArray.map(
        (e: any) => {
          e.selected = true;
          return e;
        }
      );

      this.servicesArray.setValue(newServiceArray);
    }

    this.getEvents();
  }

  setTypeHover($e: any) {
    this.typeHover = $e;
  }
  getTypeFormFilterButton(): string {
    let numSelected = this.typeForm.value.typeArray.filter(
      (e: any) => e.selected === true
    ).length;

    let type = this.typeForm.value.typeArray.find(
      (e: any) => e.selected === true
    );

    if (numSelected === 1 && type.id === this.typeHover) {
      return 'All';
    }
    return 'Only';
  }
  handleTypeFilterClick($e: any) {
    if ($e.filterText === 'Only') {
      let newTypeArray = this.typeForm.value.typeArray.map((e: any) => {
        if (e.id === $e.filter) {
          e.selected = true;
        } else {
          e.selected = false;
        }
        return e;
      });

      this.typeArray.setValue(newTypeArray);
    } else if ($e.filterText === 'All') {
      let newTypeArray = this.typeForm.value.typeArray.map((e: any) => {
        e.selected = true;
        return e;
      });

      this.typeArray.setValue(newTypeArray);
    }

    this.getEvents();
  }

  setStopHover($e: any) {
    this.stopHover = $e;
  }
  getStopFormFilterButton(): string {
    let numSelected = this.stopForm.value.stopArray.filter(
      (e: any) => e.selected === true
    ).length;

    let stop = this.stopForm.value.stopArray.find(
      (e: any) => e.selected === true
    );

    if (numSelected === 1 && stop.id === this.stopHover) {
      return 'All';
    }
    return 'Only';
  }
  handleStopFilterClick($e: any) {
    if ($e.filterText === 'Only') {
      let newStopArray = this.stopForm.value.stopArray.map((e: any) => {
        if (e.id === $e.filter) {
          e.selected = true;
        } else {
          e.selected = false;
        }
        return e;
      });

      this.stopArray.setValue(newStopArray);
    } else if ($e.filterText === 'All') {
      let newStopArray = this.stopForm.value.stopArray.map((e: any) => {
        e.selected = true;
        return e;
      });

      this.stopArray.setValue(newStopArray);
    }

    this.getEvents();
  }

  getEvents() {
    this.httpClient
      .post<Array<Event>>('http://localhost:3000/events', {
        startDate: new Date(this.startDate),
        endDate: new Date(this.endDate),
        services: this.serviceForm.value.servicesArray
          .map((svcctrl: any) => {
            if (svcctrl.selected === true) {
              return svcctrl.id;
            }
          })
          .filter((svc: any) => svc !== undefined),
        types: this.typeForm.value.typeArray
          .map((typecontrol: any) => {
            if (typecontrol.selected === true) {
              return typecontrol.id;
            }
          })
          .filter((type: any) => type !== undefined),
        stops: this.stopForm.value.stopArray
          .map((typecontrol: any) => {
            if (typecontrol.selected === true) {
              return typecontrol.id;
            }
          })
          .filter((type: any) => type !== undefined),
      })
      .subscribe((events) => {
        this.events = events;
      });
  }

  getServices(): Observable<Array<string>> {
    return this.httpClient.get<Array<string>>('http://localhost:3000/services');
  }

  getTypes(): Observable<Array<string>> {
    return this.httpClient.get<Array<string>>('http://localhost:3000/types');
  }

  getStops(): Observable<Array<string>> {
    return this.httpClient.get<Array<string>>('http://localhost:3000/stops');
  }

  getStartDate() {
    let ssd = new Date().getTime();
    let sd = new Date(ssd - new Date().getTimezoneOffset() * 60000);
    sd.setUTCHours(0);
    sd.setUTCMinutes(0);
    sd.setUTCSeconds(0);
    sd.setUTCMilliseconds(0);
    return sd.toISOString().replace('Z', '');
  }

  getEndDate() {
    let ssd = new Date().getTime();
    let sd = new Date(ssd - new Date().getTimezoneOffset() * 60000);
    sd.setUTCHours(23);
    sd.setUTCMinutes(59);
    sd.setUTCSeconds(0);
    sd.setUTCMilliseconds(0);
    return sd.toISOString().replace('Z', '');
  }
}
