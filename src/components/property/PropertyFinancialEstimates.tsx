import { formatPrice } from "@/lib/utils";

interface PropertyFinancialEstimatesProps {
  marketValue?: number;
  maxLoanApplicable?: number;
  currency: string;
  className?: string;
}

export function PropertyFinancialEstimates({
  marketValue,
  maxLoanApplicable,
  currency,
  className,
}: PropertyFinancialEstimatesProps) {
  const showMarketValue =
    marketValue !== undefined && marketValue !== null && marketValue > 0;
  const showMaxLoan =
    maxLoanApplicable !== undefined &&
    maxLoanApplicable !== null &&
    maxLoanApplicable > 0;

  if (!showMarketValue && !showMaxLoan) {
    return null;
  }

  return (
    <div className={className}>
      {showMarketValue && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Estimated Market Value
          </p>
          <p className="mt-0.5 text-lg font-bold text-neutral-800">
            {formatPrice(marketValue, currency)}
          </p>
        </div>
      )}
      {showMaxLoan && (
        <div className={showMarketValue ? "mt-3" : undefined}>
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Estimated Maximum Financing
          </p>
          <p className="mt-0.5 text-lg font-bold text-neutral-800">
            {formatPrice(maxLoanApplicable, currency)}
          </p>
        </div>
      )}
    </div>
  );
}
