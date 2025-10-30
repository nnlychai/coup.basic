// 'use server';

// import { z } from 'zod';

// const SendInput = z.object({
//   message: z.string().min(1, 'Message cannot be empty'),
// });

// type SuccessResponse = {
//   error: false;
//   message: { text: string };
// };

// type ErrorResponse = {
//   error: true;
//   message: string;
// };

// export async function send(
//   _prevState: unknown,
//   formData: FormData
// ): Promise<SuccessResponse | ErrorResponse> {
//   const data = Object.fromEntries(formData.entries());
//   const parsed = SendInput.safeParse(data);

//   if (!parsed.success) {
//     const issue = parsed.error.issues?.[0];
//     return {
//       error: true,
//       message: issue?.message ?? 'Invalid input',
//     };
//   }

//   try {
//     console.log('Sending message:', parsed.data.message);

//     return {
//       error: false,
//       message: { text: parsed.data.message },
//     };
//   } catch (err) {
//     return {
//       error: true,
//       message: err instanceof Error ? err.message : 'Unknown error',
//     };
//   }
// }
