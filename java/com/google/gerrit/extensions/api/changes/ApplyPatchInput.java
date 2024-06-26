// Copyright (C) 2022 The Android Open Source Project
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

package com.google.gerrit.extensions.api.changes;

import com.google.gerrit.common.Nullable;

/** Information about a patch to apply. */
public class ApplyPatchInput {
  /**
   * Required. The patch to be applied.
   *
   * <p>Must be compatible with `git diff` output. For example, Gerrit API `Get Patch` output.
   */
  public String patch;

  /**
   * If {@code true}, the operation will succeed if a conflict is detected. Conflict markers will be
   * added to the conflicting files.
   */
  @Nullable public Boolean allowConflicts;
}
