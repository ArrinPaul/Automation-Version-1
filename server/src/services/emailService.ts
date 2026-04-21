import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendAnnouncementEmail = async (to: string[], subject: string, message: string) => {
  try {
    await resend.emails.send({
      from: 'IEEE Finance Pro <no-reply@ieee-finance.org>',
      to,
      subject,
      text: message,
    });
  } catch (error) {
    console.error('Email dispatch failed', error);
  }
};
