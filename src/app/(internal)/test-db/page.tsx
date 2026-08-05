import { supabase } from "@/lib/supabase/supabase";

export default async function TestDbPage() {
    let connectionStatus = "Connecting...";
    let rowCount = 0;
    let sampleData: Array<Record<string, unknown>> | null = null;
    let errorMessage: string | null = null;

    try {
        const { data, error, count } = await supabase
            .from("properties")
            .select("id, title, asking_price, status", { count: "exact" })
            .limit(5);

        if (error) {
            connectionStatus = "Failed to query database";
            errorMessage = error.message;
        } else {
            connectionStatus = "Successfully connected and queried Supabase!";
            rowCount = count || 0;
            sampleData = data;
        }
    } catch (err: unknown) {
        connectionStatus = "Exception thrown during connection";
        errorMessage = err instanceof Error ? err.message : String(err);
    }

    return (
        <div className="mx-auto max-w-4xl p-8 font-sans">
            <h1 className="text-2xl font-bold text-black mb-4">Supabase Connection Test</h1>

            <div className={`rounded-xl border p-4 mb-6 ${errorMessage ? 'border-red-300 bg-red-50 text-red-900' : 'border-green-300 bg-green-50 text-green-900'}`}>
                <p className="font-semibold text-lg">{connectionStatus}</p>
                {errorMessage && <p className="mt-2 text-sm font-mono bg-white/50 p-2 rounded">Error: {errorMessage}</p>}
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-black mb-2">Diagnostics Summary</h2>
                <ul className="list-disc pl-5 space-y-1 text-neutral-700">
                    <li><strong>Total Published/Available Rows:</strong> {rowCount}</li>
                    <li><strong>Environment Variables Configured:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL ? "Yes (URL found)" : "Missing URL"}</li>
                </ul>

                <h3 className="text-md font-semibold text-black mt-6 mb-2">Sample Property Records:</h3>
                {sampleData && sampleData.length > 0 ? (
                    <pre className="overflow-x-auto rounded-lg bg-neutral-100 p-4 text-xs font-mono text-neutral-800">
                        {JSON.stringify(sampleData, null, 2)}
                    </pre>
                ) : (
                    <p className="text-sm text-neutral-500">No properties found in the table yet. Try inserting a row via your Supabase dashboard.</p>
                )}
            </div>
        </div>
    );
}