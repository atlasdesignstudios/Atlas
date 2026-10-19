"use client";

import { useRef, useState } from "react";

const EMAIL = "atlasdesigntudios@gmail.com";
const MAX = 800;

const TOPICS = ["Pedido o envío", "Devolución o desistimiento", "Tallas y producto", "Colaboraciones", "Otro"];

/* Formulario de contacto: no envía nada a un servidor; abre el programa
   de correo del visitante con el mensaje ya redactado (como js/contact.js). */
export default function ContactForm() {
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{ name?: string; topic?: string; message?: string }>({});
  const [status, setStatus] = useState("");
  const start = useRef(Date.now());
  const honeypot = useRef<HTMLInputElement>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (name.trim().length < 2) next.name = "Escribe tu nombre.";
    if (!topic) next.topic = "Elige un motivo.";
    if (message.trim().length < 10) next.message = "Cuéntanos algo más (mínimo 10 caracteres).";
    setErrors(next);
    if (Object.keys(next).length) return;

    // Antispam: honeypot + tiempo mínimo de relleno
    if (honeypot.current?.value || Date.now() - start.current < 3000) {
      setStatus("Gracias. Tu mensaje está en camino.");
      return;
    }

    const subject = `[Atlas web] ${topic}`;
    const body = `Hola, soy ${name.trim()}.\n\n${message.slice(0, MAX)}`;
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setStatus(
      `Se está abriendo tu programa de correo. Si no ocurre nada, escríbenos directamente a ${EMAIL}.`,
    );
  }

  return (
    <form className="form" id="contact-form" onSubmit={onSubmit} noValidate>
      {/* Antispam: campo trampa oculto */}
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
        <label htmlFor="c-name">Nombre</label>
        <input
          type="text"
          id="c-name"
          name="nombre"
          autoComplete="name"
          required
          aria-required="true"
          aria-invalid={errors.name ? "true" : undefined}
          aria-describedby={errors.name ? "c-name-err" : undefined}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors({ ...errors, name: undefined });
          }}
        />
        <p className="field__error" id="c-name-err" hidden={!errors.name}>{errors.name}</p>
      </div>

      <div className="field">
        <label htmlFor="c-topic">Motivo</label>
        <select
          id="c-topic"
          name="motivo"
          required
          aria-required="true"
          aria-invalid={errors.topic ? "true" : undefined}
          aria-describedby={errors.topic ? "c-topic-err" : undefined}
          value={topic}
          onChange={(e) => {
            setTopic(e.target.value);
            if (errors.topic) setErrors({ ...errors, topic: undefined });
          }}
        >
          <option value="" disabled>Elige un motivo</option>
          {TOPICS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <p className="field__error" id="c-topic-err" hidden={!errors.topic}>{errors.topic}</p>
      </div>

      <div className="field">
        <label htmlFor="c-message">Mensaje</label>
        <textarea
          id="c-message"
          name="mensaje"
          maxLength={MAX}
          required
          aria-required="true"
          aria-invalid={errors.message ? "true" : undefined}
          aria-describedby={errors.message ? "c-message-err c-count" : "c-count"}
          placeholder="Cuéntanos en qué podemos ayudarte. Si es sobre un pedido, incluye el número."
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            if (errors.message) setErrors({ ...errors, message: undefined });
          }}
        />
        <p className="field__error" id="c-message-err" hidden={!errors.message}>{errors.message}</p>
        <p className="field__hint" id="c-count" aria-hidden="true">{message.length} / {MAX}</p>
      </div>

      <button type="submit" className="btn btn--block">Open in my email app</button>

      <p className="form__status" role="status">{status}</p>

      <p className="form__note">
        Este formulario no envía nada por sí mismo: al pulsar el botón se abre tu programa de correo
        con el mensaje ya redactado, y lo envías tú. Usaremos tus datos solo para responderte; más
        información en la <a href="/legal/privacidad.html">Política de privacidad</a>.
      </p>
    </form>
  );
}
