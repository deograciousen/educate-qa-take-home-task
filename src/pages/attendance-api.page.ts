import { APIRequestContext, APIResponse, expect } from '@playwright/test';
import { AttendancePayload, AttendanceResponse } from '../models/attendance';

/** API client/Page Object: keeps endpoint details and request mechanics out of specs. */
export class AttendanceApiPage {
  private readonly endpoint = '/api/v1/attendance';

  public constructor(
    private readonly request: APIRequestContext,
    private readonly baseURL: string,
  ) {}

  public async submitAttendance(payload: AttendancePayload): Promise<APIResponse> {
    return this.request.post(`${this.baseURL}${this.endpoint}`, { data: payload });
  }

  public async submitAndRead(payload: AttendancePayload): Promise<{ response: APIResponse; body: AttendanceResponse }> {
    const response = await this.submitAttendance(payload);
    return { response, body: (await response.json()) as AttendanceResponse };
  }

  public async expectSuccess(payload: AttendancePayload): Promise<AttendanceResponse> {
    const { response, body } = await this.submitAndRead(payload);
    expect(response.status()).toBe(201);
    expect(body.message).toBe('Attendance recorded successfully');
    expect(body.attendance_id).toMatch(/^ATT-/);
    return body;
  }

  public async expectBadRequest(payload: AttendancePayload): Promise<AttendanceResponse> {
    const { response, body } = await this.submitAndRead(payload);
    expect(response.status()).toBe(400);
    expect(body.message).toBe('Validation failed');
    expect(body.errors).toBeDefined();
    return body;
  }
}
