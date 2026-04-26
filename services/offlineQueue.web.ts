import { confirmPrescription } from '@/services/api';

export type OfflineAction = {
  payload: Record<string, unknown>;
  type: 'CONFIRM_ADMINISTRATION';
};

const memoryQueue: OfflineAction[] = [];

export async function enqueue(action: OfflineAction) {
  memoryQueue.push(action);
}

export async function getQueueLength() {
  return memoryQueue.length;
}

export async function processQueue() {
  const actions = memoryQueue.splice(0, memoryQueue.length);

  for (const action of actions) {
    const payload = action.payload as { administeredAt: string; id: string; notes?: string };

    if (action.type === 'CONFIRM_ADMINISTRATION') {
      await confirmPrescription(payload.id, {
        administeredAt: payload.administeredAt,
        notes: payload.notes,
      });
    }
  }

  return actions.length;
}
