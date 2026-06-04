'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const links = [
  { href: '/compras', label: 'Compras' },
  { href: '/ventas', label: 'Ventas' },
  { href: '/kardex', label: 'Kardex' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem('access_token');
    router.push('/login');
  };

  return (
    <nav className="bg-indigo-700 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        <span className="font-bold text-lg tracking-wide">ComprasVentas</span>
        <div className="flex items-center gap-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                pathname === l.href
                  ? 'bg-white text-indigo-700'
                  : 'hover:bg-indigo-600'
              }`}
            >
              {l.label}
            </Link>
          ))}
          <button
            onClick={logout}
            className="ml-4 px-3 py-1.5 rounded-md text-sm bg-red-500 hover:bg-red-600 transition"
          >
            Salir
          </button>
        </div>
      </div>
    </nav>
  );
}
