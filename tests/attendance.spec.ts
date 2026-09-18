import { test as base, expect } from '@playwright/test';
import { AttendanceApiPage } from '../src/pages/attendance-api.page';
import { AttendanceStatus } from '../src/models/attendance';
import { MockAttendanceServer } from './fixtures/mock-attendance-server';
import { attendanceWithParticipants, validAttendancePayload } from './config';

const test = base.extend<{ attendanceApi: AttendanceApiPage }>({
  attendanceApi: async ({ request }, use) => {
    const server = new MockAttendanceServer();
    await server.start();
    await use(new AttendanceApiPage(request, server.baseURL));
    await server.stop();
  },
});

test.describe('POST /api/v1/attendance', () => {
  test('happy path: records valid attendance', async ({ attendanceApi }) => {
    await attendanceApi.expectSuccess(validAttendancePayload());
  });

  test('Validation failure: rejects an unsupported attendance status', async ({ attendanceApi }) => {
    const invalidPayload = attendanceWithParticipants([
      { participant_id: 'YTH-8821', status: 'LATE' as AttendanceStatus },
    ]);
    const body = await attendanceApi.expectBadRequest(invalidPayload);
    expect(body.errors).toContain('participants[0].status must be PRESENT or ABSENT');
  });

  test('Validation failure: rejects a payload without mentor_id', async ({ attendanceApi }) => {
    const invalidPayload = { ...validAttendancePayload(), mentor_id: '' };
    const body = await attendanceApi.expectBadRequest(invalidPayload);
    expect(body.errors).toContain('mentor_id is required');
  });

  test('Validation failure: rejects a payload without session_date', async ({ attendanceApi }) => {
    const invalidPayload = { ...validAttendancePayload(), session_date: '' };
    const body = await attendanceApi.expectBadRequest(invalidPayload);
    expect(body.errors).toContain('session_date is required');
  });

  test('Edge case: rejects duplicate participant IDs', async ({ attendanceApi }) => {
    const duplicatePayload = attendanceWithParticipants([
      { participant_id: 'YTH-8821', status: AttendanceStatus.Present },
      { participant_id: 'YTH-8821', status: AttendanceStatus.Present },
    ]);
    const body = await attendanceApi.expectBadRequest(duplicatePayload);
    expect(body.errors).toContain('participant_ids must be unique');
  });

  test('Edge case: rejects an empty participants array', async ({ attendanceApi }) => {
    const emptyPayload = attendanceWithParticipants([]);
    const body = await attendanceApi.expectBadRequest(emptyPayload);
    expect(body.errors).toContain('participants must contain at least one participant');
  });
});
