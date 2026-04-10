import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
        <p className="text-xl mt-4 mb-8">Page not found</p>
        <Link href="/" className="text-primary underline underline-offset-4">
          Go home
        </Link>
      </div>
    </div>
  );
}
