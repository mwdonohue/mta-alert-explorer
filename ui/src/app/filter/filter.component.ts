import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
})
export class FilterComponent {
  @Input()
  filterForm?: any;

  @Input()
  filterArrayName?: any;

  @Input()
  filterArray?: any;

  @Input()
  filterText?: any;

  @Output()
  onFilterChange: EventEmitter<any> = new EventEmitter();

  @Output()
  onFilterClick: EventEmitter<any> = new EventEmitter();

  @Output()
  onFilterHover: EventEmitter<any> = new EventEmitter();

  handleFilterChange() {
    this.onFilterChange.emit();
  }

  handleFilterClick($event: any) {
    this.onFilterClick.emit($event);
  }

  handleFilterHover($event: any) {
    this.onFilterHover.emit($event);
  }
}
