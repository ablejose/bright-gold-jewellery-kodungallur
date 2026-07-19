import type { BrandConfig } from "@/types/brand";

/**
 * SINGLE SOURCE OF TRUTH.
 *
 * To rebrand this website for a different jewellery business, edit ONLY this
 * file and the Cloudinary asset URLs. No component code should change.
 */
export const BRAND: BrandConfig = {
  businessName: "Bright Gold Jewellery",
  tagline: "Trusted Jewellery Store in Chalakudy",
  description:
    "Bright Gold Jewellery is Chalakudy's trusted destination for exquisite gold, diamond, and silver jewellery. Serving Chalakudy with timeless craftsmanship and elegant designs for every celebration.",

  logo: "/icons/logo.svg",
  favicon: "/favicon.ico",

  heroVideo:
    "https://res.cloudinary.com/fylz5e3j/video/upload/v1782936959/VN20260702_013328_tbexfn.mp4",

  storyVideos: [
    {
      quote: "ലാളിത്യത്തിലെ പൂർണ്ണത.",
      description:
        "അണിയാൻ തീരെ ഭാരമില്ലാത്ത, എന്നാൽ കണ്ണഞ്ചിപ്പിക്കുന്ന ഡിസൈനുകൾ. നിങ്ങളുടെ ഓരോ സാധാരണ ദിവസത്തെയും മനോഹരമാക്കാൻ ഇവ മതിയാകും.",
      video:
        "https://res.cloudinary.com/fylz5e3j/video/upload/v1782936959/VN20260702_013328_tbexfn.mp4",
      segments: { startAt: 0, loopEnd: 8 },
    },
    {
      quote: "കൈകളിൽ വിരിയുന്ന വിസ്മയം.",
      description:
        "ഓരോ ആഭരണവും ഓരോ കലാരൂപമാണ്. അതിസൂക്ഷ്മമായി, തികഞ്ഞ പൂർണ്ണതയോടെ രൂപപ്പെടുത്തിയെടുത്തവ. നിങ്ങളുടെ സ്വപ്നങ്ങൾക്ക് സ്വർണ്ണത്തിൽ ജീവൻ വയ്ക്കുമ്പോൾ.",
      video:
        "https://res.cloudinary.com/fylz5e3j/video/upload/v1782936959/VN20260702_013328_tbexfn.mp4",
      segments: { startAt: 32, loopEnd: 40 },
    },
    {
      quote: "ചാലക്കുടിയുടെ ഹൃദയത്തിൽ നിന്ന്.",
      description:
        "ഈ നാടിന്റെ പൈതൃകവും പുതുമയും ഒത്തുചേരുന്ന ആഭരണങ്ങൾ. തലമുറകളായി നിങ്ങൾ നൽകുന്ന വിശ്വാസത്തിന് സ്വർണ്ണത്തേക്കാൾ തിളക്കമുണ്ട്.",
      video:
        "https://res.cloudinary.com/fylz5e3j/video/upload/v1782936959/VN20260702_013328_tbexfn.mp4",
      segments: { startAt: 16, loopEnd: 24 },
    },
  ],

  storeImages: [
    "https://lh3.googleusercontent.com/gps-cs-s/AHRPTWkxT_GbizXJxsNl_ttluvfZGRjB2JEWeMyTID4ZVRn5iIeC7NJ8etQuJpx-wP8gP7Yy6I0QWp0S0ZABgs69XL1O19mMLg9Go1QMKJZSK6j3vI_C_twFdgaToOOAXSx0NOuP1ff8aQ=s1600",
    "https://lh3.googleusercontent.com/gps-cs-s/AHRPTWkyis_9v1HjkVmbsiK1bN4PzCi6iko3R6bmKwG3y8xkd3Cezh3G7nTwu1kv_VLVx73KZXoUXvI0-rq2I5DHfh87_HI3VEI4ZnT-NsDzDKJKulnnAMN6cbwCw9v2-sben3GVP3_7rw=s1600",
    "https://lh3.googleusercontent.com/gps-cs-s/AHRPTWlIYHQOeQrM5PoT2w0DYt64xIeLhSc17JR1RNtO6s29b6mm6eOfoDubAMaUlp8KTmA5T_XNxOF8cNE4MHnIXemRYftsZkwDQFTD0idN7xui9h2ZeflfzZXAk3olvVA4uGQRD0OX2g=s1600",
    "https://res.cloudinary.com/fylz5e3j/image/upload/v1782940196/hayazbb_wb1juf.webp",
  ],

  address: "Near Reliance Communications, Kodungallur, Kerala 680664",
  city: "Chalakudy",
  state: "Kerala",
  pincode: "680664",

  phone: "+919847181052",
  whatsapp: "919847181052",
  email: "",

  mapsLink:
    "https://www.google.com/maps/search/?api=1&query=Bright%20Gold%20Jewellery&query_place_id=ChIJd2ENEfQbCDsRD_HrNNb74MY",

  openingHours: "Mon–Sat: 9:30 AM – 8:00 PM · Sunday: 10:00 AM – 7:00 PM",

  instagram: "",
  facebook: "",

  seo: {
    title: "Bright Gold Jewellery | Jewellery in Chalakudy",
    description:
      "Bright Gold Jewellery is Chalakudy's trusted destination for exquisite gold, diamond, and silver jewellery. Serving Chalakudy with timeless craftsmanship and elegant designs for every celebration.",
    keywords: [
      "Bright Gold Jewellery",
      "jewellery Chalakudy",
      "gold jewellery Chalakudy",
      "diamond jewellery Chalakudy",
      "silver jewellery Chalakudy",
      "jewellery store Kerala",
    ],
    canonical: "https://bright-gold-jewellery-kodungallur.vercel.app",
    ogImage:
      "https://lh3.googleusercontent.com/gps-cs-s/AHRPTWkxT_GbizXJxsNl_ttluvfZGRjB2JEWeMyTID4ZVRn5iIeC7NJ8etQuJpx-wP8gP7Yy6I0QWp0S0ZABgs69XL1O19mMLg9Go1QMKJZSK6j3vI_C_twFdgaToOOAXSx0NOuP1ff8aQ=s1600",
  },

  faq: [],

  whatsappMessage:
    "Hello Bright Gold Jewellery, I'd like to know more about your jewellery collections.",
};
