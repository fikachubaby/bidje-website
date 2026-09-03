"use client";

import { useState, DragEvent, ChangeEvent } from "react";
import { UploadCloud, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/ButtonProps";
import { FormInput } from "@/components/admin/ui/FormField";

interface ImageDropzoneProps {
    images: string[];
    uploading: boolean;
    uploadError: string;
    onUploadFiles: (files: FileList | File[]) => void;
    onAddUrl: (url: string) => void;
    onRemoveImage: (index: number) => void;
}

export function ImageDropzone({
    images,
    uploading,
    uploadError,
    onUploadFiles,
    onAddUrl,
    onRemoveImage,
}: ImageDropzoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [imageUrlInput, setImageUrlInput] = useState("");

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onUploadFiles(e.dataTransfer.files);
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onUploadFiles(e.target.files);
            e.target.value = "";
        }
    };

    const handleUrlSubmit = () => {
        const url = imageUrlInput.trim();
        if (url) {
            onAddUrl(url);
            setImageUrlInput("");
        }
    };

    return (
        <div className="space-y-3">
            {/* Drag and Drop Zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 transition-colors ${isDragging
                        ? "border-blue-500 bg-blue-50/50"
                        : "border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50"
                    }`}
            >
                <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    className="absolute inset-0 cursor-pointer opacity-0"
                    onChange={handleFileChange}
                    disabled={uploading}
                />

                {uploading ? (
                    <div className="flex flex-col items-center gap-2 text-neutral-500">
                        <Loader2 className="h-8 w-8 animate-spin text-neutral-700" />
                        <p className="text-xs font-semibold">Uploading images...</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-center">
                        <div className="mb-2 rounded-xl bg-white p-2.5 shadow-sm border border-neutral-200 text-neutral-600">
                            <UploadCloud className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-bold text-neutral-800">
                            Drag & drop photos here, or <span className="text-blue-600 underline">browse</span>
                        </p>
                        <p className="mt-1 text-xs text-neutral-400">
                            Supports JPEG, PNG, WEBP, GIF (Bulk selection allowed)
                        </p>
                    </div>
                )}
            </div>

            {/* URL Input Bar */}
            <div className="flex items-center gap-2">
                <FormInput
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            handleUrlSubmit();
                        }
                    }}
                    placeholder="Or paste an image URL directly..."
                    className="mt-0 flex-1"
                />
                <Button type="button" variant="secondary" onClick={handleUrlSubmit}>
                    <ImagePlus className="h-4 w-4 mr-1" />
                    Add
                </Button>
            </div>

            {uploadError && <p className="text-xs font-semibold text-red-600">{uploadError}</p>}

            {/* Image Preview Grid */}
            {images.length > 0 && (
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {images.map((url, index) => (
                        <li
                            key={`${url}-${index}`}
                            className="group relative overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100"
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={url}
                                alt={`Property photo ${index + 1}`}
                                className="h-24 w-full object-cover"
                            />
                            {index === 0 && (
                                <span className="absolute left-1.5 top-1.5 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                                    Cover
                                </span>
                            )}
                            <button
                                type="button"
                                onClick={() => onRemoveImage(index)}
                                className="absolute right-1.5 top-1.5 rounded-lg bg-black/60 p-1 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                                aria-label="Remove image"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}