"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./login.module.css";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [btnText, setBtnText] = useState<"Sign In" | "Verifying..." | "Redirecting...">("Sign In");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setBtnText("Verifying...");

    // Demo flow (sen sonra auth/redirect bağlarsın)
    window.setTimeout(() => {
      // console.log("Access granted for RGZTEC Global");
      setBtnText("Redirecting...");

      // ✅ burayı kendi rotana göre değiştir:
      // window.location.href = "/seller/dashboard";
      // veya Next router ile:
      // router.push("/seller/dashboard");

      window.setTimeout(() => {
        setLoading(false);
        setBtnText("Sign In");
      }, 800);
    }, 900);
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Top bar */}
        <div className={styles.top}>
          <h1 className={styles.brand}>RGZTEC</h1>

          {/* ✅ Register route sende nerede ise onu yaz */}
          <Link href="/seller/register" className={styles.registerBtn}>
            Register
          </Link>
        </div>

        {/* Title */}
        <div className={styles.head}>
          <h2 className={styles.title}>Sign In</h2>
          <p className={styles.subtitle}>Seller &amp; Partner Access</p>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className={styles.form} aria-label="Sign in form">
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="email@rgztec.com"
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className={styles.input}
              placeholder="••••••••••"
            />
          </div>

          <div className={styles.row}>
            <label className={styles.check}>
              <input type="checkbox" className={styles.checkbox} />
              <span className={styles.checkText}>Stay signed in</span>
            </label>

            {/* ✅ Forgot route sende nerede ise onu yaz */}
            <Link href="/forgot-password" className={styles.forgot}>
              Forgot password?
            </Link>
          </div>

          <button type="submit" className={styles.submit} disabled={loading} aria-busy={loading}>
            {btnText}
          </button>
        </form>

        {/* Divider */}
        <div className={styles.divider} role="separator" aria-label="or divider">
          <span>OR</span>
        </div>

        {/* Social */}
        <div className={styles.social}>
          <button type="button" className={styles.socialBtn}>
            <img
              src="https://www.svgrepo.com/show/355037/google.svg"
              alt=""
              className={styles.socialIcon}
              loading="lazy"
            />
            <span>Continue with Google</span>
          </button>

          <button type="button" className={styles.socialBtn}>
            <svg className={styles.fbIcon} viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
              />
            </svg>
            <span>Continue with Facebook</span>
          </button>
        </div>

        {/* Legal */}
        <p className={styles.legal}>
          By signing in, you agree to RGZTEC&apos;s{" "}
          <Link href="/terms" className={styles.legalLink}>
            Terms of Use
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className={styles.legalLink}>
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}


