import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'noteAppStorage',
  access: (allow) => ({
    'attachments/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write', 'delete']),
    ],
  }),
});