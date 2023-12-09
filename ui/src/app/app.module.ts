import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FilterEntryComponent } from './filter-entry/filter-entry.component';
import { EventListComponent } from './event-list/event-list.component';
import { FilterComponent } from './filter/filter.component';
import { PlotlyModule } from 'angular-plotly.js';
import * as PlotlyJS from 'plotly.js-dist-min';
import { CommonModule } from '@angular/common';

PlotlyModule.plotlyjs = PlotlyJS;
@NgModule({
  declarations: [
    AppComponent,
    FilterEntryComponent,
    EventListComponent,
    FilterComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    PlotlyModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
