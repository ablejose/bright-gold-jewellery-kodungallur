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

  logo: "https://res.cloudinary.com/nplfkyjy/image/upload/v1786453234/bright-gold/logo.svg",
  favicon: "/favicon.ico",

  heroVideo:
    "https://res.cloudinary.com/nplfkyjy/video/upload/v1786453236/bright-gold/hero.mp4",

  storyVideos: [
    {
      quote: "കൈകളിൽ വിരിയുന്ന വിസ്മയം.",
      description:
        "ഓരോ ആഭരണവും ഓരോ കലാരൂപമാണ്. അതിസൂക്ഷ്മമായി, തികഞ്ഞ പൂർണ്ണതയോടെ രൂപപ്പെടുത്തിയെടുത്തവ. നിങ്ങളുടെ സ്വപ്നങ്ങൾക്ക് സ്വർണ്ണത്തിൽ ജീവൻ വയ്ക്കുമ്പോൾ.",
      video:
        "https://res.cloudinary.com/nplfkyjy/video/upload/v1786644396/bright-gold/video1.mp4",
    },
    {
      quote: "കൊടുങ്ങല്ലൂരിൻ്റെ ഹൃദയത്തിൽ നിന്ന്.",
      description:
        "ഈ നാടിൻ്റെ പൈതൃകവും പുതുമയും ഒത്തുചേരുന്ന ആഭരണങ്ങൾ. തലമുറകളായി നിങ്ങൾ നൽകുന്ന വിശ്വാസത്തിന് സ്വർണ്ണത്തേക്കാൾ തിളക്കമുണ്ട്.",
      video:
        "https://res.cloudinary.com/nplfkyjy/video/upload/v1786644397/bright-gold/video2.mp4",
    },
  ],

  storeImages: [
    "https://res.cloudinary.com/nplfkyjy/image/upload/v1786453228/bright-gold/store1.webp",
    "https://res.cloudinary.com/nplfkyjy/image/upload/v1786453229/bright-gold/store2.webp",
    "https://res.cloudinary.com/nplfkyjy/image/upload/v1786453230/bright-gold/store3.webp",
    "https://res.cloudinary.com/nplfkyjy/image/upload/v1786453230/bright-gold/store4.webp",
  ],

  heritageHeading: "ഞങ്ങളുടെ കഥ",
  heritageStory: [
    "നിങ്ങളുടെ സന്തോഷനിമിഷങ്ങൾക്ക് എപ്പോഴും\nമാറ്റുകൂട്ടാൻ ബ്രൈറ്റ് ഗോൾഡ് ജ്വല്ലറി\nഒപ്പമുണ്ട്. പരമ്പരാഗത തനിമയും\nപുത്തൻ ട്രെൻഡുകളും ഒത്തുചേരുന്ന\nസ്വർണ്ണം, വെള്ളി, ഡയമണ്ട്\nആഭരണങ്ങളുടെ ആകർഷകമായ ശേഖരം.",
  ],
  heritageImages: [
    "https://res.cloudinary.com/nplfkyjy/image/upload/v1786453231/bright-gold/heritage3.webp",
    "https://res.cloudinary.com/nplfkyjy/image/upload/v1786602231/bright-gold/heritage-store.webp",
    "https://res.cloudinary.com/nplfkyjy/image/upload/v1786602233/bright-gold/heritage-team.webp",
  ],

  storeAddresses: [
    { address: "Near Kalpaka Weddings, North Nada, Kodungallur", phone: "+919847181052" },
    { address: "Sreekumarasamajam Building, West Nada, Kodungallur", phone: "+919388902233" },
  ],
  city: "Kodungallur",
  state: "Kerala",
  pincode: "680664",

  phone: "+919847181052",
  phone2: "+919388902233",
  whatsapp: "919847181052",
  email: "",

  mapsLink:
    "https://www.google.com/maps/search/?api=1&query=Bright%20Gold%20Jewellery&query_place_id=ChIJd2ENEfQbCDsRD_HrNNb74MY",

  openingHours: "Mon–Sat: 9:30 AM – 8:00 PM",

  workshops: [
    "City Center Building, Kodungallur",
    "Near Puthanpally Church, Thrissur",
  ],

  instagram: "",
  facebook: "",

  seo: {
    title: "Bright Gold Jewellery | Gold, Silver & Diamond Store in Kodungallur",
    description:
      "Bright Gold Jewellery is a gold, silver and diamond jewellery store in Kodungallur, Kerala. Explore timeless gold, diamond and silver jewellery for every occasion at our Kodungallur showrooms.",
    keywords: [
      "Bright Gold Jewellery",
      "jewellery in Kodungallur",
      "gold, silver and diamond store in Kodungallur",
      "gold jewellery Kodungallur",
      "silver jewellery Kodungallur",
      "diamond jewellery Kodungallur",
      "jewellery store Kodungallur",
      "gold shop Kodungallur",
      "jewellery Kerala",
    ],
    canonical: "https://brightgoldkodungallur.com",
    ogImage: "/og-image.png",
  },

  faq: [],

  whatsappMessage:
    "Hello Bright Gold Jewellery, I'd like to know more about your jewellery collections.",
};
