'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import Navbar from '@/components/Navbar';
import ProductoModal from '@/components/ProductoModal';
import { Producto, CompraDetalleInput } from '@/types';

const IGV = 0.18;

function calcRow(cantidad: number, precio: number) {
  const sub = cantidad * precio;
  const igv = sub * IGV;
  return { sub: sub.toFixed(2), igv: igv.toFixed(2), total: (sub + igv).toFixed(2) };
}

export default function ComprasPage() {
  const router = useRouter();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [filas, setFilas] = useState<CompraDetalleInput[]>([
    { id_producto: 0, nombre_producto: '', cantidad: 1, precio: 0 },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!localStorage.getItem('access_token')) router.push('/login');
    api.get<Producto[]>('/productos').then((r) => setProductos(r.data));
  }, [router]);

  const agregarFila = () =>
    setFilas([...filas, { id_producto: 0, nombre_producto: '', cantidad: 1, precio: 0 }]);

  const eliminarFila = (i: number) => setFilas(filas.filter((_, idx) => idx !== i));

  const actualizarFila = (i: number, campo: keyof CompraDetalleInput, valor: string | number) => {
    const copia = [...filas];
    if (campo === 'id_producto') {
      const p = productos.find((p) => p.id_producto === Number(valor));
      copia[i] = {
        ...copia[i],
        id_producto: Number(valor),
        nombre_producto: p?.nombre_producto || '',
        precio: p ? Number(p.costo) : copia[i].precio,
      };
    } else {
      (copia[i] as any)[campo] = valor;
    }
    setFilas(copia);
  };

  const totalCab = filas.reduce((acc, f) => {
    const sub = (f.cantidad || 0) * (f.precio || 0);
    return acc + sub * (1 + IGV);
  }, 0);

  const handleGuardar = async () => {
    setError('');
    setMensaje('');
    const invalidas = filas.filter((f) => !f.id_producto || f.cantidad <= 0 || f.precio <= 0);
    if (invalidas.length > 0) {
      setError('Complete todos los campos de cada fila (producto, cantidad y precio > 0).');
      return;
    }
    setLoading(true);
    try {
      await api.post('/compras', {
        detalles: filas.map((f) => ({
          id_producto: f.id_producto,
          cantidad: f.cantidad,
          precio: f.precio,
        })),
      });
      setMensaje('Compra registrada correctamente.');
      setFilas([{ id_producto: 0, nombre_producto: '', cantidad: 1, precio: 0 }]);
      const { data } = await api.get<Producto[]>('/productos');
      setProductos(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar compra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Registrar Compra</h1>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition"
          >
            + Nuevo Producto
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-600">
                  <th className="text-left px-3 py-2">Producto</th>
                  <th className="text-right px-3 py-2 w-28">Cantidad</th>
                  <th className="text-right px-3 py-2 w-28">Precio</th>
                  <th className="text-right px-3 py-2 w-28">Subtotal</th>
                  <th className="text-right px-3 py-2 w-24">IGV</th>
                  <th className="text-right px-3 py-2 w-28">Total</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {filas.map((fila, i) => {
                  const { sub, igv, total } = calcRow(fila.cantidad || 0, fila.precio || 0);
                  return (
                    <tr key={i} className="border-t">
                      <td className="px-3 py-2">
                        <select
                          value={fila.id_producto || ''}
                          onChange={(e) => actualizarFila(i, 'id_producto', e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
                        >
                          <option value="">— Seleccionar —</option>
                          {productos.map((p) => (
                            <option key={p.id_producto} value={p.id_producto}>
                              {p.nombre_producto} (Lote: {p.nro_lote})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={fila.cantidad}
                          onChange={(e) => actualizarFila(i, 'cantidad', parseFloat(e.target.value) || 0)}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-indigo-400"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={fila.precio}
                          onChange={(e) => actualizarFila(i, 'precio', parseFloat(e.target.value) || 0)}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-indigo-400"
                        />
                      </td>
                      <td className="px-3 py-2 text-right">{sub}</td>
                      <td className="px-3 py-2 text-right">{igv}</td>
                      <td className="px-3 py-2 text-right font-medium">{total}</td>
                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={() => eliminarFila(i)}
                          className="text-red-400 hover:text-red-600 text-lg leading-none"
                          disabled={filas.length === 1}
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

          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={agregarFila}
              className="px-4 py-2 border border-dashed border-indigo-400 text-indigo-600 rounded-lg text-sm hover:bg-indigo-50 transition"
            >
              + Agregar fila
            </button>
            <div className="text-right">
              <p className="text-sm text-gray-500">
                Total compra:{' '}
                <span className="text-lg font-bold text-gray-800">
                  S/. {totalCab.toFixed(2)}
                </span>
              </p>
            </div>
          </div>

          {error && <p className="mt-3 text-red-500 text-sm">{error}</p>}
          {mensaje && <p className="mt-3 text-green-600 text-sm font-medium">{mensaje}</p>}

          <div className="mt-5 flex justify-end">
            <button
              onClick={handleGuardar}
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-60 transition"
            >
              {loading ? 'Guardando...' : 'Registrar Compra'}
            </button>
          </div>
        </div>
      </main>

      {showModal && (
        <ProductoModal
          onClose={() => setShowModal(false)}
          onCreated={(p) => {
            setProductos((prev) => [...prev, p]);
            setShowModal(false);
          }}
        />
      )}
    </>
  );
}
