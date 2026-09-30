import type {
  ProfileVisionMission,
  ProfileCoreValue,
  ProfileFacility,
  ProfileMilestone,
} from "../types";

export const PROFILE_INFO = {
  name: "Pusat Pengembangan Kompetensi Aparatur Sipil Negara",
  shortName: "PPKASN Kemensetneg",
  parentOrg: "Kementerian Sekretariat Negara Republik Indonesia",
  address: "Jl. Gaharu I No. 1, RT.10/RW.11, Cipete Selatan, Kec. Cilandak, Kota Jakarta Selatan, DKI Jakarta 12430",
  contact: {
    phone: "(021) 7695123",
    email: "ppkasn@setneg.go.id",
    workingHours: "Senin – Jumat: 07.30 – 16.00 WIB",
  },
  summary:
    "Pusat Pengembangan Kompetensi Aparatur Sipil Negara (PPKASN) adalah unit kerja di lingkungan Kementerian Sekretariat Negara yang bertugas menyelenggarakan pelatihan, pengembangan kapasitas kepemimpinan, kompetensi teknis, fungsional, dan sosio-kultural bagi aparatur negara demi menopang kelancaran tata kelola kepresidenan dan pemerintahan yang berkelas dunia.",
};

export const VISION_MISSION: ProfileVisionMission = {
  vision:
    "Menjadi pusat rujukan unggulan (Center of Excellence) pengembangan kompetensi aparatur sipil negara yang berintegritas tinggi, adaptif, dan berwawasan global dalam mendukung kepemimpinan presiden dan wakil presiden.",
  missions: [
    "Menyelenggarakan program kediklatan kepemimpinan, teknis, dan fungsional yang relevan dengan kebutuhan strategis birokrasi masa depan.",
    "Mengembangkan ekosistem pembelajaran pintar berbasis SPBE yang terintegrasi, fleksibel, dan mudah diakses oleh seluruh aparatur.",
    "Menanamkan budaya kerja berlandaskan nilai-nilai dasar ASN BerAKHLAK dan komitmen pelayanan publik yang berorientasi solusi.",
    "Menyediakan fasilitas sarana dan prasarana kediklatan modern yang inklusif, ramah lingkungan, dan representatif.",
  ],
};

export const CORE_VALUES: ProfileCoreValue[] = [
  {
    acronym: "Ber",
    keyword: "Berorientasi Pelayanan",
    tagline: "Komitmen memberikan pelayanan prima demi kepuasan peserta dan masyarakat",
    description: "Memahami dan memenuhi kebutuhan pembelajaran dengan ramah, cekatan, solutif, serta terus melakukan perbaikan tiada henti.",
    behaviors: ["Memahami kebutuhan peserta", "Ramah, cekatan, dan solutif", "Melakukan perbaikan berkelanjutan"],
  },
  {
    acronym: "A",
    keyword: "Akuntabel",
    tagline: "Bertanggung jawab atas kepercayaan yang diberikan",
    description: "Melaksanakan tugas dengan jujur, bertanggung jawab, cermat, disiplin, berintegritas tinggi, dan tidak menyalahgunakan kewenangan jabatan.",
    behaviors: ["Jujur dan bertanggung jawab", "Disiplin dan cermat", "Menjaga integritas jabatan"],
  },
  {
    acronym: "K",
    keyword: "Kompeten",
    tagline: "Terus belajar dan mengembangkan kapabilitas",
    description: "Meningkatkan kompetensi diri untuk menjawab tantangan yang selalu berubah dan membantu orang lain belajar.",
    behaviors: ["Meningkatkan kompetensi diri", "Membantu orang lain belajar", "Melaksanakan tugas terbaik"],
  },
  {
    acronym: "H",
    keyword: "Harmonis",
    tagline: "Saling peduli dan menghargai perbedaan",
    description: "Menghargai setiap insan tanpa memandang latar belakang, suka menolong sesama, dan membangun lingkungan kerja yang kondusif.",
    behaviors: ["Menghargai setiap perbedaan", "Suka menolong sesama", "Membangun lingkungan kondusif"],
  },
  {
    acronym: "L",
    keyword: "Loyal",
    tagline: "Berdedikasi dan mengutamakan kepentingan bangsa dan negara",
    description: "Memegang teguh ideologi Pancasila, UUD 1945, setia kepada NKRI dan pemerintahan yang sah, serta menjaga rahasia dinas.",
    behaviors: ["Memegang teguh Pancasila", "Menjaga nama baik instansi", "Menjaga rahasia jabatan"],
  },
  {
    acronym: "A",
    keyword: "Adaptif",
    tagline: "Terus berinovasi dan antusias menghadapi perubahan",
    description: "Cepat menyesuaikan diri terhadap perubahan zaman, terus berinovasi mengembangkan kreativitas, dan bertindak proaktif.",
    behaviors: ["Cepat beradaptasi", "Terus berinovasi", "Bertindak proaktif"],
  },
  {
    acronym: "K",
    keyword: "Kolaboratif",
    tagline: "Membangun kerja sama yang sinergis",
    description: "Memberi kesempatan kepada berbagai pihak untuk berkontribusi, terbuka dalam bekerja sama, serta menggerakkan pemanfaatan berbagai sumber daya.",
    behaviors: ["Terbuka bekerja sama", "Mendorong kontribusi mitra", "Mengoptimalkan sumber daya"],
  },
];

export const PROFILE_FACILITIES: ProfileFacility[] = [
  {
    id: "auditorium-gaharu",
    name: "Auditorium Gaharu",
    category: "Ruang Pertemuan",
    capacity: "Hingga 300 orang",
    description: "Gedung pertemuan utama berakustik modern dengan videotron 4K ultra-wide, sistem audio hybrid, dan ruang transit VIP kenegaraan.",
    features: ["Videotron 4K Ultra-Wide", "Audio Akustik Terpadu", "Koneksi High-Speed Dedicated", "Ruang Transit VIP"],
    image: "/empty-rooms.webp",
  },
  {
    id: "kelas-multimedia",
    name: "Ruang Kelas Diklat Multimedia",
    category: "Ruang Belajar",
    capacity: "30 – 50 peserta / kelas",
    description: "Enam ruang kelas interaktif yang dilengkapi smart display sentuh, kamera auto-tracking pembicara, dan tata kursi fleksibel untuk diskusi kelompok.",
    features: ["Interactive Smart Display", "Auto-Tracking Hybrid Camera", "Tata Suara Jernih", "Meja-Kursi Ergonomis"],
    image: "/empty-rooms.webp",
  },
  {
    id: "wisma-asrama",
    name: "Wisma Asrama Peserta",
    category: "Akomodasi",
    capacity: "Puluhan kamar tipe Single & Twin-Bed",
    description: "Penginapan peserta diklat dengan standar perhotelan dinas, dilengkapi pendingin ruangan, kamar mandi dalam, akses Wi-Fi, dan keamanan 24 jam.",
    features: ["Pendingin Ruangan (AC)", "Kamar Mandi Dalam & Water Heater", "Resepsionis 24 Jam", "Akses Ramah Disabilitas"],
    image: "/empty-rooms.webp",
  },
  {
    id: "ruang-rapat-hybrid",
    name: "Ruang Rapat Eksekutif & Hybrid",
    category: "Ruang Pertemuan",
    capacity: "15 – 35 orang",
    description: "Ruang rapat berstandar pertemuan terbatas kementerian yang dilengkapi sistem konferensi video jarak jauh, mikrofon meja terintegrasi, dan privasi tinggi.",
    features: ["Video Conference Enterprise", "Mikrofon Meja Terintegrasi", "Tata Cahaya LED Ramah Mata", "Layar Presentasi Ganda"],
    image: "/empty-rooms.webp",
  },
  {
    id: "lab-komputer-spbe",
    name: "Lab Komputer SPBE & Multimedia",
    category: "Penunjang",
    capacity: "35 unit komputer",
    description: "Laboratorium teknologi informasi untuk simulasi persuratan digital, analisis data kebijakan, dan uji kompetensi aparatur berbasis komputer.",
    features: ["Workstation Komputer Modern", "Jaringan LAN Gigabit Terisolasi", "Peranti Lunak Lisensi Resmi", "Pendingin Server Mandiri"],
    image: "/empty-rooms.webp",
  },
  {
    id: "coworking-lounge",
    name: "Co-Working Space & Perpustakaan",
    category: "Penunjang",
    capacity: "Area terbuka santai",
    description: "Area kolaborasi informal bagi peserta diklat untuk berdiskusi, membaca koleksi literatur kedinasan, atau mengerjakan tugas kelompok di luar jam kelas.",
    features: ["Koleksi Buku & Jurnal ASN", "Coffee Corner & Dispenser", "Colokan Listrik Tiap Meja", "Suasana Tenang & Hangat"],
    image: "/empty-rooms.webp",
  },
];

export const MILESTONES: ProfileMilestone[] = [
  {
    year: "Awal Berdiri",
    title: "Pusat Pendidikan dan Pelatihan (Pusdiklat)",
    description:
      "Dibentuk sebagai institusi internal di lingkungan Sekretariat Negara untuk menyelenggarakan pelatihan dasar, teknis persuratan, dan keprotokolan kenegaraan.",
  },
  {
    year: "Transformasi Kelembagaan",
    title: "Menjadi PPKASN Kemensetneg",
    description:
      "Reorientasi strategis dari sekadar pelatihan administratif menjadi pengembangan kompetensi aparatur secara menyeluruh dan terintegrasi manajemen talenta nasional.",
  },
  {
    year: "Era SPBE & Digital",
    title: "Peluncuran Ekosistem PIONIR, POSTER, & SARPRAS",
    description:
      "Transformasi digital menyeluruh layanan kediklatan dan pengelolaan sarana prasarana menuju birokrasi nirkertas yang transparan, mudah, dan akuntabel.",
  },
  {
    year: "Tahun 2026",
    title: "Akreditasi A & Revitalisasi Kampus Cilandak",
    description:
      "Meraih Akreditasi Mutu Kategori A dari LAN RI serta merampungkan penataan menyeluruh Kampus Gaharu Cilandak sebagai pusat diklat berstandar internasional.",
  },
];
