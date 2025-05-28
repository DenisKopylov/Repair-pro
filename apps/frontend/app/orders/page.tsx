async function getOrders() {
  const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/orders', { cache: 'no-store' });
  return res.json();
}

export default async function Orders() {
  const orders = await getOrders();
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Orders</h1>
      <ul className="flex flex-col gap-4">
        {orders.map((o: any) => (
          <li key={o._id} className="border rounded p-4 flex justify-between">
            <div>
              <h3 className="font-semibold">{o.partType}</h3>
              <p className="text-sm text-gray-600">{o.description}</p>
            </div>
            <span className="text-sm">{o.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
