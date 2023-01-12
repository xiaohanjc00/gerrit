// Copyright (C) 2017 The Android Open Source Project
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package com.google.gerrit.index.project;

import static com.google.gerrit.index.SchemaUtil.schema;

import com.google.common.collect.ImmutableList;
import com.google.gerrit.index.Schema;
import com.google.gerrit.index.SchemaDefinitions;

/**
 * Definition of project index versions (schemata). See {@link SchemaDefinitions}.
 *
 * <p>Upgrades are subject to constraints, see {@code
 * com.google.gerrit.index.IndexUpgradeValidator}.
 */
public class ProjectSchemaDefinitions extends SchemaDefinitions<ProjectData> {

  @Deprecated
  static final Schema<ProjectData> V1 =
      schema(
          /* version= */ 1,
          ImmutableList.of(
              ProjectField.NAME_FIELD,
              ProjectField.DESCRIPTION_FIELD,
              ProjectField.PARENT_NAME_FIELD,
              ProjectField.NAME_PART_FIELD,
              ProjectField.ANCESTOR_NAME_FIELD),
          ImmutableList.of(
              ProjectField.NAME_SPEC,
              ProjectField.DESCRIPTION_SPEC,
              ProjectField.PARENT_NAME_SPEC,
              ProjectField.NAME_PART_SPEC,
              ProjectField.ANCESTOR_NAME_SPEC));

  @Deprecated
  static final Schema<ProjectData> V2 =
      schema(
          V1,
          ImmutableList.of(ProjectField.REF_STATE),
          ImmutableList.of(ProjectField.STATE_FIELD),
          ImmutableList.of(ProjectField.STATE_SPEC));

  // Bump Lucene version requires reindexing
  @Deprecated static final Schema<ProjectData> V3 = schema(V2);

  // Lucene index was changed to add an additional field for sorting.
  @Deprecated static final Schema<ProjectData> V4 = schema(V3);

  // Upgrade Lucene to 7.x requires reindexing.
  static final Schema<ProjectData> V5 = schema(V4);

  /**
   * Name of the project index to be used when contacting index backends or loading configurations.
   */
  public static final String NAME = "projects";

  /** Singleton instance of the schema definitions. This is one per JVM. */
  public static final ProjectSchemaDefinitions INSTANCE = new ProjectSchemaDefinitions();

  private ProjectSchemaDefinitions() {
    super(NAME, ProjectData.class);
  }
}
