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

import { makeStyles } from '@material-ui/core';
import React from 'react';
import { EntityAutocompletePicker } from '../EntityAutocompletePicker';
import { Entity } from '@backstage/catalog-model';
import { EntityFilter } from '@backstage/plugin-catalog-react';

/** @public */
export type CatalogReactEntityTagPickerClassKey = 'input';

/** @public */
export type EntityTagPickerProps = {
  showCounts?: boolean;
};

const useStyles = makeStyles(
  { input: {} },
  { name: 'CatalogReactEntityTagPicker' },
);

/**
 * Filters entities based on annotation.
 * @public
 */
export class EntityAnnotationFilter implements EntityFilter {
  constructor(readonly values: string[]) {}

  filterEntity(entity: Entity): boolean {
    return this.values.some(value => {
      const annotation = entity.metadata.annotations?.['backstage.io/view-url'];
      return annotation === value;
    });
  }

  getCatalogFilters(): Record<string, string | string[]> {
    return { 'metadata.annotations.backstage.io/view-url': this.values };
  }

  toQueryValue(): string[] {
    return this.values;
  }
}


/** @public */
export const EntityAnnotationPicker = (props: EntityTagPickerProps) => {
  const classes = useStyles();

  return (
    <EntityAutocompletePicker
      label="annotations"
      name="annotations"
      path="metadata.annotations.backstage.io/view-url"
      Filter={EntityAnnotationFilter}
      showCounts={props.showCounts}
      InputProps={{ className: classes.input }}     />
  );
};
