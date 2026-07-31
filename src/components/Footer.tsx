export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-8 dark:border-gray-700 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>&copy; {new Date().getFullYear()} Bhatia Stores. Quality tiles and sanitaryware for every space.</p>
        <div className="mt-2 flex justify-center gap-4">
          <span>Fast Delivery</span>
          <span>&middot;</span>
          <span>Secure Payments</span>
          <span>&middot;</span>
          <a href="https://wa.me/919984979720" className="hover:text-indigo-600">WhatsApp Support</a>
        </div>
      </div>
    </footer>
  );
}
