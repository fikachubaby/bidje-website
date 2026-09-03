import { useState, useEffect } from "react";
import {
    fetchOfferPartnerOptions,
    type PartnerOption,
} from "@/lib/offers/getPartnerOptions";

export function useOfferPartners(enabled: boolean) {
    const [legalFirms, setLegalFirms] = useState<PartnerOption[]>([]);
    const [financingConsultants, setFinancingConsultants] = useState<PartnerOption[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!enabled) return;

        let isMounted = true;
        setLoading(true);

        fetchOfferPartnerOptions().then(({ legalFirms, financingConsultants }) => {
            if (isMounted) {
                setLegalFirms(legalFirms);
                setFinancingConsultants(financingConsultants);
                setLoading(false);
            }
        });

        return () => {
            isMounted = false;
        };
    }, [enabled]);

    return { legalFirms, financingConsultants, loading };
}