/** Shared shape returned by form Server Actions (used with useActionState). */
export type ActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string>;
};

export const initialActionState: ActionState = {};
