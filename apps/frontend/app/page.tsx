export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-4xl font-bold mb-4">Send parts for repair with confidence</h1>
      <p className="mb-6 max-w-md">Streamline your auto service center’s operations with our reliable parts repair and delivery service.</p>
      <a href="/new-order" className="px-6 py-3 bg-blue-600 text-white rounded-lg">Create Order</a>
    </main>
  );
}
