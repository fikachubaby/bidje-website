import enMessages from "../../../messages/en.json";

type NestedKeyOf<ObjectType extends object> = {
    [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

type Messages = typeof enMessages;
type TranslationKey = NestedKeyOf<Messages>;

export function translate(path: TranslationKey): string {
    const keys = path.split(".");
    let current: unknown = enMessages;

    for (const key of keys) {
        if (current && typeof current === "object" && key in current) {
            current = (current as Record<string, unknown>)[key];
        } else {
            return path;
        }
    }

    return typeof current === "string" ? current : path;
}