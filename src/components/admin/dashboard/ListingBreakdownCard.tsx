"use client";

interface ListingBreakdownCardProps {
    totalProperties: number;
    published: number;
    underOffer: number;
    draft: number;
    sold: number;
    acceptedOffersCount: number;
    totalOffersCount: number;
}

export function ListingBreakdownCard({
    totalProperties,
    published,
    underOffer,
    draft,
    sold,
    acceptedOffersCount,
    totalOffersCount,
}: ListingBreakdownCardProps) {
    const chartTotal = (published + underOffer + draft + sold) || 1;
    const pPublished = (published / chartTotal) * 100;
    const pUnderOffer = (underOffer / chartTotal) * 100;
    const pDraft = (draft / chartTotal) * 100;
    const pSold = (sold / chartTotal) * 100;

    const offsetUnderOffer = 100 - pPublished;
    const offsetDraft = offsetUnderOffer - pUnderOffer;
    const offsetSold = offsetDraft - pDraft;

    return (
        <article className="breakdown-card">
            <div>
                <h2 className="dashboard-heading">Listing Breakdown</h2>
                <p className="dashboard-subtext mt-1">Status distribution across database</p>

                {/* SVG Donut Chart Container */}
                <div className="chart-container">
                    <svg className="chart-svg" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.915" className="chart-bg" />

                        {/* Published Segment - Emerald */}
                        <circle
                            cx="18"
                            cy="18"
                            r="15.915"
                            className="chart-segment chart-published"
                            strokeDasharray={`${pPublished} ${100 - pPublished}`}
                            strokeDashoffset="0"
                        />
                        {/* Under Offer Segment - Violet */}
                        <circle
                            cx="18"
                            cy="18"
                            r="15.915"
                            className="chart-segment chart-under-offer"
                            strokeDasharray={`${pUnderOffer} ${100 - pUnderOffer}`}
                            strokeDashoffset={offsetUnderOffer}
                        />
                        {/* Draft Segment - Amber */}
                        <circle
                            cx="18"
                            cy="18"
                            r="15.915"
                            className="chart-segment chart-draft"
                            strokeDasharray={`${pDraft} ${100 - pDraft}`}
                            strokeDashoffset={offsetDraft}
                        />
                        {/* Sold Segment - Indigo */}
                        <circle
                            cx="18"
                            cy="18"
                            r="15.915"
                            className="chart-segment chart-sold"
                            strokeDasharray={`${pSold} ${100 - pSold}`}
                            strokeDashoffset={offsetSold}
                        />
                    </svg>

                    <div className="chart-center-label">
                        <span className="chart-total-val">{totalProperties}</span>
                        <span className="chart-total-lbl">Listings</span>
                    </div>
                </div>

                {/* Status Legend Grid */}
                <div className="legend-grid">
                    <div className="legend-item legend-published">
                        <span className="legend-label legend-label-published">
                            <span className="legend-dot dot-published" />
                            Live Listings
                        </span>
                        <span className="legend-value legend-val-published">{published}</span>
                    </div>

                    <div className="legend-item legend-under-offer">
                        <span className="legend-label legend-label-under-offer">
                            <span className="legend-dot dot-under-offer" />
                            Under Offer
                        </span>
                        <span className="legend-value legend-val-under-offer">{underOffer}</span>
                    </div>

                    <div className="legend-item legend-draft">
                        <span className="legend-label legend-label-draft">
                            <span className="legend-dot dot-draft" />
                            In Draft
                        </span>
                        <span className="legend-value legend-val-draft">{draft}</span>
                    </div>

                    <div className="legend-item legend-sold">
                        <span className="legend-label legend-label-sold">
                            <span className="legend-dot dot-sold" />
                            Closed / Sold
                        </span>
                        <span className="legend-value legend-val-sold">{sold}</span>
                    </div>
                </div>
            </div>

            {/* Card Footer Metric */}
            <div className="breakdown-footer">
                <span className="breakdown-footer-lbl">Accepted Offers Conversion</span>
                <span className="breakdown-footer-val">{acceptedOffersCount} of {totalOffersCount}</span>
            </div>
        </article>
    );
}
