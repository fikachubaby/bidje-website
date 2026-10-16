"use client";

import { useMemo, useState } from "react";
import { Upload } from "lucide-react";
import { Modal } from "@/components/admin/ui/Modal";
import { Button } from "@/components/ui/ButtonProps";
import { formatDate, parseInvestorSheet } from "@/lib/investor";
import type { ImportRow } from "@/lib/investor";

interface ImportPropertiesModalProps {
    open: boolean;
    investorName: string;
    onClose: () => void;
    onImport: (rows: ImportRow[]) => Promise<void>;
}

export function ImportPropertiesModal({ open, investorName, onClose, onImport }: ImportPropertiesModalProps) {
    const [text, setText] = useState("");
    const [importing, setImporting] = useState(false);
    const rows = useMemo(() => parseInvestorSheet(text), [text]);

    const handleFile = async (file: File) => {
        setText(await file.text());
    };

    const handleImport = async () => {
        setImporting(true);
        try {
            await onImport(rows);
            setText("");
            onClose();
        } catch {
            // toast already shown
        } finally {
            setImporting(false);
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            wide
            title={`Import properties for ${investorName}`}
            description="Copy the rows from the investor's Excel sheet (NO. · ADDRESS · DATE SIGNED · PROGRESS) and paste below, or upload a CSV. Header rows are skipped automatically."
        >
            <div className="space-y-4">
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={7}
                    placeholder={"1\tNo.2, Jalan Dahlia 28/2, Taman Dahlia, 81200 Johor Bahru, Johor\t1/9/24\n2\tNo. 78, Jalan Azam 15, Taman Sri Lambak, 86000, Kluang, Johor\t7/12/24"}
                    className="w-full rounded-xl border border-neutral-300 p-3 font-mono text-xs outline-none focus:border-neutral-900"
                />
                <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-neutral-700 hover:text-black">
                    <Upload className="h-4 w-4" />
                    Upload CSV
                    <input
                        type="file"
                        accept=".csv,.tsv,.txt"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                    />
                </label>

                {rows.length > 0 && (
                    <div className="max-h-80 overflow-auto rounded-xl border border-neutral-200">
                        <table className="w-full text-left text-xs">
                            <thead className="sticky top-0 bg-neutral-50 text-neutral-500">
                                <tr>
                                    <th className="px-3 py-2">No.</th>
                                    <th className="px-3 py-2">Address</th>
                                    <th className="px-3 py-2">State</th>
                                    <th className="px-3 py-2">Date signed</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((r, i) => (
                                    <tr key={i} className="border-t border-neutral-100">
                                        <td className="px-3 py-2 text-neutral-500">{r.refNo ?? "—"}</td>
                                        <td className="px-3 py-2 font-semibold text-neutral-900">{r.address}</td>
                                        <td className="px-3 py-2">{r.state ?? <span className="text-amber-600">Unknown</span>}</td>
                                        <td className="px-3 py-2">
                                            {r.dateSigned ? (
                                                formatDate(r.dateSigned)
                                            ) : (
                                                <span className="text-amber-600">{r.dateSignedNote ?? "Not set"}</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-neutral-500">
                        {rows.length} propert{rows.length === 1 ? "y" : "ies"} detected. Each gets the default legal,
                        renovation and sales checklist.
                    </p>
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button onClick={handleImport} disabled={!rows.length || importing}>
                            {importing ? "Importing..." : `Import ${rows.length}`}
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
