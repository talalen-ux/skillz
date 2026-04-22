import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { SkillPermissions } from './permissions';

export interface SandboxRunRequest {
  executionId: string;
  code: string;
  manifest: Record<string, unknown>;
  inputs: Record<string, unknown>;
  permissions: SkillPermissions;
  mode?: 'live' | 'mock';
}

export interface SandboxRunResult {
  status: 'SUCCEEDED' | 'FAILED' | 'KILLED' | 'BLOCKED';
  output?: unknown;
  error?: string;
  durationMs: number;
  apiCalls: { domain: string; ok: boolean; ts: number }[];
  logs: { level: string; message: string; metadata?: Record<string, unknown> }[];
  blocked?: { reason: string }[];
}

export interface SandboxAnalyzeResult {
  riskScore: number;
  findings: { severity: 'low' | 'med' | 'high'; rule: string; message: string }[];
}

@Injectable()
export class SandboxClient {
  private readonly logger = new Logger(SandboxClient.name);
  private readonly http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      baseURL: process.env.SANDBOX_URL ?? 'http://localhost:8000',
      timeout: 90_000,
    });
  }

  async run(req: SandboxRunRequest): Promise<SandboxRunResult> {
    const { data } = await this.http.post<SandboxRunResult>('/run', req);
    return data;
  }

  async analyze(code: string, manifest: Record<string, unknown>): Promise<SandboxAnalyzeResult> {
    const { data } = await this.http.post<SandboxAnalyzeResult>('/analyze', { code, manifest });
    return data;
  }

  async runScenarios(req: {
    code: string;
    manifest: Record<string, unknown>;
    permissions: SkillPermissions;
    category: string;
  }): Promise<{
    passed: number;
    total: number;
    cases: { name: string; passed: boolean; durationMs: number; notes?: string }[];
  }> {
    const { data } = await this.http.post('/scenarios', req);
    return data;
  }

  async runAdversarial(req: {
    code: string;
    manifest: Record<string, unknown>;
    permissions: SkillPermissions;
  }): Promise<{
    safe: boolean;
    findings: { vector: string; passed: boolean; details?: string }[];
  }> {
    const { data } = await this.http.post('/adversarial', req);
    return data;
  }
}
