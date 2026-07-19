import type { BrandConfig } from "@/types/brand";

export const BRAND: BrandConfig = {
  businessName: "Bright Gold Jewellery",
  tagline: "Exquisite Jewellery in Kodungallur",
  description:
    "Bright Gold Jewellery is Kodungallur's trusted destination for gold, diamond and silver jewellery. Serving Kodungallur with timeless craftsmanship and exquisite collections for every celebration.",

  logo: "/icons/logo.svg",
  favicon: "/favicon.ico",

  heroVideo:
    "https://res.cloudinary.com/fylz5e3j/video/upload/v1782936959/VN20260702_013328_tbexfn.mp4",

  storyVideos: [
    {
      quote: "ലാളിത്യത്തിലെ പൂർണ്ണത.",
      description:
        "അണിയാൻ തീരെ ഭാരമില്ലാത്ത, എന്നാൽ കണ്ണഞ്ചിപ്പിക്കുന്ന ഡിസൈനുകൾ.",
      video:
        "https://res.cloudinary.com/fylz5e3j/video/upload/v1782936959/VN20260702_013328_tbexfn.mp4",
      segments: { startAt: 0, loopEnd: 8 },
    },
    {
      quote: "കൈകളിൽ വിരിയുന്ന വിസ്മയം.",
      description:
        "ഓരോ ആഭരണവും ഓരോ കലാരൂപമാണ്‍.",
      video:
        "https://res.cloudinary.com/fylz5e3j/video/upload/v1782936959/VN20260702_013328_tbexfn.mp4",
      segments: { startAt: 32, loopEnd: 40 },
    },
    {
      quote: "കൊടുങ്ങല്ലൂർയുടെ ഹൃദയത്തിൽ നിന്ന്.",
      description:
        "ഈ നാടിന്റെ പൈതൃകവും പുതുമയും ഒത്തുചേരുന്ന ആഭരണങ്ങൾ.",
      video:
        "https://res.cloudinary.com/fylz5e3j/video/upload/v1782936959/VN20260702_013328_tbexfn.mp4",
      segments: { startAt: 16, loopEnd: 24 },
    },
  ],

  storeImages: [
    "/images/store1.webp",
    "/images/store2.webp",
    "https://res.cloudinary.com/fylz5e3j/image/upload/v1782940196/hayazcc_vuguic.webp",
    "https://res.cloudinary.com/fylz5e3j/image/upload/v1782940196/hayazbb_wb1juf.webp",
  ],

  address: "Near Reliance Communications, Kodungallur, Kerala 680664",
  city: "Kodungallur",
  state: "Kerala",
  pincode: "680664",

  phone: "+919847181052",
  whatsapp: "919847181052",
  email: "",

  mapsLink:
    "https://www.google.com/maps/search/?api=1&query=Bright%20Gold%20Jewellery&query_place_id=ChIJd2ENEfQbCDsRD_HrNNb74MY",

  openingHours: "Mon–Sat: 9:30 AM – 8:00 PM · Sunday: 10:00 AM – 7:00 PM",

  instagram: "",
  facebook: "",

  seo: {
    title: "Bright Gold Jewellery | Jewellery Store in Kodungallur",
    description:
      "Bright Gold Jewellery — your trusted destination for gold, diamond and silver jewellery in Kodungallur, Kerala.",
    keywords: [
      "Bright Gold Jewellery",
      "jewellery Kodungallur",
      "gold jewellery Kodungallur",
      "diamond jewellery Kodungallur",
      "silver jewellery Kodungallur",
      "jewellery store Kodungallur",
      "jewellery Kerala",
    ],
    canonical: "https://bright-gold-jewellery-kodungallur.vercel.app",
    ogImage:
      "/images/store1.webp",
  },

  faq: [],

  whatsappMessage:
    "Hello Bright Gold Jewellery, I'd like to know more about your jewellery collections.",
};
