import Link from "next/link";

export default function NotFound() {
  return (
    <main className="nf">
      <h1>404</h1>
      <p>No encontramos esta página. Puede que el enlace esté mal escrito o que ya no exista.</p>
      <Link className="btn" href="/">Back to home</Link>
    </main>
  );
}
