/*
 * Copyright 2021 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  Box,
  Button,
  Checkbox,
  TextField,
  TextFieldProps,
  makeStyles,
} from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import React, { useEffect, useMemo, useState } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/lib/useAsync';
import { catalogApiRef } from '../../../apis';
import {
  EntityErrorFilter,
  EntityKindFilter,
  EntityLifecycleFilter,
  EntityNamespaceFilter,
  EntityOrphanFilter,
  EntityOwnerFilter,
  EntityTagFilter,
  EntityTextFilter,
  EntityTypeFilter,
  UserListFilter,
  EntityFilter,
  useEntityList,
} from '@backstage/plugin-catalog-react';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CancelIcon from '@material-ui/icons/Cancel';
import countries from './countries';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import { EntityAnnotationFilter } from '../EntityAnnotationPicker/EntityAnnotationPicker';

/** @public */
type DefaultEntityFilters = {
  kind?: EntityKindFilter;
  type?: EntityTypeFilter;
  user?: UserListFilter;
  owners?: EntityOwnerFilter;
  lifecycles?: EntityLifecycleFilter;
  tags?: EntityTagFilter;
  text?: EntityTextFilter;
  orphan?: EntityOrphanFilter;
  error?: EntityErrorFilter;
  namespace?: EntityNamespaceFilter;
  annotations?: EntityAnnotationFilter;
};

interface CountryType {
  code: string;
  label: string;
  phone: string;
  group: string;
}

const countryToFlag = (isoCode: string) => {
  return typeof String.fromCodePoint !== 'undefined'
    ? isoCode
        .toUpperCase()
        .replace(/./g, char =>
          String.fromCodePoint(char.charCodeAt(0) + 127397),
        )
    : isoCode;
};

const useStyles = makeStyles({
  autocomplete: {
    width: '300px',
  },
  option: {
    fontSize: 15,
    '& > span': {
      marginRight: 10,
      fontSize: 18,
    },
  },
});

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

/** @public */
export type AllowedEntityFilters<T extends DefaultEntityFilters> = {
  [K in keyof T]-?: NonNullable<T[K]> extends EntityFilter & {
    values: string[];
  }
    ? K
    : never;
}[keyof T];

/** @public */
export type EntityAutocompletePickerProps<
  T extends DefaultEntityFilters = DefaultEntityFilters,
  Name extends AllowedEntityFilters<T> = AllowedEntityFilters<T>,
> = {
  label: string;
  name: Name;
  path: string;
  showCounts?: boolean;
  Filter: { new (values: string[]): NonNullable<T[Name]> };
  InputProps?: TextFieldProps;
  initialSelectedOptions?: string[];
};

/** @public */
  export function EntityAutocompletePicker<
    T extends DefaultEntityFilters = DefaultEntityFilters,
    Name extends AllowedEntityFilters<T> = AllowedEntityFilters<T>,
  >({ label, name, path, Filter, initialSelectedOptions = [] }: EntityAutocompletePickerProps<T, Name>) {
  const classes = useStyles();
  const [selectedCountries, setSelectedCountries] = useState<CountryType[]>([]);
  // console.log({ selectedCountries });

  const {
    updateFilters,
    filters,
    queryParameters: { [name]: queryParameter },
  } = useEntityList<T>();

  const catalogApi = useApi(catalogApiRef);
  const { value: availableValues } = useAsync(async () => {
    const facet = path;
    const { facets } = await catalogApi.getEntityFacets({
      facets: [facet],
      filter: filters.kind?.getCatalogFilters(),
    });

    return Object.fromEntries(
      facets[facet].map(({ value, count }) => [value, count]),
    );
  }, [filters.kind]);

  const queryParameters = useMemo(
    () => [queryParameter].flat().filter(Boolean) as string[],
    [queryParameter],
  );

  const [selectedOptions, setSelectedOptions] = useState(
    queryParameters.length
      ? queryParameters
      : (filters[name] as unknown as { values: string[] })?.values ??
          initialSelectedOptions,
  );

  // Set selected options on query parameter updates; this happens at initial page load and from
  // external updates to the page location
  useEffect(() => {
    if (queryParameters.length) {
      setSelectedOptions(queryParameters);
    }
  }, [queryParameters]);

  const availableOptions = Object.keys(availableValues ?? {});
  const shouldAddFilter = selectedOptions.length && availableOptions.length;

  useEffect(() => {
    updateFilters({
      [name]: shouldAddFilter ? new Filter(selectedOptions) : undefined,
    } as Partial<T>);
  }, [name, shouldAddFilter, selectedOptions, Filter, updateFilters]);

  const filter = filters[name];
  if (
    (filter && typeof filter === 'object' && !('values' in filter)) ||
    !availableOptions.length
  ) {
    return null;
  }

  // Hide if there are 1 or fewer options; nothing to pick from
  if (availableOptions.length <= 1) return null;

  const checkOption = (option: CountryType) => {
    const check = selectedCountries.some(c => c.code === option.code);
    return check;
  };

  const checkGroup = (group: string) => {
    const groupLength = countries.filter(c => c.group === group).length;
    const selectedGroupLength = selectedCountries.filter(
      c => c.group === group,
    ).length;
    return groupLength === selectedGroupLength;
  };

  const selectGroup = (group: string) => {
    const groupedCountries = countries.filter(c => c.group === group);
    const selectedGroupCountries = selectedCountries.filter(
      c => c.group === group,
    );

    if (selectedGroupCountries.length > 0) {
      setSelectedCountries(prevState => [
        ...prevState.filter(c => c.group !== group),
      ]);
    } else {
      setSelectedCountries(prevState => [...prevState, ...groupedCountries]);
    }
  };

  const unselectOption = (code: string) => {
    setSelectedCountries(prevState => prevState.filter(c => c.code !== code));
  };

  return (
    <Box pb={1} pt={1}>
      {label}
      <Autocomplete
        className={classes.autocomplete}
        id="country-select-demo"
        options={countries as CountryType[]}
        classes={{
          option: classes.option,
        }}
        onChange={(_, option) =>
          setSelectedCountries([...(option as CountryType[])])
        }
        value={selectedCountries}
        // inputValue=""
        autoHighlight
        multiple
        disableCloseOnSelect
        getOptionSelected={(option, value) => option.code === value.code}
        getOptionLabel={option => option.label}
        groupBy={option => option.group}
        renderOption={option => (
          <>
            <Checkbox
              key={option.code}
              icon={icon}
              checkedIcon={checkedIcon}
              checked={checkOption(option)}
            />
            <span>{countryToFlag(option.code)}</span>
            {option.label} ({option.code}) +{option.phone}
          </>
        )}
        renderGroup={params => (
          <>
            <Checkbox
              key={params.group}
              icon={icon}
              checkedIcon={checkedIcon}
              checked={checkGroup(params.group)}
              onChange={() => selectGroup(params.group)}
            />
            <span>{params.group}</span>
            {params.children}
          </>
        )}
        renderInput={params => {
          return (
            <TextField
              {...params}
              label="Choose a country"
              variant="outlined"
              inputProps={{
                ...params.inputProps,
                autoComplete: 'new-password', // disable autocomplete and autofill
              }}
            />
          );
        }}
        renderTags={() => {
          return selectedCountries.map(tag => (
            <Button
              size="small"
              variant="contained"
              key={tag.code}
              endIcon={<CancelIcon />}
              onClick={() => unselectOption(tag.code)}
            >
              {tag.label}
            </Button>
          ));
        }}
      />
    </Box>
  );
}
