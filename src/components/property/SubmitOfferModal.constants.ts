import { FormData } from "./SubmitOfferModal.types";

export const PURCHASE_METHODS = [
    { value: "", labelKey: "fields.purchaseMethod.options.default" },
    { value: "cash", labelKey: "fields.purchaseMethod.options.cash" },
    { value: "bank-financing", labelKey: "fields.purchaseMethod.options.bankFinancing" },
    { value: "other", labelKey: "fields.purchaseMethod.options.other" },
];

export const initialForm: FormData = {
    fullName: "",
    phone: "",
    email: "",
    offerAmount: "",
    purchaseMethod: "",
    message: "",
    confirmed: false,
};