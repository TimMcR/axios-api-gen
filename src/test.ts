import {
  AdvancedQueryColumnFilter,
  AdvancedQueryColumnSort,
} from './apphire/index.defs';

type DateValue = Date | null;
type DatesRangeValue = [DateValue, DateValue];
type DatePickerType = 'default' | 'multiple' | 'range';
type DatePickerValue<Type extends DatePickerType = 'default'> =
  Type extends 'range'
    ? DatesRangeValue
    : Type extends 'multiple'
      ? Date[]
      : DateValue;

function Test<T extends DatePickerType = 'default'>(
  type: T = 'default' as T,
): DatePickerValue<T> {
  if (type === 'default') {
    return null as DatePickerValue<T>;
  }

  if (type === 'multiple') {
    const val: Date[] = [];

    return val as DatePickerValue<T>;
  }

  return null as DatePickerValue<T>;
}

const x = Test('multiple');

type GET_ROUTE_TYPE = '/api/announcements' | '/api/badges';
type GET_ROUTE_PARAMS_TYPE<Type extends GET_ROUTE_TYPE> =
  Type extends '/api/announcements'
    ? {
        locationId?: number;
        hideInactive?: boolean;
        hideGlobal?: boolean;
        hideDisabled?: boolean;
        page?: number;
        pageSize?: number;
        searchFieldNames?: Array<string>;
        searchSearchText?: string;
        searchExactMatch?: boolean;
        filtered?: Array<AdvancedQueryColumnFilter>;
        sorted?: Array<AdvancedQueryColumnSort>;
      }
    : Type extends '/api/badges'
      ? {
          page?: number;
          pageSize?: number;
          searchFieldNames?: Array<string>;
          searchSearchText?: string;
          searchExactMatch?: boolean;
          filtered?: Array<AdvancedQueryColumnFilter>;
          sorted?: Array<AdvancedQueryColumnSort>;
        }
      : null;

function get<T extends GET_ROUTE_TYPE>(
  route: T,
  params: GET_ROUTE_PARAMS_TYPE<T>,
) {}

get('/api/badges', {});

export class TestApi {
  static readonly get = async <T extends GET_ROUTE_TYPE>(
    route: T,
    params: GET_ROUTE_PARAMS_TYPE<T>,
  ) => {};
}
