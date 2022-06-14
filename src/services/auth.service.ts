import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(private http: HttpService) {}

  async login(username: string, password: string) {
    try {
      const { data } = await firstValueFrom(
        this.http.post(
          process.env.HTTP_OR_CLIENTE,
          new URLSearchParams({
            client_id: process.env.CLIENT_ID_OR,
            client_secret: process.env.CLIENT_SECRETE_OR,
            grant_type: process.env.GRANT_TYPE_OR,
            username,
            password,
          }),
        ),
      );
      return data;
    } catch (error) {
      throw new HttpException(
        'Incorrect password or email',
        error.response.status,
      );
    }
  }

  async register(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    passwordConfirmation: string,
  ) {
    if (password !== passwordConfirmation) {
      throw new HttpException('Different passwords', 400);
    }
    try {
      const { data } = await firstValueFrom(
        this.http.post(
          process.env.HTTP_ADMIN_CLI,
          new URLSearchParams({
            client_id: process.env.CLIENT_ID_ADMIN,
            client_secret: process.env.CLIENT_SECRETE_ADMIN,
            grant_type: process.env.GRANT_TYPE_ADMIN,
          }),
        ),
      );

      await firstValueFrom(
        await this.http.post(
          process.env.HTTP_ADMIN_OR,
          {
            firstName,
            lastName,
            email,
            enabled: 'true',
            username: email,
            credentials: [
              {
                type: 'password',
                value: password,
                temporary: 'false',
              },
            ],
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${data.access_token}`,
            },
          },
        ),
      );

      return {
        usuario: {
          firstName: firstName,
          lastName: lastName,
          email: email,
          username: email,
        },
      };
    } catch (error) {
      throw new HttpException(
        error.response.data.errorMessage,
        error.response.status,
      );
    }
  }

  async changePassword(id: string, password: string) {
    try {
      const { data } = await firstValueFrom(
        this.http.post(
          process.env.HTTP_ADMIN_CLI,
          new URLSearchParams({
            client_id: process.env.CLIENT_ID_ADMIN,
            client_secret: process.env.CLIENT_SECRETE_ADMIN,
            grant_type: process.env.GRANT_TYPE_ADMIN,
          }),
        ),
      );

      await firstValueFrom(
        await this.http.put(
          `${process.env.HTTP_ADMIN_OR}/${id}/reset-password`,
          {
            type: 'password',
            temporary: 'false',
            value: password,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${data.access_token}`,
            },
          },
        ),
      );

      return {
        message: 'Password updated successfully',
      };
    } catch (error) {
      throw new HttpException('Could not update password', 400);
    }
  }

  async getUser(email: string) {
    try {
      const { data } = await firstValueFrom(
        this.http.post(
          process.env.HTTP_ADMIN_CLI,
          new URLSearchParams({
            client_id: process.env.CLIENT_ID_ADMIN,
            client_secret: process.env.CLIENT_SECRETE_ADMIN,
            grant_type: process.env.GRANT_TYPE_ADMIN,
          }),
        ),
      );

      const UserData = await firstValueFrom(
        await this.http.get(`${process.env.HTTP_ADMIN_OR}?username=${email}`, {
          headers: {
            Authorization: `Bearer ${data.access_token}`,
          },
        }),
      );

      if (UserData.data.length === 0) {
        throw new HttpException('Could not find user', 400);
      }

      return {
        user: UserData.data,
      };
    } catch (error) {
      throw new HttpException('Could not find user', 400);
    }
  }

  async forgotPassword(email: string) {
    try {
      const { data } = await firstValueFrom(
        this.http.post(
          process.env.HTTP_ADMIN_CLI,
          new URLSearchParams({
            client_id: process.env.CLIENT_ID_ADMIN,
            client_secret: process.env.CLIENT_SECRETE_ADMIN,
            grant_type: process.env.GRANT_TYPE_ADMIN,
          }),
        ),
      );

      const UserData = await firstValueFrom(
        await this.http.get(`${process.env.HTTP_ADMIN_OR}?username=${email}`, {
          headers: {
            Authorization: `Bearer ${data.access_token}`,
          },
        }),
      );

      await firstValueFrom(
        await this.http.put(
          `${process.env.HTTP_ADMIN_OR}/${UserData.data[0].id}/execute-actions-email`,
          '["UPDATE_PASSWORD"]',
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${data.access_token}`,
            },
          },
        ),
      );

      return {
        messege: 'Email successfully sent',
      };
    } catch (error) {
      throw new HttpException('Invalid email', 400);
    }
  }
}
