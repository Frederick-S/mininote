import { defineAuth } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  userAttributes: {
    email: {
      required: true,
      mutable: true,
    },
  },
  accountRecovery: 'email',
  verification: {
    email: {
      deliveryMedium: 'email',
      emailSubject: 'Verify your email for Web Note App',
      emailBody: (createCode) =>
        `Please verify your email address by entering this code: ${createCode()}`,
    },
  },
});