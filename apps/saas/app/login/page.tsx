import styles from "./login.module.css";

export default function LoginPage() {
  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.brand}>RGZTEC</div>
        <div className={styles.sub}>
          Seller & Partner Access
        </div>

        <form action="/api/auth/login" method="post">
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              name="email"
              type="email"
              className={styles.input}
              placeholder="seller@rgztec.com"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input
              name="password"
              type="password"
              className={styles.input}
              placeholder="••••••••"
            />
          </div>

          <button className={styles.button} type="submit">
            Sign in
          </button>
        </form>

        <div className={styles.footer}>
          <a className={styles.link} href="/seller/dashboard">
            Go to Seller Dashboard →
          </a>
        </div>
      </section>
    </main>
  );
}

