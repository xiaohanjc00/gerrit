/**
 * @license
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import '../../../test/common-test-setup-karma';
import './gr-message';
import {GerritNav} from '../../core/gr-navigation/gr-navigation';
import {
  createAccountWithIdNameAndEmail,
  createChange,
  createChangeMessage,
  createComment,
  createRevisions,
} from '../../../test/test-data-generators';
import {
  mockPromise,
  query,
  queryAndAssert,
  stubRestApi,
} from '../../../test/test-utils';
import {GrMessage} from './gr-message';
import {
  AccountId,
  BasePatchSetNum,
  ChangeMessageId,
  EmailAddress,
  NumericChangeId,
  PARENT,
  RevisionPatchSetNum,
  ReviewInputTag,
  Timestamp,
  UrlEncodedCommentId,
} from '../../../types/common';
import {tap} from '@polymer/iron-test-helpers/mock-interactions';
import {
  ChangeMessageDeletedEventDetail,
  ReplyEventDetail,
} from '../../../types/events';
import {GrButton} from '../../shared/gr-button/gr-button';
import {CommentSide} from '../../../constants/constants';
import {SinonStubbedMember} from 'sinon';
import {html} from 'lit';
import {fixture} from '@open-wc/testing-helpers';

suite('gr-message tests', () => {
  let element: GrMessage;

  suite('when admin and logged in', () => {
    setup(async () => {
      stubRestApi('getIsAdmin').returns(Promise.resolve(true));
      element = await fixture<GrMessage>(html`<gr-message></gr-message>`);
    });

    test('reply event', async () => {
      element.message = {
        ...createChangeMessage(),
        id: '47c43261_55aa2c41' as ChangeMessageId,
        author: {
          _account_id: 1115495 as AccountId,
          name: 'Andrew Bonventre',
          email: 'andybons@chromium.org' as EmailAddress,
        },
        date: '2016-01-12 20:24:49.448000000' as Timestamp,
        message: 'Uploaded patch set 1.',
        _revision_number: 1 as RevisionPatchSetNum,
        expanded: true,
      };

      const promise = mockPromise();
      element.addEventListener('reply', (e: CustomEvent<ReplyEventDetail>) => {
        assert.deepEqual(e.detail.message, element.message);
        promise.resolve();
      });
      await flush();
      assert.isOk(query<HTMLElement>(element, '.replyActionContainer'));
      tap(queryAndAssert(element, '.replyBtn'));
      await promise;
    });

    test('can see delete button', async () => {
      element.message = {
        ...createChangeMessage(),
        id: '47c43261_55aa2c41' as ChangeMessageId,
        author: {
          _account_id: 1115495 as AccountId,
          name: 'Andrew Bonventre',
          email: 'andybons@chromium.org' as EmailAddress,
        },
        date: '2016-01-12 20:24:49.448000000' as Timestamp,
        message: 'Uploaded patch set 1.',
        _revision_number: 1 as RevisionPatchSetNum,
        expanded: true,
      };
      await element.updateComplete;

      assert.isOk(query<HTMLElement>(element, '.deleteBtn'));
    });

    test('delete change message', async () => {
      element.changeNum = 314159 as NumericChangeId;
      element.message = {
        ...createChangeMessage(),
        id: '47c43261_55aa2c41' as ChangeMessageId,
        author: {
          _account_id: 1115495 as AccountId,
          name: 'Andrew Bonventre',
          email: 'andybons@chromium.org' as EmailAddress,
        },
        date: '2016-01-12 20:24:49.448000000' as Timestamp,
        message: 'Uploaded patch set 1.',
        _revision_number: 1 as RevisionPatchSetNum,
        expanded: true,
      };
      await element.updateComplete;

      const promise = mockPromise();
      element.addEventListener(
        'change-message-deleted',
        async (e: CustomEvent<ChangeMessageDeletedEventDetail>) => {
          await element.updateComplete;
          assert.deepEqual(e.detail.message, element.message);
          assert.isFalse(
            queryAndAssert<GrButton>(element, '.deleteBtn').disabled
          );
          promise.resolve();
        }
      );
      tap(queryAndAssert(element, '.deleteBtn'));
      await element.updateComplete;
      assert.isTrue(queryAndAssert<GrButton>(element, '.deleteBtn').disabled);
      await promise;
    });

    test('autogenerated prefix hiding', async () => {
      element.message = {
        ...createChangeMessage(),
        tag: 'autogenerated:gerrit:test' as ReviewInputTag,
        expanded: false,
      };
      await element.updateComplete;

      assert.isTrue(element.computeIsAutomated());
      expect(element).shadowDom.to.equal(/* HTML */ `<div class="collapsed">
        <div class="contentContainer">
          <div class="author">
            <gr-account-label class="authorLabel"> </gr-account-label>
            <gr-message-scores> </gr-message-scores>
          </div>
          <div class="content messageContent">
            <div class="hideOnOpen message">
              This is a message with id cm_id_1
            </div>
          </div>
          <span class="dateContainer">
            <span class="date">
              <gr-date-formatter showdateandtime="" withtooltip="">
              </gr-date-formatter>
            </span>
            <iron-icon
              icon="gr-icons:expand-more"
              id="expandToggle"
              title="Toggle expanded state"
            >
            </iron-icon>
          </span>
        </div>
      </div>`);

      element.hideAutomated = true;
      await element.updateComplete;

      expect(element).shadowDom.to.equal(/* HTML */ '');
    });

    test('reviewer message treated as autogenerated', async () => {
      element.message = {
        ...createChangeMessage(),
        tag: 'autogenerated:gerrit:test' as ReviewInputTag,
        reviewer: {},
        expanded: false,
      };
      await element.updateComplete;

      assert.isTrue(element.computeIsAutomated());
      expect(element).shadowDom.to.equal(/* HTML */ `<div class="collapsed">
        <div class="contentContainer">
          <div class="author">
            <gr-account-label class="authorLabel"> </gr-account-label>
            <gr-message-scores> </gr-message-scores>
          </div>
          <div class="content messageContent">
            <div class="hideOnOpen message">
              This is a message with id cm_id_1
            </div>
          </div>
          <span class="dateContainer">
            <span class="date">
              <gr-date-formatter showdateandtime="" withtooltip="">
              </gr-date-formatter>
            </span>
            <iron-icon
              icon="gr-icons:expand-more"
              id="expandToggle"
              title="Toggle expanded state"
            >
            </iron-icon>
          </span>
        </div>
      </div>`);

      element.hideAutomated = true;
      await element.updateComplete;

      expect(element).shadowDom.to.equal(/* HTML */ '');
    });

    test('batch reviewer message treated as autogenerated', async () => {
      element.message = {
        ...createChangeMessage(),
        type: 'REVIEWER_UPDATE',
        reviewer: {},
        expanded: false,
        updates: [],
      };
      await element.updateComplete;

      assert.isTrue(element.computeIsAutomated());
      expect(element).shadowDom.to.equal(/* HTML */ `<div class="collapsed">
        <div class="contentContainer">
          <div class="author">
            <gr-account-label class="authorLabel"> </gr-account-label>
            <gr-message-scores> </gr-message-scores>
          </div>
          <div class="content messageContent">
            <div class="hideOnOpen message">
              This is a message with id cm_id_1
            </div>
          </div>
          <div class="content"></div>
          <span class="dateContainer">
            <span class="date">
              <gr-date-formatter showdateandtime="" withtooltip="">
              </gr-date-formatter>
            </span>
            <iron-icon
              icon="gr-icons:expand-more"
              id="expandToggle"
              title="Toggle expanded state"
            >
            </iron-icon>
          </span>
        </div>
      </div>`);

      element.hideAutomated = true;
      await element.updateComplete;

      expect(element).shadowDom.to.equal(/* HTML */ '');
    });

    test('tag that is not autogenerated prefix does not hide', async () => {
      element.message = {
        ...createChangeMessage(),
        tag: 'something' as ReviewInputTag,
        expanded: false,
      };
      await element.updateComplete;

      assert.isFalse(element.computeIsAutomated());
      const rendered = /* HTML */ `<div class="collapsed">
        <div class="contentContainer">
          <div class="author">
            <gr-account-label class="authorLabel"> </gr-account-label>
            <gr-message-scores> </gr-message-scores>
          </div>
          <div class="content messageContent">
            <div class="hideOnOpen message">
              This is a message with id cm_id_1
            </div>
          </div>
          <span class="dateContainer">
            <span class="date">
              <gr-date-formatter showdateandtime="" withtooltip="">
              </gr-date-formatter>
            </span>
            <iron-icon
              icon="gr-icons:expand-more"
              id="expandToggle"
              title="Toggle expanded state"
            >
            </iron-icon>
          </span>
        </div>
      </div>`;
      expect(element).shadowDom.to.equal(rendered);

      element.hideAutomated = true;
      await element.updateComplete;
      console.error(element.computeIsAutomated());

      expect(element).shadowDom.to.equal(rendered);
    });

    test('reply button hidden unless logged in', () => {
      element.message = {
        ...createChangeMessage(),
        message: 'Uploaded patch set 1.',
        expanded: false,
      };
      element.loggedIn = false;
      assert.isFalse(element.computeShowReplyButton());
      element.loggedIn = true;
      assert.isTrue(element.computeShowReplyButton());
    });

    test('_computeShowOnBehalfOf', () => {
      const message = {
        ...createChangeMessage(),
        message: '...',
        expanded: false,
      };
      element.message = message;
      assert.isNotOk(element.computeShowOnBehalfOf());
      message.author = {_account_id: 1115495 as AccountId};
      assert.isNotOk(element.computeShowOnBehalfOf());
      message.real_author = {_account_id: 1115495 as AccountId};
      assert.isNotOk(element.computeShowOnBehalfOf());
      message.real_author._account_id = 123456 as AccountId;
      assert.isOk(element.computeShowOnBehalfOf());
      message.updated_by = message.author;
      delete message.author;
      assert.isOk(element.computeShowOnBehalfOf());
      delete message.updated_by;
      assert.isNotOk(element.computeShowOnBehalfOf());
    });

    test('clicking on date link fires event', async () => {
      element.message = {
        ...createChangeMessage(),
        type: 'REVIEWER_UPDATE',
        reviewer: {},
        id: '47c43261_55aa2c41' as ChangeMessageId,
        expanded: false,
        updates: [],
      };
      await element.updateComplete;

      const stub = sinon.stub();
      element.addEventListener('message-anchor-tap', stub);
      const dateEl = queryAndAssert(element, '.date');
      assert.ok(dateEl);
      tap(dateEl);

      assert.isTrue(stub.called);
      assert.deepEqual(stub.lastCall.args[0].detail, {id: element.message?.id});
    });

    suite('uploaded patchset X message navigates to X - 1 vs  X', () => {
      let navStub: SinonStubbedMember<typeof GerritNav.navigateToChange>;
      setup(() => {
        element.change = {...createChange(), revisions: createRevisions(4)};
        navStub = sinon.stub(GerritNav, 'navigateToChange');
      });

      test('Patchset 1 navigates to Base', () => {
        element.message = {
          ...createChangeMessage(),
          message: 'Uploaded patch set 1.',
        };
        element.handleViewPatchsetDiff(new MouseEvent('click'));
        assert.isTrue(
          navStub.calledWithExactly(element.change!, {
            patchNum: 1 as RevisionPatchSetNum,
            basePatchNum: PARENT,
          })
        );
      });

      test('Patchset X navigates to X vs X - 1', () => {
        element.message = {
          ...createChangeMessage(),
          message: 'Uploaded patch set 2.',
        };
        element.handleViewPatchsetDiff(new MouseEvent('click'));
        assert.isTrue(
          navStub.calledWithExactly(element.change!, {
            patchNum: 2 as RevisionPatchSetNum,
            basePatchNum: 1 as BasePatchSetNum,
          })
        );

        element.message = {
          ...createChangeMessage(),
          message: 'Uploaded patch set 200.',
        };
        element.handleViewPatchsetDiff(new MouseEvent('click'));
        assert.isTrue(
          navStub.calledWithExactly(element.change!, {
            patchNum: 200 as RevisionPatchSetNum,
            basePatchNum: 199 as BasePatchSetNum,
          })
        );
      });

      test('Commit message updated', () => {
        element.message = {
          ...createChangeMessage(),
          message: 'Commit message updated.',
        };
        element.handleViewPatchsetDiff(new MouseEvent('click'));
        assert.isTrue(
          navStub.calledWithExactly(element.change!, {
            patchNum: 4 as RevisionPatchSetNum,
            basePatchNum: 3 as BasePatchSetNum,
          })
        );
      });

      test('Merged patchset change message', () => {
        element.message = {
          ...createChangeMessage(),
          message: 'abcd↵3 is the latest approved patch-set.↵abc',
        };
        element.handleViewPatchsetDiff(new MouseEvent('click'));
        assert.isTrue(
          navStub.calledWithExactly(element.change!, {
            patchNum: 4 as RevisionPatchSetNum,
            basePatchNum: 3 as BasePatchSetNum,
          })
        );
      });
    });

    suite('compute messages', () => {
      test('empty', () => {
        assert.equal(
          element.computeMessageContent(
            true,
            '',
            undefined,
            '' as ReviewInputTag
          ),
          ''
        );
        assert.equal(
          element.computeMessageContent(
            false,
            '',
            undefined,
            '' as ReviewInputTag
          ),
          ''
        );
      });

      test('new patchset', () => {
        const original = 'Uploaded patch set 1.';
        const tag = 'autogenerated:gerrit:newPatchSet' as ReviewInputTag;
        let actual = element.computeMessageContent(true, original, [], tag);
        assert.equal(actual, original);
        actual = element.computeMessageContent(false, original, [], tag);
        assert.equal(actual, original);
      });

      test('new patchset rebased', () => {
        const original = 'Patch Set 27: Patch Set 26 was rebased';
        const tag = 'autogenerated:gerrit:newPatchSet' as ReviewInputTag;
        const expected = 'Patch Set 26 was rebased';
        let actual = element.computeMessageContent(true, original, [], tag);
        assert.equal(actual, expected);
        actual = element.computeMessageContent(false, original, [], tag);
        assert.equal(actual, expected);
      });

      test('ready for review', () => {
        const original = 'Patch Set 1:\n\nThis change is ready for review.';
        const tag = undefined;
        const expected = 'This change is ready for review.';
        let actual = element.computeMessageContent(true, original, [], tag);
        assert.equal(actual, expected);
        actual = element.computeMessageContent(false, original, [], tag);
        assert.equal(actual, expected);
      });
      test('new patchset with vote', () => {
        const original = 'Uploaded patch set 2: Code-Review+1';
        const tag = 'autogenerated:gerrit:newPatchSet' as ReviewInputTag;
        const expected = 'Uploaded patch set 2: Code-Review+1';
        let actual = element.computeMessageContent(true, original, [], tag);
        assert.equal(actual, expected);
        actual = element.computeMessageContent(false, original, [], tag);
        assert.equal(actual, expected);
      });
      test('vote', () => {
        const original = 'Patch Set 1: Code-Style+1';
        const tag = undefined;
        const expected = '';
        let actual = element.computeMessageContent(true, original, [], tag);
        assert.equal(actual, expected);
        actual = element.computeMessageContent(false, original, [], tag);
        assert.equal(actual, expected);
      });

      test('comments', () => {
        const original = 'Patch Set 1:\n\n(3 comments)';
        const tag = undefined;
        const expected = '';
        let actual = element.computeMessageContent(true, original, [], tag);
        assert.equal(actual, expected);
        actual = element.computeMessageContent(false, original, [], tag);
        assert.equal(actual, expected);
      });

      test('message template', () => {
        const original =
          'Removed vote: \n\n * Code-Style+1 by <GERRIT_ACCOUNT_0000001>\n * Code-Style-1 by <GERRIT_ACCOUNT_0000002>';
        const tag = undefined;
        const expected =
          'Removed vote: \n\n * Code-Style+1 by User-1\n * Code-Style-1 by User-2';
        const accountsInMessage = [
          createAccountWithIdNameAndEmail(1),
          createAccountWithIdNameAndEmail(2),
        ];
        let actual = element.computeMessageContent(
          true,
          original,
          accountsInMessage,
          tag
        );
        assert.equal(actual, expected);
        actual = element.computeMessageContent(
          false,
          original,
          accountsInMessage,
          tag
        );
        assert.equal(actual, expected);
      });

      test('message template missing accounts', () => {
        const original =
          'Removed vote: \n\n * Code-Style+1 by <GERRIT_ACCOUNT_0000001>\n * Code-Style-1 by <GERRIT_ACCOUNT_0000002>';
        const tag = undefined;
        const expected =
          'Removed vote: \n\n * Code-Style+1 by Gerrit Account 1\n * Code-Style-1 by Gerrit Account 2';
        let actual = element.computeMessageContent(true, original, [], tag);
        assert.equal(actual, expected);
        actual = element.computeMessageContent(false, original, [], tag);
        assert.equal(actual, expected);
      });
    });
  });

  suite('when not logged in', () => {
    setup(async () => {
      stubRestApi('getLoggedIn').returns(Promise.resolve(false));
      stubRestApi('getIsAdmin').returns(Promise.resolve(false));
      element = await fixture<GrMessage>(html`<gr-message></gr-message>`);
    });

    test('reply and delete button should be hidden', async () => {
      element.message = {
        ...createChangeMessage(),
        id: '47c43261_55aa2c41' as ChangeMessageId,
        author: {
          _account_id: 1115495 as AccountId,
          name: 'Andrew Bonventre',
          email: 'andybons@chromium.org' as EmailAddress,
        },
        date: '2016-01-12 20:24:49.448000000' as Timestamp,
        message: 'Uploaded patch set 1.',
        _revision_number: 1 as RevisionPatchSetNum,
        expanded: true,
      };

      await element.updateComplete;
      assert.isNotOk(query<HTMLElement>(element, '.replyActionContainer'));
      assert.isNotOk(query<HTMLElement>(element, '.deleteBtn'));
    });
  });

  suite('patchset comment summary', async () => {
    setup(async () => {
      element = await fixture<GrMessage>(html`<gr-message></gr-message>`);
      element.message = {
        ...createChangeMessage(),
        id: '6a07f64a82f96e7337ca5f7f84cfc73abf8ac2a3' as ChangeMessageId,
      };
      await element.updateComplete;
    });

    test('single patchset comment posted', () => {
      element.commentThreads = [
        {
          comments: [
            {
              ...createComment(),
              change_message_id:
                '6a07f64a82f96e7337ca5f7f84cfc73abf8ac2a3' as ChangeMessageId,
              patch_set: 1 as RevisionPatchSetNum,
              id: 'e365b138_bed65caa' as UrlEncodedCommentId,
              updated: '2020-05-15 13:35:56.000000000' as Timestamp,
              message: 'testing the load',
              unresolved: false,
              path: '/PATCHSET_LEVEL',
            },
          ],
          patchNum: 1 as RevisionPatchSetNum,
          path: '/PATCHSET_LEVEL',
          rootId: 'e365b138_bed65caa' as UrlEncodedCommentId,
          commentSide: CommentSide.REVISION,
        },
      ];
      assert.equal(element.patchsetCommentSummary(), 'testing the load');
      assert.equal(
        element.computeMessageContent(false, '', undefined, undefined),
        ''
      );
    });

    test('single patchset comment with reply', () => {
      element.commentThreads = [
        {
          comments: [
            {
              ...createComment(),
              patch_set: 1 as RevisionPatchSetNum,
              id: 'e365b138_bed65caa' as UrlEncodedCommentId,
              updated: '2020-05-15 13:35:56.000000000' as Timestamp,
              message: 'testing the load',
              unresolved: false,
              path: '/PATCHSET_LEVEL',
            },
            {
              change_message_id: '6a07f64a82f96e7337ca5f7f84cfc73abf8ac2a3',
              patch_set: 1 as RevisionPatchSetNum,
              id: 'd6efcc85_4cbbb6f4' as UrlEncodedCommentId,
              in_reply_to: 'e365b138_bed65caa' as UrlEncodedCommentId,
              updated: '2020-05-15 16:55:28.000000000' as Timestamp,
              message: 'n',
              unresolved: false,
              path: '/PATCHSET_LEVEL',
              __draft: true,
            },
          ],
          patchNum: 1 as RevisionPatchSetNum,
          path: '/PATCHSET_LEVEL',
          rootId: 'e365b138_bed65caa' as UrlEncodedCommentId,
          commentSide: CommentSide.REVISION,
        },
      ];
      assert.equal(element.patchsetCommentSummary(), 'n');
      assert.equal(
        element.computeMessageContent(false, '', undefined, undefined),
        ''
      );
    });
  });

  suite('when logged in but not admin', () => {
    setup(async () => {
      stubRestApi('getIsAdmin').returns(Promise.resolve(false));
      element = await fixture<GrMessage>(html`<gr-message></gr-message>`);
    });

    test('can see reply but not delete button', async () => {
      element.message = {
        ...createChangeMessage(),
        id: '47c43261_55aa2c41' as ChangeMessageId,
        author: {
          _account_id: 1115495 as AccountId,
          name: 'Andrew Bonventre',
          email: 'andybons@chromium.org' as EmailAddress,
        },
        date: '2016-01-12 20:24:49.448000000' as Timestamp,
        message: 'Uploaded patch set 1.',
        _revision_number: 1 as RevisionPatchSetNum,
        expanded: true,
      };
      await element.updateComplete;

      assert.isOk(query<HTMLElement>(element, '.replyActionContainer'));
      assert.isNotOk(query<HTMLElement>(element, '.deleteBtn'));
    });

    test('reply button shown when message is updated', async () => {
      element.message = undefined;
      await element.updateComplete;

      let replyEl = query(element, '.replyActionContainer');
      // We don't even expect the button to show up in the DOM when the message
      // is undefined.
      assert.isNotOk(replyEl);

      element.message = {
        ...createChangeMessage(),
        id: '47c43261_55aa2c41' as ChangeMessageId,
        author: {
          _account_id: 1115495 as AccountId,
          name: 'Andrew Bonventre',
          email: 'andybons@chromium.org' as EmailAddress,
        },
        date: '2016-01-12 20:24:49.448000000' as Timestamp,
        message: 'not empty',
        _revision_number: 1 as RevisionPatchSetNum,
        expanded: true,
      };
      await element.updateComplete;

      replyEl = queryAndAssert(element, '.replyActionContainer');
      assert.isOk(replyEl);
    });
  });
});
