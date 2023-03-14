import { Name } from 'types';

export interface IContactFormDTO {
  name: Name;
  email: string;
  subject: string;
  message: string;
}
