'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import Navbar from '@/components/Navbar';
import MovimientosModal from '@/components/MovimientosModal';
import { KardexItem } from '@/types';

export default function KardexPage() {
  const router = useRouter();
  const [kardex, setKardex] = useState<KardexItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<KardexItem | null>(null);

  useEffect(() => {
    if (!localStorage.getItem('access_token')) router.push('/login');
    api
      .get<KardexItem[]>('/movimientos/kardex')
      .then((r) => setKardex(r.data))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Kardex de Inventario</h1>

        <div className="bg-white rounded-2xl shadow overflow-hidden">
          {loading ? (
            <p className="p-8 text-center text-gray-400">Cargando kardex...</p>
          ) : kardex.length === 0 ? (
            <p className="p-8 text-center text-gray-400">
              No hay productos registrados.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-600 border-b">
                  <th className="text-left px-4 py-3">ID</th>
                  <th className="text-left px-4 py-3">Producto</th>
                  <th className="text-right px-4 py-3">Stock Actual</th>
                  <th className="text-right px-4 py-3">Costo (S/.)</th>
                  <th className="text-right px-4 py-3">P. Venta (S/.)</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {kardex.map((item) => (
                  <tr key={item.id_producto} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400">{item.id_producto}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {item.nombre_producto}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          item.stock_actual <= 0
                            ? 'bg-red-100 text-red-700'
                            : item.stock_actual < 10
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {item.stock_actual}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {Number(item.costo).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-indigo-700">
                      {Number(item.precio_venta).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setSelected(item)}
                        className="px-3 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-full hover:bg-indigo-200 transition"
                      >
                        Ver movimientos
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {selected && (
        <MovimientosModal
          producto={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
