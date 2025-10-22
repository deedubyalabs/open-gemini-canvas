import { redirect } from 'next/navigation'

export default function Page() {
  // Redirect to the post generator — this effectively removes the stack analyzer UI.
  redirect('/post-generator')
}
