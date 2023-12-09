import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-filter-entry',
  templateUrl: './filter-entry.component.html',
  styleUrls: ['./filter-entry.component.scss'],
})
export class FilterEntryComponent {
  @Input()
  text?: string;

  @Input()
  filterText?: string;

  @Input()
  filter?: any;

  @Output()
  clickedFilter: EventEmitter<any> = new EventEmitter();

  @Output()
  hoveredFilter: EventEmitter<any> = new EventEmitter();

  onFilterClick() {
    this.clickedFilter.emit({
      filterText: this.filterText,
      filter: this.filter,
    });
  }

  onFilterHover() {
    this.hoveredFilter.emit(this.filter);
  }
}
