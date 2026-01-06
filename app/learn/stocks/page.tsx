
import ExplainButton from "@/components/ExplainButton";
import ChartCard from "@/components/ChartCard";

export default function StocksPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Stocks</h1>
      <p className="text-gray-600 mb-6">
        Stocks represent ownership in a company. Prices fluctuate based on
        performance, news, and market conditions.
      </p>

      <ChartCard />

      <div className="mt-6">
        <ExplainButton />
      </div>
    </div>
  );
}
