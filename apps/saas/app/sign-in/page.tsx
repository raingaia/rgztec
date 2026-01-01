export default function SignIn() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border p-6">
        <h1 className="text-2xl font-bold">Sign in</h1>
        <p className="mt-2 text-sm opacity-80">RGZTEC App access</p>

        <div className="mt-6 grid gap-3">
          <input className="rounded-xl border p-3" placeholder="Email" />
          <input className="rounded-xl border p-3" placeholder="Password" type="password" />
          <button className="rounded-xl border p-3 font-semibold">Continue</button>
        </div>
      </div>
    </main>
  );
}
