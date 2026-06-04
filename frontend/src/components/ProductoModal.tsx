'use client';
import { useState } from 'react';
import api from '@/lib/axios';
import { Producto } from '@/types';

interface Props {
  onClose: () => void;
  onCreated: (p: Producto) => void;
}

export default function ProductoModal({ onClose, onCreated }: Props) {
  const [form, setForm] = useState({
    nombre_producto: '',
    nro_lote: '',
    costo: '',
    precio_venta: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post<Producto>('/productos', {
        nombre_producto: form.nombre_producto,
        nro_lote: form.nro_lote,
        costo: parseFloat(form.costo),
        precio_venta: parseFloat(form.precio_venta),
      });
      onCreated(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear producto');
    } finally {
      setLoading(false);
    }
  };

  const field = (
    label: string,
    key: keyof typeof form,
    type = 'text',
    placeholder = '',
  ) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        placeholder={placeholder}
        required
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          Registrar nuevo producto
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          {field('Nombre del producto', 'nombre_producto', 'text', 'Ej: Paracetamol 500mg')}
          {field('N° de lote', 'nro_lote', 'text', 'Ej: LOTE-2024-001')}
          {field('Costo (S/.)', 'costo', 'number', '0.00')}
          {field('Precio de venta (S/.)', 'precio_venta', 'number', '0.00')}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
