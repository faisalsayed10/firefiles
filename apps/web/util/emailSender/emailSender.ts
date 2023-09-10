export interface EmailSender {
  sendLoginEmail(options: LoginEmailOptions): Promise<void>;
  sendInvitationEmail(options: InvitationEmailOptions): Promise<void>;
}

export interface LoginEmailOptions {
  email: string;
  url: string;
  token: string;
}

export interface InvitationEmailOptions {
  email: string;
  url: string;
}
