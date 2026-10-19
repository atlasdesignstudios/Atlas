"use client";

import { useRef, useState } from "react";

const EMAIL = "atlasdesigntudios@gmail.com";

/* Formulario que NO envía nada a un servidor: abre el programa de correo
   del visitante con el mensaje ya redactado (mismo comportamiento que
   js/vip.js y js/contact.js de la web anterior).
   Para conectar un proveedor de formularios (Buttondown, Mailchimp…),
   sustituye el mailto por un fetch(ENDPOINT, …) y amplía la CSP. */
export default function MailForm({
  variant,
  subject,
  bodyIntro,
  consentLabel,
  submitLabel,
  className,
  idPrefix,
}: {
  variant: "vip" | "favs";
  subject: string;
  bodyIntro: string;
  consentLabel: React.ReactNode;
  submitLabel: string;
  className: string;
  idPrefix: string;
}) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; consent?: string }>({});
  const [status, setStatus] = useState("");
  const start = useRef(Date.now());
  const honeypot = useRef<HTMLInputElement>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) next.email = "Escribe un correo válido.";
    if (!consent) next.consent = "Necesitamos tu consentimiento para escribirte.";
    setErrors(next);
    if (Object.keys(next).length) return;

    // Antispam: honeypot + tiempo mínimo de relleno
    if (honeypot.current?.value || Date.now() - start.current < 3000) {
      setStatus("Gracias. Todo listo.");
      return;
    }

    const href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`${bodyIntro}\n\nCorreo del visitante: ${email.trim()}`)}`;
    window.location.href = href;
    setStatus(
      "Se está abriendo tu programa de correo. Si no ocurre nada, escríbenos directamente a " +
        EMAIL +
        ".",
    );
  }

  return (
    <form className={className} id={`${idPrefix}-form`} onSubmit={onSubmit} noValidate>
      {/* Antispam: campo trampa oculto, los humanos no lo ven ni lo rellenan */}
      <input
        ref={honeypot}
        type="text"
        name="web"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px" }}
      />

      <div className="field">
        <label htmlFor={`${idPrefix}-email`}>Correo electrónico</label>
        <input
          type="email"
          id={`${idPrefix}-email`}
          name="email"
          autoComplete="email"
          inputMode="email"
          required
          aria-required="true"
          placeholder="tu@correo.com"
          aria-invalid={errors.email ? "true" : undefined}
          aria-describedby={errors.email ? `${idPrefix}-email-err` : undefined}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors({ ...errors, email: undefined });
          }}
        />
        <p className="field__error" id={`${idPrefix}-email-err`} hidden={!errors.email}>
          {errors.email}
        </p>
      </div>

      <div className={variant === "vip" ? "vip__consent" : "favs-mail__consent"}>
        <input
          type="checkbox"
          id={`${idPrefix}-consent`}
          name="consentimiento"
          value="si"
          required
          aria-required="true"
          aria-invalid={errors.consent ? "true" : undefined}
          aria-describedby={errors.consent ? `${idPrefix}-consent-err` : undefined}
          checked={consent}
          onChange={(e) => {
            setConsent(e.target.checked);
            if (errors.consent) setErrors({ ...errors, consent: undefined });
          }}
        />
        <label htmlFor={`${idPrefix}-consent`}>{consentLabel}</label>
      </div>
      <p className="field__error" id={`${idPrefix}-consent-err`} hidden={!errors.consent}>
        {errors.consent}
      </p>

      <button type="submit" className="btn btn--block">
        {submitLabel}
      </button>
      <p className="form__status" role="status">
        {status}
      </p>
    </form>
  );
}
