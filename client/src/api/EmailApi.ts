import { IContactFormDTO } from './interfaces/Email';
import { makeRequest } from './reqHelpers';

export class EmailApi {
  private static baseUrl = '/email';

  static async submitContactForm(values: IContactFormDTO) {
    const response = await makeRequest(
      `${this.baseUrl}/submitContactForm`,
      'POST',
      { form: values }
    );
    const success: boolean = response.success;
    return success;
  }
}
