import styles from "./login.module.css";

export default function LoginPage() {
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Login</h1>

      <form action="/api/auth/login" method="post">
        <input name="email" placeholder="email" />
        <input name="password" type="password" />
        <button type="submit">Sign in</button>
      </form>
    </main>
  );
}

