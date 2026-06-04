'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { KardexItem, MovimientoCab } from '@/types';

interface Props {
  producto: KardexItem;
  onClose: () => void;
}

export default function MovimientosModal({ producto, onClose }: Props) {
  const [movimientos, setMovimientos] = useState<MovimientoCab[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<MovimientoCab[]>(`/movimientos/producto/${producto.id_producto}`)
      .then((r) => setMovimientos(r.data))
      .finally(() => setLoading(false));
  }, [producto.id_producto]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Movimientos — {producto.nombre_producto}
            </h2>
            <p className="text-sm text-gray-500">
              Stock actual:{' '}
              <span className="font-semibold text-indigo-700">
                {producto.stock_actual}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="overflow-auto flex-1">
          {loading ? (
            <p className="text-center text-gray-400 py-8">Cargando...</p>
          ) : movimientos.length === 0 ? (
            <p className="text-center text-gray-400 py-8">
              Sin movimientos registrados
            </p>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left px-3 py-2">ID Mov.</th>
                  <th className="text-left px-3 py-2">Fecha</th>
                  <th className="text-left px-3 py-2">Tipo</th>
                  <th className="text-left px-3 py-2">Doc. Origen</th>
                  <th className="text-right px-3 py-2">Cantidad</th>
                </tr>
              </thead>
              <tbody>
                {movimientos.map((mov) =>
                  mov.detalles.map((det) => (
                    <tr
                      key={det.id_movimiento_det}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="px-3 py-2 text-gray-500">
                        {mov.id_movimiento_cab}
                      </td>
                      <td className="px-3 py-2">
                        {new Date(mov.fec_registro).toLocaleDateString('es-PE')}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            mov.id_tipo_movimiento === 1
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {mov.tipo_nombre}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-gray-500">
                        #{mov.id_documento_origen}
                      </td>
                      <td className="px-3 py-2 text-right font-medium">
                        {mov.id_tipo_movimiento === 1 ? '+' : '-'}
                        {Number(det.cantidad).toFixed(2)}
                      </td>
                    </tr>
                  )),
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
