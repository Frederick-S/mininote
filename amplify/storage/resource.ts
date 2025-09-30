import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'noteAppStorage',
  access: (allow) => ({
    // User-specific attachment storage with organized structure
    'attachments/{entity_id}/{pageId}/images/*': [
      allow.entity('identity').to(['read', 'write', 'delete']),
    ],
    'attachments/{entity_id}/{pageId}/documents/*': [
      allow.entity('identity').to(['read', 'write', 'delete']),
    ],
    'attachments/{entity_id}/{pageId}/videos/*': [
      allow.entity('identity').to(['read', 'write', 'delete']),
    ],
    // General attachment path for backward compatibility
    'attachments/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write', 'delete']),
    ],
  }),
});