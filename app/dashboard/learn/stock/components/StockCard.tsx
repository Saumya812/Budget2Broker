import Link from "next/link";

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

interface StockCardProps {
  stock: Stock;
}

export default function StockCard({ stock }: StockCardProps) {
  const isPositive = stock.change >= 0;

  return (
    <Link
      href={`/dashboard/learn/stock/${stock.symbol}`}
      className="block p-4 rounded-lg border bg-white dark:bg-gray-900
                 hover:shadow-md transition"
    >
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">{stock.symbol}</h3>
          <p className="text-sm text-gray-500">{stock.name}</p>
        </div>

        <div className="text-right">
          <p className="text-lg font-medium">${stock.price}</p>
          <p
            className={`text-sm ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {isPositive ? "+" : ""}
            {stock.change} ({stock.changePercent}%)
          </p>
        </div>
      </div>
    </Link>
  );
}
