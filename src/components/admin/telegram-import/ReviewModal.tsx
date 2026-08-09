"use client";

import { ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/ButtonProps";
import {
    FormField,
    FormInput,
    FormTextarea,
} from "@/components/admin/ui/FormField";
import { Modal } from "@/components/admin/ui/Modal";
import type { TelegramParsedProperty } from "@/types/telegram-import";

interface ReviewModalProps {
    draft: TelegramParsedProperty | null;
    mainUrl: string | null;
    onClose: () => void;
    onSave: () => void;
    setReviewDraft: React.Dispatch<React.SetStateAction<TelegramParsedProperty | null>>;
}

export function ReviewModal({
    draft,
    mainUrl,
    onClose,
    onSave,
    setReviewDraft,
}: ReviewModalProps) {
    return (
        <Modal
            open={draft != null}
            onClose={onClose}
            title={draft ? `Review ${draft.telegramCode}` : "Review"}
            description="Edit parsed fields for this browser session only. Changes are not saved to localStorage."
            wide
        >
            {draft ? (
                <div className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
                        <div>
                            {mainUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={mainUrl}
                                    alt="Main property photo"
                                    className="h-56 w-full rounded-2xl object-cover"
                                />
                            ) : (
                                <div className="flex h-56 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400">
                                    <ImageIcon className="h-10 w-10" />
                                </div>
                            )}
                            <p className="mt-2 text-sm font-bold text-neutral-600">
                                {draft.photoCount} photo{draft.photoCount === 1 ? "" : "s"}
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <FormField label="Telegram code">
                                <FormInput
                                    value={draft.telegramCode}
                                    onChange={(e) =>
                                        setReviewDraft({ ...draft, telegramCode: e.target.value })
                                    }
                                />
                            </FormField>
                            <FormField label="Title">
                                <FormInput
                                    value={draft.title}
                                    onChange={(e) =>
                                        setReviewDraft({ ...draft, title: e.target.value })
                                    }
                                />
                            </FormField>
                            <FormField label="Address" wide>
                                <FormInput
                                    value={draft.address}
                                    onChange={(e) =>
                                        setReviewDraft({ ...draft, address: e.target.value })
                                    }
                                />
                            </FormField>
                            <FormField label="State">
                                <FormInput
                                    value={draft.state}
                                    onChange={(e) =>
                                        setReviewDraft({ ...draft, state: e.target.value })
                                    }
                                />
                            </FormField>
                            <FormField label="District">
                                <FormInput
                                    value={draft.district}
                                    onChange={(e) =>
                                        setReviewDraft({ ...draft, district: e.target.value })
                                    }
                                />
                            </FormField>
                            <FormField label="Property type">
                                <FormInput
                                    value={draft.propertyType}
                                    onChange={(e) =>
                                        setReviewDraft({ ...draft, propertyType: e.target.value })
                                    }
                                />
                            </FormField>
                            <FormField label="Tenure">
                                <FormInput
                                    value={draft.tenure}
                                    onChange={(e) =>
                                        setReviewDraft({ ...draft, tenure: e.target.value })
                                    }
                                />
                            </FormField>
                            <FormField label="Bumi status">
                                <FormInput
                                    value={draft.bumiStatus}
                                    onChange={(e) =>
                                        setReviewDraft({ ...draft, bumiStatus: e.target.value })
                                    }
                                />
                            </FormField>
                            <FormField label="Land size">
                                <FormInput
                                    value={draft.landSize}
                                    onChange={(e) =>
                                        setReviewDraft({ ...draft, landSize: e.target.value })
                                    }
                                />
                            </FormField>
                            <FormField label="Built-up">
                                <FormInput
                                    value={draft.builtUp}
                                    onChange={(e) =>
                                        setReviewDraft({ ...draft, builtUp: e.target.value })
                                    }
                                />
                            </FormField>
                            <FormField label="Bedrooms">
                                <FormInput
                                    type="number"
                                    value={draft.bedrooms ?? ""}
                                    onChange={(e) =>
                                        setReviewDraft({
                                            ...draft,
                                            bedrooms: e.target.value === "" ? null : Number(e.target.value),
                                        })
                                    }
                                />
                            </FormField>
                            <FormField label="Bathrooms">
                                <FormInput
                                    type="number"
                                    value={draft.bathrooms ?? ""}
                                    onChange={(e) =>
                                        setReviewDraft({
                                            ...draft,
                                            bathrooms: e.target.value === "" ? null : Number(e.target.value),
                                        })
                                    }
                                />
                            </FormField>
                            <FormField label="Price (MYR)">
                                <FormInput
                                    type="number"
                                    value={draft.price ?? ""}
                                    onChange={(e) =>
                                        setReviewDraft({
                                            ...draft,
                                            price: e.target.value === "" ? null : Number(e.target.value),
                                        })
                                    }
                                />
                            </FormField>
                            <FormField label="Google Maps URL" wide>
                                <FormInput
                                    value={draft.mapsUrl}
                                    onChange={(e) =>
                                        setReviewDraft({ ...draft, mapsUrl: e.target.value })
                                    }
                                />
                            </FormField>
                            <FormField label="Description" wide>
                                <FormTextarea
                                    rows={4}
                                    value={draft.description}
                                    onChange={(e) =>
                                        setReviewDraft({ ...draft, description: e.target.value })
                                    }
                                />
                            </FormField>
                        </div>
                    </div>

                    {draft.warnings.length > 0 ? (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                            <p className="text-sm font-bold text-amber-900">Warnings</p>
                            <ul className="mt-2 list-inside list-disc text-sm text-amber-800">
                                {draft.warnings.map((w) => (
                                    <li key={w}>{w}</li>
                                ))}
                            </ul>
                        </div>
                    ) : null}

                    <FormField label="Raw Telegram text">
                        <FormTextarea rows={8} value={draft.rawText} readOnly />
                    </FormField>

                    <div className="grid gap-4 md:grid-cols-2">
                        <FormField label="Message IDs">
                            <FormTextarea
                                rows={3}
                                value={draft.messageIds.join(", ")}
                                readOnly
                            />
                        </FormField>
                        <FormField label="Photo paths">
                            <FormTextarea
                                rows={3}
                                value={draft.photoPaths.join("\n") || "—"}
                                readOnly
                            />
                        </FormField>
                    </div>

                    <div className="flex flex-wrap justify-end gap-3">
                        <Button type="button" variant="secondary" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="button" onClick={onSave}>
                            Save changes
                        </Button>
                    </div>
                </div>
            ) : null}
        </Modal>
    );
}