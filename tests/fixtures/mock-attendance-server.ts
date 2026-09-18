import { createServer, IncomingMessage, Server, ServerResponse } from 'node:http';
import { AddressInfo } from 'node:net';
import { AttendancePayload, AttendanceStatus } from '../../src/models/attendance';

const readJson = async (request: IncomingMessage): Promise<Partial<AttendancePayload>> => {
  const body = await new Promise<string>((resolve, reject) => {
    let content = '';
    request.setEncoding('utf8');
    request.on('data', (chunk: string) => { content += chunk; });
    request.on('end', () => resolve(content));
    request.on('error', reject);
  });
  try { return JSON.parse(body) as Partial<AttendancePayload>; } catch { return {}; }
};

const validate = (payload: Partial<AttendancePayload>): string[] => {
  const errors: string[] = [];
  if (!payload.mentor_id) errors.push('mentor_id is required');
  if (!payload.bootcamp_id) errors.push('bootcamp_id is required');
  if (!payload.session_date) errors.push('session_date is required');
  if (!Array.isArray(payload.participants) || payload.participants.length === 0) {
    errors.push('participants must contain at least one participant');
  } else {
    const ids = payload.participants.map((participant) => participant.participant_id);
    if (new Set(ids).size !== ids.length) errors.push('participant_ids must be unique');
    payload.participants.forEach((participant, index) => {
      if (!participant.participant_id) errors.push(`participants[${index}].participant_id is required`);
      if (!Object.values(AttendanceStatus).includes(participant.status as AttendanceStatus)) {
        errors.push(`participants[${index}].status must be PRESENT or ABSENT`);
      }
    });
  }
  return errors;
};

export class MockAttendanceServer {
  private server?: Server;
  public baseURL = '';

  public async start(): Promise<void> {
    this.server = createServer(
      async (request: IncomingMessage, response: ServerResponse) => this.handle(request, response),
    );
    await new Promise<void>((resolve) => this.server!.listen(0, '127.0.0.1', resolve));
    const address = this.server.address() as AddressInfo;
    this.baseURL = `http://127.0.0.1:${address.port}`;
  }

  public async stop(): Promise<void> {
    if (!this.server) return;
    await new Promise<void>((resolve, reject) => {
      this.server!.close((error?: Error) => error ? reject(error) : resolve());
    });
  }

  private async handle(request: IncomingMessage, response: ServerResponse): Promise<void> {
    if (request.method !== 'POST' || request.url !== '/api/v1/attendance') {
      response.writeHead(404).end();
      return;
    }
    const payload = await readJson(request);
    const errors = validate(payload);
    const status = errors.length ? 400 : 201;
    const body = errors.length
      ? { message: 'Validation failed', errors }
      : { message: 'Attendance recorded successfully', attendance_id: 'ATT-MOCK-0001' };
    response.writeHead(status, { 'Content-Type': 'application/json' }).end(JSON.stringify(body));
  }
}
