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

package com.google.gerrit.server.project;

import com.google.gerrit.entities.Account;
import com.google.gerrit.entities.Change;
import com.google.gerrit.entities.PatchSetApproval;
import com.google.gerrit.extensions.restapi.AuthException;
import com.google.gerrit.extensions.restapi.ResourceConflictException;
import com.google.gerrit.server.CurrentUser;
import com.google.gerrit.server.notedb.ChangeNotes;
import com.google.gerrit.server.permissions.ChangePermission;
import com.google.gerrit.server.permissions.GlobalPermission;
import com.google.gerrit.server.permissions.PermissionBackend;
import com.google.gerrit.server.permissions.PermissionBackendException;
import com.google.gerrit.server.permissions.RefPermission;
import com.google.gerrit.server.query.change.ChangeData;
import com.google.inject.Inject;
import com.google.inject.Singleton;

@Singleton
public class RemoveReviewerControl {
  private final PermissionBackend permissionBackend;
  private final ChangeData.Factory changeDataFactory;

  @Inject
  RemoveReviewerControl(PermissionBackend permissionBackend, ChangeData.Factory changeDataFactory) {
    this.permissionBackend = permissionBackend;
    this.changeDataFactory = changeDataFactory;
  }

  /**
   * Checks if removing the given reviewer and patch set approval is OK.
   *
   * @throws AuthException if this user is not allowed to remove this approval.
   * @throws PermissionBackendException on failure of permission checks.
   * @throws ResourceConflictException if the approval cannot be removed because the change is
   *     merged
   */
  public void checkRemoveReviewer(
      ChangeNotes notes, CurrentUser currentUser, PatchSetApproval approval)
      throws PermissionBackendException, AuthException, ResourceConflictException {
    if (notes.getChange().isMerged() && approval.value() != 0) {
      throw new ResourceConflictException("cannot remove votes from merged change");
    }

    checkRemoveReviewer(notes, currentUser, approval.accountId(), approval.value());
  }

  /**
   * Checks if removing the given reviewer is OK. Does not check if removing any approvals the
   * reviewer might have given is OK.
   *
   * @throws AuthException if this user is not allowed to remove this approval.
   * @throws PermissionBackendException on failure of permission checks.
   */
  public void checkRemoveReviewer(ChangeNotes notes, CurrentUser currentUser, Account.Id reviewer)
      throws PermissionBackendException, AuthException {
    checkRemoveReviewer(notes, currentUser, reviewer, 0);
  }

  /** Returns true if the user is allowed to remove this reviewer. */
  public boolean testRemoveReviewer(
      ChangeNotes notes, CurrentUser currentUser, PatchSetApproval approval)
      throws PermissionBackendException {
    return testRemoveReviewer(notes, currentUser, approval.accountId(), approval.value());
  }

  /** Returns true if the user is allowed to remove this reviewer. */
  public boolean testRemoveReviewer(
      ChangeNotes notes, CurrentUser currentUser, Account.Id reviewer, int value)
      throws PermissionBackendException {
    return testRemoveReviewer(changeDataFactory.create(notes), currentUser, reviewer, value);
  }

  /** Returns true if the user is allowed to remove this reviewer. */
  public boolean testRemoveReviewer(
      ChangeData cd, CurrentUser currentUser, Account.Id reviewer, int value)
      throws PermissionBackendException {
    if (cd.change().isMerged() && value != 0) {
      return false;
    }

    if (canRemoveReviewerWithoutPermissionCheck(cd.change(), currentUser, reviewer, value)) {
      return true;
    }

    // Users with the remove reviewer permission, the branch owner, project
    // owner and site admin can remove anyone
    PermissionBackend.WithUser withUser = permissionBackend.user(currentUser);
    PermissionBackend.ForProject forProject = withUser.project(cd.project());
    return (forProject.ref(cd.change().getDest().branch()).test(RefPermission.WRITE_CONFIG)
            || withUser.test(GlobalPermission.ADMINISTRATE_SERVER))
        || withUser.change(cd).test(ChangePermission.REMOVE_REVIEWER);
  }

  private void checkRemoveReviewer(
      ChangeNotes notes, CurrentUser currentUser, Account.Id reviewer, int value)
      throws PermissionBackendException, AuthException {
    if (canRemoveReviewerWithoutPermissionCheck(notes.getChange(), currentUser, reviewer, value)) {
      return;
    }

    // Users with the remove reviewer permission, the branch owner, project
    // owner and site admin can remove anyone
    PermissionBackend.WithUser withUser = permissionBackend.user(currentUser);
    PermissionBackend.ForProject forProject = withUser.project(notes.getProjectName());
    if (forProject.ref(notes.getChange().getDest().branch()).test(RefPermission.WRITE_CONFIG)
        || withUser.test(GlobalPermission.ADMINISTRATE_SERVER)) {
      return;
    }
    permissionBackend.user(currentUser).change(notes).check(ChangePermission.REMOVE_REVIEWER);
  }

  public static boolean canRemoveReviewerWithoutPermissionCheck(
      Change change, CurrentUser currentUser, Account.Id reviewer, int value) {
    if (currentUser.isIdentifiedUser()) {
      Account.Id aId = currentUser.getAccountId();
      if (aId.equals(reviewer)) {
        return true; // A user can always remove themselves.
      } else if (aId.equals(change.getOwner()) && 0 <= value) {
        return true; // The change owner may remove any zero or positive score.
      }
    }

    return false;
  }
}
