export enum AttendanceStatus {
  Present = 'PRESENT',
  Absent = 'ABSENT',
}

export interface ParticipantAttendance {
  participant_id: string;
  status: AttendanceStatus;
}

export interface AttendancePayload {
  mentor_id: string;
  bootcamp_id: string;
  session_date: string;
  participants: ParticipantAttendance[];
}

export interface AttendanceResponse {
  message: string;
  attendance_id?: string;
  errors?: string[];
}
