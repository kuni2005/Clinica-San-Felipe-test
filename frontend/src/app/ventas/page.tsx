'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import Navbar from '@/components/Navbar';
import { KardexItem } from '@/types';

const IGV = 0.18;

interface FilaVenta {
  id_producto: number;
  nombre_producto: string;
  stock_disponible: number;
  precio_venta: number;
  cantidad: number;
}

export default function VentasPage() {
  const router = useRouter();
  const [kardex, setKardex] = useState<KardexItem[]>([]);
  const [filas, setFilas] = useState<FilaVenta[]>([
    { id_producto: 0, nombre_producto: '', stock_disponible: 0, precio_venta: 0, cantidad: 1 },
  ]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('access_token')) router.push('/login');
    api.get<KardexItem[]>('/movimientos/kardex').then((r) => setKardex(r.data));
  }, [router]);

  const agregarFila = () =>
    setFilas([
      ...filas,
      { id_producto: 0, nombre_producto: '', stock_disponible: 0, precio_venta: 0, cantidad: 1 },
    ]);

  const eliminarFila = (i: number) => setFilas(filas.filter((_, idx) => idx !== i));

  const seleccionarProducto = (i: number, idProducto: number) => {
    const item = kardex.find((k) => k.id_producto === idProducto);
    const copia = [...filas];
    copia[i] = {
      ...copia[i],
      id_producto: idProducto,
      nombre_producto: item?.nombre_producto || '',
      stock_disponible: item?.stock_actual || 0,
      precio_venta: item?.precio_venta || 0,
      cantidad: 1,
    };
    setFilas(copia);
  };

  const setCantidad = (i: number, val: number) => {
    const copia = [...filas];
    copia[i].cantidad = val;
    setFilas(copia);
  };

  const headerSubTotal = filas.reduce(
    (acc, f) => acc + (f.cantidad || 0) * f.precio_venta,
    0,
  );
  const headerIgv = headerSubTotal * IGV;
  const headerTotal = headerSubTotal + headerIgv;

  const handleGuardar = async () => {
    setError('');
    setMensaje('');

    const invalidas = filas.filter((f) => !f.id_producto || f.cantidad <= 0);
    if (invalidas.length) {
      setError('Seleccione producto y cantidad válida en cada fila.');
      return;
    }

    const sinStock = filas.find((f) => f.cantidad > f.stock_disponible);
    if (sinStock) {
      setError(
        `Stock insuficiente para "${sinStock.nombre_producto}". Disponible: ${sinStock.stock_disponible}`,
      );
      return;
    }

    setLoading(true);
    try {
      await api.post('/ventas', {
        detalles: filas.map((f) => ({
          id_producto: f.id_producto,
          cantidad: f.cantidad,
        })),
      });
      setMensaje('Venta registrada correctamente.');
      setFilas([
        { id_producto: 0, nombre_producto: '', stock_disponible: 0, precio_venta: 0, cantidad: 1 },
      ]);
      const { data } = await api.get<KardexItem[]>('/movimientos/kardex');
      setKardex(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar venta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Registrar Venta</h1>

        <div className="bg-white rounded-2xl shadow p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-600">
                  <th className="text-left px-3 py-2">Producto</th>
                  <th className="text-right px-3 py-2 w-28">Stock</th>
                  <th className="text-right px-3 py-2 w-28">P. Venta</th>
                  <th className="text-right px-3 py-2 w-28">Cantidad</th>
                  <th className="text-right px-3 py-2 w-28">Subtotal</th>
                  <th className="text-right px-3 py-2 w-24">IGV</th>
                  <th className="text-right px-3 py-2 w-28">Total</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {filas.map((fila, i) => {
                  const sub = (fila.cantidad || 0) * fila.precio_venta;
                  const igv = sub * IGV;
                  const total = sub + igv;
                  const excede = fila.id_producto > 0 && fila.cantidad > fila.stock_disponible;

                  return (
                    <tr key={i} className="border-t">
                      <td className="px-3 py-2">
                        <select
                          value={fila.id_producto || ''}
                          onChange={(e) => seleccionarProducto(i, Number(e.target.value))}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
                        >
                          <option value="">— Seleccionar —</option>
                          {kardex.map((k) => (
                            <option key={k.id_producto} value={k.id_producto}>
                              {k.nombre_producto}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2 text-right">
                        {fila.id_producto > 0 ? (
                          <span
                            className={`font-medium ${
                              fila.stock_disponible <= 0
                                ? 'text-red-500'
                                : 'text-green-600'
                            }`}
                          >
                            {fila.stock_disponible}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {fila.precio_venta > 0
                          ? `S/. ${fila.precio_venta.toFixed(2)}`
                          : '—'}
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={fila.cantidad}
                          onChange={(e) => setCantidad(i, parseFloat(e.target.value) || 0)}
                          className={`w-full border rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-indigo-400 ${
                            excede ? 'border-red-400 bg-red-50' : 'border-gray-300'
                          }`}
                        />
                        {excede && (
                          <p className="text-xs text-red-500 mt-0.5">
                            Máx: {fila.stock_disponible}
                          </p>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right">{sub.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right">{igv.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right font-medium">{total.toFixed(2)}</td>
                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={() => eliminarFila(i)}
                          disabled={filas.length === 1}
                          className="text-red-400 hover:text-red-600 text-lg leading-none"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-end justify-between">
            <button
              onClick={agregarFila}
              className="px-4 py-2 border border-dashed border-indigo-400 text-indigo-600 rounded-lg text-sm hover:bg-indigo-50 transition"
            >
              + Agregar fila
            </button>
            <div className="text-right space-y-0.5 text-sm">
              <p className="text-gray-500">
                Subtotal:{' '}
                <span className="font-medium text-gray-700">
                  S/. {headerSubTotal.toFixed(2)}
                </span>
              </p>
              <p className="text-gray-500">
                IGV (18%):{' '}
                <span className="font-medium text-gray-700">
                  S/. {headerIgv.toFixed(2)}
                </span>
              </p>
              <p className="text-gray-700 font-semibold text-base">
                Total:{' '}
                <span className="text-indigo-700">
                  S/. {headerTotal.toFixed(2)}
                </span>
              </p>
            </div>
          </div>

          {error && <p className="mt-3 text-red-500 text-sm">{error}</p>}
          {mensaje && (
            <p className="mt-3 text-green-600 text-sm font-medium">{mensaje}</p>
          )}

          <div className="mt-5 flex justify-end">
            <button
              onClick={handleGuardar}
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-60 transition"
            >
              {loading ? 'Guardando...' : 'Registrar Venta'}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
