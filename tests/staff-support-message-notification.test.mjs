import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('Staff Support message notifications: NewMessageNotifier supports staff role with sound and link to dashboard', () => {
  const notifierPath = path.resolve(process.cwd(), 'components/NewMessageNotifier.jsx');
  assert.ok(fs.existsSync(notifierPath), 'NewMessageNotifier.jsx must exist');

  const content = fs.readFileSync(notifierPath, 'utf8');

  // Must import and trigger sound chime
  assert.ok(content.includes('playNotificationChime'), 'Must import and invoke playNotificationChime');
  assert.ok(content.includes('playNotificationChime()'), 'Must play audio chime on new message');

  // Must route staff to /dashboard/messages
  assert.ok(
    content.includes('user?.role === "counsellor" ? "/counsellor-portal/messages" : "/dashboard/messages"'),
    'Must route staff to /dashboard/messages and counsellors to /counsellor-portal/messages'
  );

  // Must render sender name for staff from peer/message, and "Staff Support" for counsellors
  assert.ok(
    content.includes('user?.role === "counsellor"\n      ? "Staff Support"'),
    'Must display Staff Support for counsellors'
  );
  assert.ok(
    content.includes('peerNameOverride || msg.from_user?.name || msg.fromUser?.name || (msg.type === "counsellor_to_staff" ? "Counsellor" : "Staff Support")'),
    'Must resolve counsellor/sender name or fallback to Counsellor for staff'
  );

  // Must render message toast body and link
  assert.ok(content.includes('A new secure message is waiting in your portal.'), 'Must display notification text');
  assert.ok(content.includes('View Message'), 'Must include View Message action');

  // Must listen to staff group and user channel
  assert.ok(content.includes('messages.staff_group'), 'Must listen to staff_group channel');
  assert.ok(content.includes('getUnreadMessageCount'), 'Must poll unread message count');
});

test('Staff Support message notifications: audio chime helper handles audio context and volume control', () => {
  const audioPath = path.resolve(process.cwd(), 'lib/audio.js');
  assert.ok(fs.existsSync(audioPath), 'lib/audio.js must exist');

  const content = fs.readFileSync(audioPath, 'utf8');
  assert.ok(content.includes('playNotificationChime'), 'Must export playNotificationChime');
  assert.ok(content.includes('unlockAudio'), 'Must export unlockAudio');
  assert.ok(content.includes('isAudioMuted'), 'Must check mute state');
  assert.ok(content.includes('resume()'), 'Must resume suspended audio context');
});

test('Staff Support message notifications: DashboardLayout does not mount duplicate NewMessageNotifier', () => {
  const layoutPath = path.resolve(process.cwd(), 'components/DashboardLayout.jsx');
  assert.ok(fs.existsSync(layoutPath), 'DashboardLayout.jsx must exist');

  const content = fs.readFileSync(layoutPath, 'utf8');
  assert.ok(!content.includes('<NewMessageNotifier />'), 'DashboardLayout must not duplicate NewMessageNotifier (mounted in Providers.jsx)');
});

test('Communications group badge: DashboardSidebar displays unread badge and updates on real-time events', () => {
  const sidebarPath = path.resolve(process.cwd(), 'components/DashboardSidebar.jsx');
  assert.ok(fs.existsSync(sidebarPath), 'DashboardSidebar.jsx must exist');

  const content = fs.readFileSync(sidebarPath, 'utf8');

  // Must define badge property on communications-group
  assert.ok(
    content.includes('id: "communications-group"') &&
    content.includes('badge: (unreadMessageCount || 0) + (unreadStaffNotesCount || 0)'),
    'Communications group must calculate badge from unread messages and staff notes'
  );

  // Must render badge pill with red background when groupBadgeCount > 0
  assert.ok(
    content.includes('{groupBadgeCount > 0 && (') &&
    content.includes('bg-red-500 text-white') &&
    content.includes('{groupBadgeCount}'),
    'Must render red notification badge pill on expandable group'
  );

  // Must listen to refresh-sidebar-data and vqt-unread-messages-count
  assert.ok(content.includes('refresh-sidebar-data'), 'Sidebar must listen for refresh-sidebar-data');
  assert.ok(content.includes('vqt-unread-messages-count'), 'Sidebar must listen for vqt-unread-messages-count');
});
