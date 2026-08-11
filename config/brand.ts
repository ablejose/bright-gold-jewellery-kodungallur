import type { BrandConfig } from "@/types/brand";

/**
 * SINGLE SOURCE OF TRUTH.
 *
 * To rebrand this website for a different jewellery business, edit ONLY this
 * file and the Cloudinary asset URLs. No component code should change.
 */
export const BRAND: BrandConfig = {
  businessName: "Bright Gold Jewellery",
  tagline: "Kodungallur's Trusted Craftsmanship",
  description:
    "Bright Gold Jewellery is Kodungallur's trusted destination for exquisite gold, diamond, and silver jewellery. Serving Kodungallur and the surrounding areas with timeless craftsmanship and contemporary designs for every celebration.",

  logo: "/icons/logo.svg",
  favicon: "/favicon.ico",

  heroVideo:
    "https://res.cloudinary.com/apvcphao/video/upload/v1785387729/VN20260702_013328_tbexfn.mp4",

  storyVideos: [
    {
      quote: "കൈകളിൽ വിരിയുന്ന വിസ്മയം.",
      description:
        "ഓരോ ആഭരണവും ഓരോ കലാരൂപമാണ്. അതിസൂക്ഷ്മമായി, തികഞ്ഞ പൂർണ്ണതയോടെ രൂപപ്പെടുത്തിയെടുത്തവ. നിങ്ങളുടെ സ്വപ്നങ്ങൾക്ക് സ്വർണ്ണത്തിൽ ജീവൻ വയ്ക്കുമ്പോൾ.",
      video:
        "https://res.cloudinary.com/apvcphao/video/upload/v1785387729/VN20260702_013328_tbexfn.mp4",
      segments: { startAt: 32, loopEnd: 40 },
    },
    {
      quote: "കൊടുങ്ങല്ലൂരിൻ്റെ ഹൃദയത്തിൽ നിന്ന്.",
      description:
        "ഈ നാടിൻ്റെ പൈതൃകവും പുതുമയും ഒത്തുചേരുന്ന ആഭരണങ്ങൾ. തലമുറകളായി നിങ്ങൾ നൽകുന്ന വിശ്വാസത്തിന് സ്വർണ്ണത്തേക്കാൾ തിളക്കമുണ്ട്.",
      video:
        "https://res.cloudinary.com/apvcphao/video/upload/v1785387729/VN20260702_013328_tbexfn.mp4",
      segments: { startAt: 16, loopEnd: 24 },
    },
  ],

  storeImages: [
    "/images/store1.webp",
    "/images/store2.webp",
    "/images/store3.webp",
    "https://res.cloudinary.com/apvcphao/image/upload/v1785407783/hayazbb_wb1juf.webp",
  ],

  heritageHeading: "ഞങ്ങളുടെ കഥ",
  heritageStory: [
    "നിങ്ങളുടെ സന്തോഷനിമിഷങ്ങൾക്ക് എപ്പോഴും മാറ്റുകൂട്ടാൻ ബ്രൈറ്റ് ഗോൾഡ് ജ്വല്ലറി ഒപ്പമുണ്ട്. പരമ്പരാഗത തനിമയും പുത്തൻ ട്രെൻഡുകളും ഒത്തുചേരുന്ന സ്വർണ്ണം, വെള്ളി, ഡയമണ്ട് ആഭരണങ്ങളുടെ ആകർഷകമായ ശേഖരം.",
  ],
  heritageImages: [
    "/images/heritage1.webp",
    "/images/heritage3.webp",
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

  openingHours: "Mon–Sat: 9:30 AM – 8:00 PM · Sunday: 10:00 AM – 7:00 PM",

  instagram: "",
  facebook: "",

  seo: {
    title: "Bright Gold Jewellery | Jewellery in Kodungallur",
    description:
      "Bright Gold Jewellery — your premier jewellery store in Kodungallur. Gold, diamond and silver jewellery crafted for every occasion. Visit us in Kodungallur, Kerala.",
    keywords: [
      "Bright Gold Jewellery",
      "jewellery Kodungallur",
      "gold jewellery Kodungallur",
      "diamond jewellery Kodungallur",
      "silver jewellery Kodungallur",
      "jewellery store Kodungallur",
      "gold shop Kodungallur",
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
