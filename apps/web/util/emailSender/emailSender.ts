export interface EmailSender {
  sendLoginEmail(options: LoginEmailOptions): Promise<void>;
}

export interface LoginEmailOptions {
  email: string;
  url: string;
  token: string;
}
