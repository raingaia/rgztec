import { Injectable } from '@nestjs/common';

type Job = { id: string; status: 'queued'|'building'|'done'|'failed'; artifactUrl?: string; error?: string };

@Injectable()
export class PackagerService {
  private jobs = new Map<string, Job>();

  startBuild(productId: string, licenseKey: string, source: string): Job {
    const id = Math.random().toString(36).slice(2, 10);
    const job: Job = { id, status: 'queued' };
    this.jobs.set(id, job);

    // Simulate async build
    setTimeout(() => {
      const j = this.jobs.get(id);
      if (!j) return;
      j.status = 'building';
      setTimeout(() => {
        j.status = 'done';
        j.artifactUrl = `https://cdn.rgztec.example/artifacts/${productId}/${id}.zip`;
      }, 1500);
    }, 500);

    return job;
  }

  getStatus(id: string) {
    return this.jobs.get(id) || null;
  }
}

