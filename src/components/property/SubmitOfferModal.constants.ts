import { FormData } from "./SubmitOfferModal.types";

export const PURCHASE_METHODS = [
    { value: "", labelKey: "SubmitOfferModal.fields.purchaseMethod.options.default" },
    { value: "Loan", labelKey: "SubmitOfferModal.fields.purchaseMethod.options.loan" },
    { value: "Cash", labelKey: "SubmitOfferModal.fields.purchaseMethod.options.cash" },
    { value: "Joint Venture", labelKey: "SubmitOfferModal.fields.purchaseMethod.options.jointVenture" },
];

export const initialForm: FormData = {
    fullName: "",
    phone: "",
    email: "",
    deposit: "",
    offerAmount: "",
    purchaseMethod: "",
    financingConsultantId: "",
    legalFirmId: "",
    message: "",
    confirmed: false,
};