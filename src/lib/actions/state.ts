/** Shared shape returned by form Server Actions (used with useActionState). */
export type ActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string>;
  /** Signup OTP flow: true once a verification code has been emailed. */
  otpSent?: boolean;
  /** Dev-only fallback: the OTP code, surfaced when no email provider is set. */
  devCode?: string;
  /** Add-staff flow: the credentials to hand to a newly created staff member. */
  createdEmail?: string;
  tempPassword?: string;
};

export const initialActionState: ActionState = {};
