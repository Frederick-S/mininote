import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  User: a
    .model({
      email: a.string().required(),
    })
    .authorization((allow) => [allow.owner()]),

  Notebook: a
    .model({
      title: a.string().required(),
      description: a.string(),
      owner: a.string().required(),
    })
    .authorization((allow) => [allow.owner()]),

  Page: a
    .model({
      title: a.string().required(),
      content: a.string().required(),
      version: a.integer().required().default(1),
      parentPageId: a.id(),
      notebookId: a.id().required(),
      owner: a.string().required(),
    })
    .authorization((allow) => [allow.owner()]),

  PageVersion: a
    .model({
      pageId: a.id().required(),
      title: a.string().required(),
      content: a.string().required(),
      version: a.integer().required(),
      owner: a.string().required(),
    })
    .authorization((allow) => [allow.owner()]),

  Attachment: a
    .model({
      filename: a.string().required(),
      fileType: a.string().required(),
      fileSize: a.integer().required(),
      s3Key: a.string().required(),
      pageId: a.id().required(),
      owner: a.string().required(),
    })
    .authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});