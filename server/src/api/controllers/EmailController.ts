import express from 'express';
import joi from 'joi';
import { container } from 'tsyringe';
import { EmailService } from 'services';
import { IContactFormDTO } from 'interfaces';
import { Email } from 'types';
import { BadRequestError } from 'api/errors';

export const email = (app: express.Router) => {
  const route = express.Router();
  app.use('/email', route);
  const emailService = container.resolve(EmailService);

  route.post('/submitContactForm', async (req, res, next) => {
    try {
      const form: IContactFormDTO = req.body.form;

      const { error } = joi
        .object({
          name: joi
            .object({
              first: joi.string().required(),
              last: joi.string().required(),
            })
            .required(),
          email: joi.string().required(),
          subject: joi.string().required(),
          message: joi.string().required(),
        })
        .required()
        .validate(form);

      if (error) throw new BadRequestError(error.message);

      const email: Email = {
        from: 'contact@safecycle.xyz',
        replyTo: `"${form.name.first + ' ' + form.name.last}" <${form.email}>`,
        to: ['contact@safecycle.xyz', 'lpalazzi@outlook.com'],
        subject: form.subject,
        message: form.message,
      };

      await emailService.sendEmail(email);

      return res.json({ success: true });
    } catch (err) {
      next(err);
    }
  });
};
