import { useCompiler } from '#vue-email';

export default defineEventHandler(async (event: any) => {
  const body = await readBody(event);
  const { emails } = useResend();
  const template = await useCompiler('reset-pw.vue', {
    props: {
      username: body.username,
      token: body.token,
      datetime: new Date().toString(),
    },
  });

  const response = await emails.send({
    from: 'ArisCorp Management System <ams@ariscorp.de>',
    to: body.to,
    subject: 'Passwort zurücksetzen',
    html: template.html,
  });

  return response;
});
