"use client";

interface CheckoutButtonProps {
  priceId: string;
  mode: "payment" | "subscription";
  label: string;
  featured?: boolean;
}

export function CheckoutButton({ priceId, mode: _mode, label: _label, featured: _featured }: CheckoutButtonProps) {
  if (!priceId) {
    return (
      <button
        disabled
        className="mt-8 block w-full rounded-lg px-4 py-2.5 text-center text-sm font-medium bg-gray-200 text-gray-500 cursor-not-allowed"
        title="Payments not yet configured"
      >
        Coming soon
      </button>
    );
  }

  return (
    <button
      disabled
      className="mt-8 block w-full rounded-lg bg-gray-200 px-4 py-2.5 text-center text-sm font-medium text-gray-500 cursor-not-allowed"
      title="Payments not yet configured"
    >
      Coming soon
    </button>
  );
}
