'use client';
import { useState } from 'react';

export default function NewOrder() {
  const [description, setDescription] = useState('');
  const [partType, setPartType] = useState('Generator');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description, partType }),
    });
    if (res.ok) {
      window.location.href = '/orders';
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">New Order</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          Part Type
          <select value={partType} onChange={(e) => setPartType(e.target.value)} className="border p-2 rounded">
            <option>Generator</option>
            <option>Starter</option>
            <option>Hydraulic Pump</option>
          </select>
        </label>
        <label className="flex flex-col gap-2">
          Description
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="border p-2 rounded" />
        </label>
        <button type="submit" className="bg-green-600 text-white py-2 rounded">Submit</button>
      </form>
    </div>
  );
}
