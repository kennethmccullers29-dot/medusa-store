import LocalizedClientLink from "@modules/common/components/localized-client-link"

const SignInPrompt = () => {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-homestead-border bg-white/50 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div>
        <h2 className="font-heading text-lg text-homestead-ink">Shopping with an account?</h2>
        <p className="mt-1 text-sm text-homestead-muted">Sign in to keep your orders and rewards together.</p>
      </div>
      <LocalizedClientLink href="/account" className="inline-flex min-h-10 w-fit shrink-0 items-center justify-center rounded-md border border-homestead-border px-5 text-sm font-semibold text-homestead-forest hover:border-homestead-olive" data-testid="sign-in-button">
        Sign in
      </LocalizedClientLink>
    </div>
  )
}

export default SignInPrompt
