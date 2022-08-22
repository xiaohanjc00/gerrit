/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import '../../../test/common-test-setup-karma';
import './gr-edit-file-controls';
import {GrEditFileControls} from './gr-edit-file-controls';
import {GrEditConstants} from '../gr-edit-constants';
import {queryAndAssert} from '../../../test/test-utils';
import {GrDropdown} from '../../shared/gr-dropdown/gr-dropdown';
import * as MockInteractions from '@polymer/iron-test-helpers/mock-interactions';
import {fixture, html} from '@open-wc/testing-helpers';

suite('gr-edit-file-controls tests', () => {
  let element: GrEditFileControls;

  let fileActionHandler: sinon.SinonStub;

  setup(async () => {
    element = await fixture(
      html`<gr-edit-file-controls></gr-edit-file-controls>`
    );
    fileActionHandler = sinon.stub();
    element.addEventListener('file-action-tap', fileActionHandler);
    await element.updateComplete;
  });

  test('render', () => {
    assert.shadowDom.equal(
      element,
      /* HTML */ `
        <gr-dropdown down-arrow="" id="actions" link="" vertical-offset="20">
          Actions
        </gr-dropdown>
      `
    );
  });

  test('open tap emits event', async () => {
    const actions = queryAndAssert<GrDropdown>(element, '#actions');
    element.filePath = 'foo';
    actions.open();
    await actions.updateComplete;

    const row = queryAndAssert(actions, 'li [data-id="open"]');
    MockInteractions.tap(row);
    assert.isTrue(fileActionHandler.called);
    assert.deepEqual(fileActionHandler.lastCall.args[0].detail, {
      action: GrEditConstants.Actions.OPEN.id,
      path: 'foo',
    });
  });

  test('delete tap emits event', async () => {
    const actions = queryAndAssert<GrDropdown>(element, '#actions');
    element.filePath = 'foo';
    actions.open();
    await actions.updateComplete;

    const row = queryAndAssert(actions, 'li [data-id="delete"]');
    MockInteractions.tap(row);
    assert.isTrue(fileActionHandler.called);
    assert.deepEqual(fileActionHandler.lastCall.args[0].detail, {
      action: GrEditConstants.Actions.DELETE.id,
      path: 'foo',
    });
  });

  test('restore tap emits event', async () => {
    const actions = queryAndAssert<GrDropdown>(element, '#actions');
    element.filePath = 'foo';
    actions.open();
    await actions.updateComplete;

    const row = queryAndAssert(actions, 'li [data-id="restore"]');
    MockInteractions.tap(row);
    assert.isTrue(fileActionHandler.called);
    assert.deepEqual(fileActionHandler.lastCall.args[0].detail, {
      action: GrEditConstants.Actions.RESTORE.id,
      path: 'foo',
    });
  });

  test('rename tap emits event', async () => {
    const actions = queryAndAssert<GrDropdown>(element, '#actions');
    element.filePath = 'foo';
    actions.open();
    await actions.updateComplete;

    const row = queryAndAssert(actions, 'li [data-id="rename"]');
    MockInteractions.tap(row);
    assert.isTrue(fileActionHandler.called);
    assert.deepEqual(fileActionHandler.lastCall.args[0].detail, {
      action: GrEditConstants.Actions.RENAME.id,
      path: 'foo',
    });
  });

  test('computed properties', () => {
    assert.equal(element._allFileActions.length, 4);
  });
});
