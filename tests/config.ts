import { AttendancePayload, AttendanceStatus, ParticipantAttendance } from '../src/models/attendance';

export const validAttendancePayload = (): AttendancePayload => ({
  mentor_id: mentorId,
  bootcamp_id: bootcampId,
  session_date: '2026-09-11',
  participants: [
    { participant_id: participantId, status: AttendanceStatus.Present },
    { participant_id: secondParticipantId, status: AttendanceStatus.Absent },
  ],
});

const mentorId = 'MNT-1042';
const bootcampId = 'KMP-2026-09';
const participantId = 'YTH-8821';
const secondParticipantId = 'YTH-8822';

export const attendanceWithParticipants = (
  participants: ParticipantAttendance[],
): AttendancePayload => ({
  ...validAttendancePayload(),
  participants,
});
