import { render } from '@vue-email/render';
import mailTemplate from '~/emails/reset-pw.vue';

export default defineEventHandler(async (event: any) => {
  const body = await readBody(event);
  const { emails } = useResend();
  const config = useRuntimeConfig();

  const html = await render(mailTemplate, {
    username: body.username,
    token: body.token,
    datetime: new Date().toString(),
    siteUrl: config.public.siteUrl,
  });

  const response = await emails.send({
    from: 'ArisCorp Management System <ams@ariscorp.de>',
    to: body.to,
    subject: 'Passwort zurücksetzen',
    html: html,
  });

  return response;
});
