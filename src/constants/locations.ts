export const MALAYSIAN_STATES = [
    "Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan", "Pahang",
    "Pulau Pinang", "Perak", "Perlis", "Sabah", "Sarawak", "Selangor",
    "Terengganu", "Kuala Lumpur", "Labuan", "Putrajaya",
] as const;

export const STATE_DISTRICTS: Record<string, string[]> = {
    Johor: ["Johor Bahru", "Batu Pahat", "Kluang", "Kulai", "Muar", "Segamat", "Pontian", "Kota Tinggi", "Mersing", "Tangkak"],
    Kedah: ["Alor Setar", "Sungai Petani", "Kulim", "Langkawi", "Baling", "Bandar Baharu", "Kota Setar", "Kubang Pasu", "Kuala Muda", "Padang Terap", "Pendang", "Pokok Sena", "Sik", "Yan"],
    Kelantan: ["Kota Bharu", "Pasir Mas", "Tumpat", "Bachok", "Pasir Puteh", "Machang", "Tanah Merah", "Jeli", "Kuala Krai", "Gua Musang"],
    Melaka: ["Melaka Tengah", "Alor Gajah", "Jasin"],
    "Negeri Sembilan": ["Seremban", "Port Dickson", "Rembau", "Tampin", "Kuala Pilah", "Jelebu", "Jempol"],
    Pahang: ["Kuantan", "Temerloh", "Bentong", "Raub", "Cameron Highlands", "Lipis", "Jerantut", "Maran", "Bera", "Rompin", "Pekan"],
    "Pulau Pinang": ["George Town", "Butterworth", "Bukit Mertajam", "Bayan Lepas", "Seberang Perai", "Barat Daya", "Timur Laut"],
    Perak: ["Ipoh", "Taiping", "Teluk Intan", "Manjung", "Kuala Kangsar", "Kampar", "Kerian", "Kinta", "Perak Tengah"],
    Perlis: ["Kangar", "Arau", "Padang Besar"],
    Sabah: ["Kota Kinabalu", "Sandakan", "Tawau", "Lahad Datu", "Keningau", "Kudat", "Beaufort", "Papar", "Penampang", "Tuaran", "Ranau", "Semporna"],
    Sarawak: ["Kuching", "Miri", "Sibu", "Bintulu", "Sarikei", "Sri Aman", "Betong", "Mukah", "Kapit", "Limbang", "Samarahan", "Serian"],
    Selangor: ["Gombak", "Hulu Langat", "Hulu Selangor", "Klang", "Kuala Langat", "Kuala Selangor", "Petaling", "Sabak Bernam", "Sepang"],
    Terengganu: ["Kuala Terengganu", "Kemaman", "Dungun", "Marang", "Hulu Terengganu", "Besut", "Setiu"],
    "Kuala Lumpur": ["Wangsa Maju", "Setiawangsa", "Cheras", "Kepong", "Segambut", "Setapak", "Bukit Bintang", "Titiwangsa", "Bangsar", "Mont Kiara", "Bukit Jalil", "Lembah Pantai", "Bandar Tun Razak", "Seputeh", "Sentul", "Brickfields", "Damansara", "Ampang", "Sri Petaling", "OUG"],
    Labuan: ["Victoria", "Bukit Kuda", "Layang-Layangan", "Rancha-Rancha"],
    Putrajaya: ["Presint 1", "Presint 2", "Presint 3", "Presint 4", "Presint 5", "Presint 6", "Presint 7", "Presint 8", "Presint 9", "Presint 10", "Presint 11", "Presint 12", "Presint 13", "Presint 14", "Presint 15", "Presint 16", "Presint 17", "Presint 18", "Presint 19", "Presint 20"],
};