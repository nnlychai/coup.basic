// export default function SendForm() {
//   // `useActionState` returns [state, action, isPending]
//   const [state, formAction, isPending] = useActionState(sendAction, {
//     error: false,
//     message: { text: '' },
//   });

//   // `useActionStatus` gives more granular control if needed
//   const { pending } = useActionStatus(formAction);

//   return (
//     <form action={formAction} className="space-y-4">
//       <input
//         name="message"
//         placeholder="Type a message"
//         className="w-full rounded border p-2"
//         disabled={pending}
//       />
//       <button
//         type="submit"
//         disabled={pending}
//         className="rounded bg-blue-600 px-4 py-2 text-white"
//       >
//         {pending ? 'Sending…' : 'Send'}
//       </button>

//       {state.error ? (
//         <p className="text-red-600">{state.message}</p>
//       ) : (
//         state.message.text && (
//           <p className="text-green-600">Sent: {state.message.text}</p>
//         )
//       )}
//     </form>
//   );
// }
