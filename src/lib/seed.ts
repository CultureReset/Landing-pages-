import { get, id, now, run } from "./db";
import { createUser } from "./users";
import { createItem, createLink, createSite, createTestimonial, updateSite } from "./repo";
import { themeById, DEFAULT_SECTIONS, DEFAULT_HOURS } from "./themes";
import type { BusinessType, EventKind, Site } from "./types";

import { avatarUrl, placeholderUrl } from "./placeholder";

const img = (seed: string, w = 1200, h = 800) => placeholderUrl(seed, w, h);
const face = (seed: string, name = "") =>
  avatarUrl(
    `${seed}-face`,
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0] ?? "")
      .join("") || seed.slice(0, 2).toUpperCase(),
  );

interface SeedSite {
  slug: string;
  business: string;
  owner: string;
  headline: string;
  tagline: string;
  bio: string;
  type: BusinessType;
  theme: string;
  location: string;
  address: string;
  phone: string;
  email: string;
  credential: string;
  stats: [string, string][];
  actions: { kind: string; label: string; value: string }[];
  links: { kind: string; label: string; sublabel: string; value: string; highlight?: boolean }[];
  items: {
    title: string;
    subtitle: string;
    description: string;
    price: number | null;
    priceNote?: string;
    status?: string;
    category: string;
    location?: string;
    specs: [string, string][];
    features: string[];
    featured?: boolean;
  }[];
  testimonials: { author: string; role: string; quote: string }[];
}

const SITES: SeedSite[] = [
  {
    slug: "nora-vance",
    business: "Vance & Co. Realty",
    owner: "Nora Vance",
    headline: "Broker Associate · Hudson Valley",
    tagline: "Buying, selling and everything in the middle.",
    bio: "Fourteen years selling homes between Beacon and Rhinebeck. I represent about thirty families a year, which is deliberate — it means you get me on the phone, not an assistant. Most of my business comes from clients who send their friends.",
    type: "real_estate",
    theme: "midnight",
    location: "Beacon, NY",
    address: "18 Main Street, Beacon, NY 12508",
    phone: "+1 845 555 0142",
    email: "nora@vanceco.com",
    credential: "NY Lic. #10401288764",
    stats: [["14", "years in the business"], ["$186M", "sold to date"], ["4.9★", "212 reviews"]],
    actions: [
      { kind: "call", label: "Call", value: "+18455550142" },
      { kind: "whatsapp", label: "WhatsApp", value: "+18455550142" },
      { kind: "booking", label: "Book a viewing", value: "https://cal.com/noravance/viewing" },
      { kind: "email", label: "Email", value: "nora@vanceco.com" },
    ],
    links: [
      { kind: "form", label: "Get a free home valuation", sublabel: "Comparable sales in 24 hours", value: "#enquire", highlight: true },
      { kind: "booking", label: "Book a private viewing", sublabel: "Evenings and weekends available", value: "https://cal.com/noravance/viewing" },
      { kind: "file", label: "2026 Hudson Valley Buyer Guide", sublabel: "PDF · 18 pages", value: "https://example.com/buyer-guide.pdf" },
      { kind: "instagram", label: "Instagram", sublabel: "@noravance.homes", value: "https://instagram.com/noravance.homes" },
      { kind: "review", label: "Read client reviews", sublabel: "212 reviews on Google", value: "https://g.page/vanceco/review" },
      { kind: "maps", label: "Visit the office", sublabel: "18 Main Street, Beacon", value: "18 Main Street, Beacon, NY 12508" },
    ],
    items: [
      {
        title: "412 Wisteria Lane",
        subtitle: "Restored 1908 farmhouse on 2.4 acres",
        description:
          "A rare one — the kind of house that gets three offers before the sign goes up. Original heart-pine floors throughout, a kitchen rebuilt in 2023 with soapstone counters and a 48\" range, and a screened porch that runs the full width of the back. The barn is wired and framed for a studio. Ten minutes to the Beacon train, ninety to Grand Central.",
        price: 895000,
        status: "available",
        category: "Single family",
        location: "Beacon, NY",
        specs: [["Beds", "4"], ["Baths", "3"], ["Sq ft", "2,840"], ["Lot", "2.4 acres"], ["Built", "1908"], ["Taxes", "$14,200/yr"]],
        features: ["Renovated kitchen", "Screened porch", "Wired barn / studio", "Mountain views", "Whole-house generator"],
        featured: true,
      },
      {
        title: "8 Fishkill Creek Drive, Unit 306",
        subtitle: "Top-floor loft in the old mill building",
        description:
          "Twelve-foot ceilings, exposed brick on three walls, and windows facing the creek. The building's a converted 1880s hat factory — elevator, secure parking, and a roof deck the whole floor shares. Walk to the train in six minutes.",
        price: 549000,
        status: "pending",
        category: "Condo",
        location: "Beacon, NY",
        specs: [["Beds", "2"], ["Baths", "2"], ["Sq ft", "1,410"], ["HOA", "$482/mo"], ["Built", "1884 / 2019"], ["Parking", "1 deeded"]],
        features: ["12ft ceilings", "Exposed brick", "Roof deck", "Deeded parking", "Elevator building"],
      },
      {
        title: "77 Ridge Road",
        subtitle: "Mid-century on the ridge, first time on market",
        description:
          "Owned by the same family since it was built in 1962. Post-and-beam, glass across the back, and a view that runs to the river. It needs a kitchen and two baths — priced accordingly. If you've been waiting for something with bones, this is it.",
        price: 720000,
        status: "available",
        category: "Single family",
        location: "Cold Spring, NY",
        specs: [["Beds", "3"], ["Baths", "2"], ["Sq ft", "2,150"], ["Lot", "1.1 acres"], ["Built", "1962"], ["Taxes", "$11,800/yr"]],
        features: ["Post and beam", "River views", "Original details", "Two-car garage"],
      },
      {
        title: "231 Verplanck Avenue",
        subtitle: "Sold in 9 days, $42k over ask",
        description:
          "Listed on a Thursday, eleven showings over the weekend, six offers by Tuesday. Staged, photographed and priced to create competition rather than chase it.",
        price: 642000,
        status: "sold",
        category: "Single family",
        location: "Beacon, NY",
        specs: [["Beds", "3"], ["Baths", "2"], ["Sq ft", "1,760"], ["Days on market", "9"], ["Sold", "$642,000"], ["Over ask", "+$42,000"]],
        features: ["Sold above asking", "Six offers", "Nine days on market"],
      },
      {
        title: "The Old Post Road Estate",
        subtitle: "Coming to market this spring",
        description:
          "Eighteen acres, a main house, a guest cottage and a pond. Photography in March. Get on the early list if you want to see it before it's public.",
        price: null,
        priceNote: "Price on application",
        status: "coming_soon",
        category: "Estate",
        location: "Rhinebeck, NY",
        specs: [["Beds", "6"], ["Baths", "5"], ["Lot", "18 acres"], ["Available", "Spring 2026"]],
        features: ["Guest cottage", "Spring-fed pond", "18 acres", "Early list available"],
      },
    ],
    testimonials: [
      { author: "Dan & Priya M.", role: "Bought in Beacon", quote: "Nora told us not to bid on the first two houses we loved. She was right both times. The third one we got for eleven under ask." },
      { author: "Grace Ellery", role: "Sold on Verplanck Ave", quote: "Nine days. Six offers. She priced it exactly where she said she would and then handled every single thing." },
      { author: "Tobias Reed", role: "Relocated from Brooklyn", quote: "I sent her three friends within a year. That's the whole review." },
    ],
  },
  {
    slug: "atlas-motorworks",
    business: "Atlas Motorworks",
    owner: "Marcus Oyelaran",
    headline: "Independent European specialist · Since 2011",
    tagline: "Sorted, serviced, and sold with the paperwork to prove it.",
    bio: "We buy, recondition and sell around sixty cars a year. Every one gets a full inspection, fresh fluids and an independent report you can read before you come in. No doc fees, no surprises at the desk.",
    type: "automotive",
    theme: "cobalt",
    location: "Portland, OR",
    address: "4120 SE Powell Blvd, Portland, OR 97202",
    phone: "+1 503 555 0188",
    email: "sales@atlasmotorworks.com",
    credential: "OR Dealer #DA-22417",
    stats: [["60+", "cars a year"], ["148", "point inspection"], ["4.8★", "340 reviews"]],
    actions: [
      { kind: "call", label: "Call sales", value: "+15035550188" },
      { kind: "sms", label: "Text us", value: "+15035550188" },
      { kind: "booking", label: "Book a test drive", value: "https://cal.com/atlas/testdrive" },
      { kind: "maps", label: "Directions", value: "4120 SE Powell Blvd, Portland, OR 97202" },
    ],
    links: [
      { kind: "form", label: "Value my trade-in", sublabel: "Real number in one business day", value: "#enquire", highlight: true },
      { kind: "booking", label: "Book a test drive", sublabel: "Seven days a week", value: "https://cal.com/atlas/testdrive" },
      { kind: "file", label: "Financing pre-approval", sublabel: "Soft pull, no credit impact", value: "https://example.com/atlas-finance" },
      { kind: "youtube", label: "Walkaround videos", sublabel: "Every car, cold start to cargo", value: "https://youtube.com/@atlasmotorworks" },
      { kind: "review", label: "340 Google reviews", sublabel: "4.8 average", value: "https://g.page/atlas/review" },
    ],
    items: [
      {
        title: "2021 Porsche 911 Carrera S",
        subtitle: "992 · PDK · 18,400 miles",
        description:
          "Two-owner car, Oregon its whole life, no paint outside the factory. Sport Chrono, PASM, ventilated seats and the rear-axle steering. Full PPI on file from an independent shop that isn't us.",
        price: 132500,
        status: "featured_deal",
        category: "Sports",
        location: "Portland, OR",
        specs: [["Mileage", "18,400"], ["Transmission", "8-spd PDK"], ["Drivetrain", "RWD"], ["Engine", "3.0L twin-turbo flat-6"], ["Exterior", "GT Silver"], ["VIN", "WP0AB2A9•••••"]],
        features: ["Sport Chrono", "Rear-axle steering", "Ventilated seats", "Clean Carfax", "148-pt inspection"],
        featured: true,
      },
      {
        title: "2022 Audi RS6 Avant",
        subtitle: "600hp wagon · 24,100 miles",
        description:
          "The one everyone asks about. Dynamic package, carbon optic, RS design red. Ceramic-coated in January and it still beads. New Michelin PS4S all round at 22k.",
        price: 108900,
        status: "available",
        category: "Wagon",
        location: "Portland, OR",
        specs: [["Mileage", "24,100"], ["Transmission", "8-spd auto"], ["Drivetrain", "Quattro AWD"], ["Engine", "4.0L twin-turbo V8"], ["Exterior", "Nardo Grey"], ["Warranty", "Factory to 2027"]],
        features: ["Dynamic package", "Carbon optic", "New PS4S tyres", "Ceramic coated"],
      },
      {
        title: "2019 Land Rover Defender 110",
        subtitle: "Restored · 61,200 miles",
        description:
          "Galvanised chassis, rebuilt 2.2 diesel at 54k with receipts, and a Puma interior that's actually comfortable. Built for someone who used it, not someone who parked it.",
        price: 74000,
        status: "available",
        category: "SUV",
        location: "Portland, OR",
        specs: [["Mileage", "61,200"], ["Transmission", "6-spd manual"], ["Drivetrain", "4WD"], ["Engine", "2.2L diesel"], ["Exterior", "Keswick Green"], ["Service", "Full history"]],
        features: ["Galvanised chassis", "Engine rebuild at 54k", "Full service history", "Winch and roof rack"],
      },
      {
        title: "2020 BMW M340i xDrive",
        subtitle: "Sold — 2 similar arriving",
        description: "Went in four days to a repeat customer. Two more G20 M340i cars land at the end of the month — get on the list if you want first look.",
        price: 41800,
        status: "sold",
        category: "Sedan",
        location: "Portland, OR",
        specs: [["Mileage", "31,900"], ["Transmission", "8-spd auto"], ["Drivetrain", "xDrive AWD"], ["Sold in", "4 days"]],
        features: ["Sold", "Two similar arriving"],
      },
    ],
    testimonials: [
      { author: "Renata K.", role: "Bought the RS6", quote: "They sent me the inspection report before I asked for it. First dealer I've ever said that about." },
      { author: "Sam Whitfield", role: "Traded a Cayman", quote: "Trade number was the same on the day as it was on the phone. No games at the desk." },
      { author: "Julien P.", role: "Bought remotely from Seattle", quote: "Forty-minute video walkaround, every stone chip pointed out. Car was exactly as described." },
    ],
  },
  {
    slug: "ember-supper-club",
    business: "Ember Supper Club",
    owner: "Ines Okonjo",
    headline: "Live-fire kitchen · Thursday to Sunday",
    tagline: "Everything over wood. Forty seats. One sitting a night.",
    bio: "A forty-seat room built around a single wood-fired hearth. The menu changes every week depending on what the farms send us. We do one sitting a night so nobody gets rushed.",
    type: "restaurant",
    theme: "sand",
    location: "Asheville, NC",
    address: "62 Lexington Avenue, Asheville, NC 28801",
    phone: "+1 828 555 0173",
    email: "hello@embersupper.com",
    credential: "",
    stats: [["40", "seats"], ["1", "sitting a night"], ["Thu–Sun", "open"]],
    actions: [
      { kind: "booking", label: "Reserve", value: "https://resy.com/embersupper" },
      { kind: "call", label: "Call", value: "+18285550173" },
      { kind: "maps", label: "Find us", value: "62 Lexington Avenue, Asheville, NC 28801" },
      { kind: "instagram", label: "Instagram", value: "https://instagram.com/embersupper" },
    ],
    links: [
      { kind: "booking", label: "Book a table", sublabel: "Reservations open 30 days out", value: "https://resy.com/embersupper", highlight: true },
      { kind: "form", label: "Private hire & buyouts", sublabel: "Mondays and Tuesdays", value: "#enquire" },
      { kind: "file", label: "This week's menu", sublabel: "Updated every Wednesday", value: "https://example.com/ember-menu.pdf" },
      { kind: "payment", label: "Gift cards", sublabel: "Any amount, no expiry", value: "https://example.com/ember-gift" },
      { kind: "instagram", label: "Instagram", sublabel: "@embersupper", value: "https://instagram.com/embersupper" },
    ],
    items: [
      {
        title: "Hearth Bread & Cultured Butter",
        subtitle: "Baked to order in the coals",
        description: "Sourdough that goes straight from the peel into the ash. Butter churned Wednesdays, salted with flakes from the coast.",
        price: 12,
        status: "available",
        category: "To start",
        specs: [["Serves", "2"], ["Allergens", "Gluten, dairy"]],
        features: ["Vegetarian"],
        featured: true,
      },
      {
        title: "Charred Miso Eggplant",
        subtitle: "Sesame, scallion, ginger crisp",
        description: "Whole eggplant buried in embers until it collapses, then dressed in white miso and rice vinegar. The dish people come back for.",
        price: 18,
        status: "available",
        category: "Small plates",
        specs: [["Serves", "1–2"], ["Allergens", "Sesame, soy"]],
        features: ["Vegan", "Gluten free"],
        featured: true,
      },
      {
        title: "Dry-Aged Duck for Two",
        subtitle: "28 days · plum, turnip, bone sauce",
        description: "Aged four weeks in our own fridge, cooked crown-on over oak, carved at the pass. Comes with the legs done as a small confit pie.",
        price: 78,
        status: "available",
        category: "Large plates",
        specs: [["Serves", "2"], ["Age", "28 days"], ["Notice", "Order at booking"]],
        features: ["Serves two", "Pre-order recommended"],
      },
      {
        title: "Whole Grilled Trout",
        subtitle: "Mountain trout, brown butter, herbs",
        description: "From a farm forty minutes up the road. Split, salted, and grilled skin-down over hot coals until the fins go crisp.",
        price: 34,
        status: "available",
        category: "Large plates",
        specs: [["Serves", "1"], ["Allergens", "Fish, dairy"]],
        features: ["Gluten free", "Local sourcing"],
      },
      {
        title: "Burnt Honey Custard",
        subtitle: "Bee pollen, cream, sea salt",
        description: "Honey cooked past caramel until it's almost bitter, then set with cream and eggs. Finished with pollen from the same hives.",
        price: 14,
        status: "available",
        category: "Dessert",
        specs: [["Serves", "1"], ["Allergens", "Dairy, egg"]],
        features: ["Vegetarian"],
      },
      {
        title: "New Year's Eve Feast",
        subtitle: "Seven courses · 31 December",
        description: "One night, seven courses, wine pairing optional. Ninety seats across two rooms. Goes every year in under an hour.",
        price: 195,
        priceNote: "per person",
        status: "coming_soon",
        category: "Events",
        specs: [["Date", "31 Dec"], ["Courses", "7"], ["Seats", "90"]],
        features: ["Wine pairing available", "Two seatings"],
      },
    ],
    testimonials: [
      { author: "Marisol D.", role: "Regular since 2023", quote: "The eggplant. I've tried to make it at home nine times. It is not the same." },
      { author: "Hal Prentice", role: "Anniversary dinner", quote: "One sitting a night means nobody hovers. We were there three hours and never felt it." },
      { author: "Nina B.", role: "Booked a buyout", quote: "Ines cooked for thirty of my colleagues and half of them have gone back since." },
    ],
  },
  {
    slug: "studio-lune",
    business: "Studio Lune",
    owner: "Camille Roux",
    headline: "Colour specialist · Balayage & lived-in blonde",
    tagline: "Grown-out hair that still looks like a decision.",
    bio: "Fifteen years behind the chair, the last six specialising in colour that holds its shape for months, not weeks. I take eight clients a day, so every appointment has room in it.",
    type: "beauty",
    theme: "blush",
    location: "Austin, TX",
    address: "1204 South Congress Ave, Austin, TX 78704",
    phone: "+1 512 555 0119",
    email: "book@studiolune.co",
    credential: "TX Cosmetology #C-884201",
    stats: [["15", "years behind the chair"], ["8", "clients a day"], ["4.9★", "480 reviews"]],
    actions: [
      { kind: "booking", label: "Book", value: "https://booksy.com/studiolune" },
      { kind: "whatsapp", label: "WhatsApp", value: "+15125550119" },
      { kind: "instagram", label: "Portfolio", value: "https://instagram.com/studio.lune" },
      { kind: "maps", label: "Directions", value: "1204 South Congress Ave, Austin, TX 78704" },
    ],
    links: [
      { kind: "booking", label: "Book an appointment", sublabel: "Colour, cut and treatments", value: "https://booksy.com/studiolune", highlight: true },
      { kind: "form", label: "New client colour consult", sublabel: "Free · 15 minutes · video or in person", value: "#enquire" },
      { kind: "instagram", label: "Before & afters", sublabel: "@studio.lune", value: "https://instagram.com/studio.lune" },
      { kind: "tiktok", label: "Tutorials", sublabel: "Home care that actually works", value: "https://tiktok.com/@studio.lune" },
      { kind: "payment", label: "Buy a gift card", sublabel: "Delivered by email", value: "https://example.com/lune-gift" },
    ],
    items: [
      {
        title: "Balayage + Gloss",
        subtitle: "Full head, includes toner and blow-dry",
        description: "Hand-painted, no foils at the root, finished with a gloss to set the tone. Grows out soft — most clients come back at twelve to fourteen weeks rather than six.",
        price: 240,
        priceNote: "from",
        status: "available",
        category: "Colour",
        specs: [["Duration", "3–3.5 hrs"], ["Stylist", "Camille"], ["Patch test", "48hrs prior"], ["Rebook", "12–14 weeks"]],
        features: ["Includes toner", "Includes blow-dry", "Free 2-week check-in"],
        featured: true,
      },
      {
        title: "Lived-In Blonde Correction",
        subtitle: "For box dye, brass or banding",
        description: "The long appointment. We lift in stages, tone between, and treat throughout — usually two visits three weeks apart rather than frying it in one.",
        price: 420,
        priceNote: "from",
        status: "available",
        category: "Colour",
        specs: [["Duration", "5 hrs+"], ["Visits", "Usually 2"], ["Consult", "Required"], ["Includes", "Bond treatment"]],
        features: ["Consultation required", "Bond builder included", "Split across two visits"],
      },
      {
        title: "Dry Cut & Shape",
        subtitle: "Cut to how your hair actually falls",
        description: "Cut dry, in your natural texture, with your part where you actually wear it. Forty-five minutes and no wet-cut guesswork.",
        price: 110,
        status: "available",
        category: "Cutting",
        specs: [["Duration", "45 min"], ["Wash", "Optional"], ["Rebook", "8–10 weeks"]],
        features: ["Dry cutting", "Styling included"],
      },
      {
        title: "Bond Repair Treatment",
        subtitle: "In-salon, add to any service",
        description: "Two-step bond builder with a heat process. Worth it if you're lifting, and worth it if you're not.",
        price: 65,
        status: "available",
        category: "Treatments",
        specs: [["Duration", "30 min"], ["Add-on", "Any service"]],
        features: ["Add-on service"],
      },
      {
        title: "Bridal Trial + Day Of",
        subtitle: "Package · trial included",
        description: "One trial, one wedding day, travel within Austin included. I take four weddings a season so the day doesn't get rushed.",
        price: 650,
        status: "coming_soon",
        priceNote: "2026 season",
        category: "Bridal",
        specs: [["Includes", "Trial + day of"], ["Travel", "Austin included"], ["Season", "4 weddings"]],
        features: ["Trial included", "Travel included", "Limited availability"],
      },
    ],
    testimonials: [
      { author: "Devon A.", role: "Client since 2021", quote: "Four months since my last appointment and it still looks intentional. That's the whole point of going to Camille." },
      { author: "Priya S.", role: "Colour correction", quote: "Six years of box dye. She fixed it in two visits and never once made me feel stupid about it." },
      { author: "Nat Hollis", role: "Bridal", quote: "Trial, day-of, and she stayed an extra hour for my mum. Photos are perfect." },
    ],
  },
  {
    slug: "northshore-strength",
    business: "Northshore Strength",
    owner: "Dee Halvorsen",
    headline: "Barbell coaching · Online and in Duluth",
    tagline: "Get strong on purpose, not by accident.",
    bio: "I coach lifters from first squat to first meet. Twelve years of programming, mostly for people who work full-time and have about four hours a week to train. Everything is built around what you can actually do.",
    type: "fitness",
    theme: "forest",
    location: "Duluth, MN",
    address: "1810 W Superior St, Duluth, MN 55806",
    phone: "+1 218 555 0166",
    email: "dee@northshorestrength.com",
    credential: "USAW L2 · CSCS",
    stats: [["12", "years coaching"], ["400+", "lifters coached"], ["2", "ways to train"]],
    actions: [
      { kind: "booking", label: "Free consult", value: "https://cal.com/northshore/consult" },
      { kind: "email", label: "Email Dee", value: "dee@northshorestrength.com" },
      { kind: "form", label: "Apply", value: "#enquire" },
      { kind: "instagram", label: "Instagram", value: "https://instagram.com/northshorestrength" },
    ],
    links: [
      { kind: "form", label: "Apply for coaching", sublabel: "Two spots open this month", value: "#enquire", highlight: true },
      { kind: "booking", label: "Free 20-minute consult", sublabel: "No pitch, just a plan", value: "https://cal.com/northshore/consult" },
      { kind: "file", label: "Free novice program", sublabel: "12 weeks · PDF + video", value: "https://example.com/novice-program.pdf" },
      { kind: "youtube", label: "Technique library", sublabel: "Squat, bench, deadlift, press", value: "https://youtube.com/@northshorestrength" },
      { kind: "payment", label: "Buy a training block", sublabel: "8 or 16 weeks", value: "https://example.com/northshore-checkout" },
    ],
    items: [
      {
        title: "12-Week Strength Rebuild",
        subtitle: "3x per week · hybrid coaching",
        description: "For lifters coming back after a layoff, an injury or a long stretch of nothing. Three sessions a week, video review on every main lift, and weekly adjustments.",
        price: 480,
        status: "available",
        category: "Programs",
        specs: [["Length", "12 weeks"], ["Sessions/week", "3"], ["Level", "Returning"], ["Format", "Online"]],
        features: ["Video review", "Weekly check-in", "Programming adjustments"],
        featured: true,
      },
      {
        title: "First Meet Prep",
        subtitle: "16 weeks to the platform",
        description: "Peaking block, attempt selection, weigh-in strategy and someone in your corner on the day if the meet's within driving distance.",
        price: 720,
        status: "available",
        category: "Programs",
        specs: [["Length", "16 weeks"], ["Sessions/week", "4"], ["Level", "Intermediate"], ["Includes", "Meet-day handling"]],
        features: ["Attempt selection", "Meet-day handling", "Cut guidance"],
      },
      {
        title: "In-Person Technique Session",
        subtitle: "90 minutes, Duluth gym",
        description: "One session, filmed from three angles, with a written summary and drills afterwards. Most people book this once and fix six months of bad habits.",
        price: 150,
        status: "available",
        category: "One-off",
        location: "Duluth, MN",
        specs: [["Duration", "90 min"], ["Location", "Duluth"], ["Includes", "Video + notes"]],
        features: ["Filmed session", "Written summary", "Drill list"],
      },
      {
        title: "Winter Group Cohort",
        subtitle: "Cohort full · next intake March",
        description: "Twelve lifters, one shared program, weekly group call. Runs three times a year and fills from the waitlist.",
        price: 320,
        status: "sold",
        category: "Programs",
        specs: [["Length", "10 weeks"], ["Size", "12 lifters"], ["Next intake", "March"]],
        features: ["Group calls", "Shared programming", "Waitlist open"],
      },
    ],
    testimonials: [
      { author: "Marcus T.", role: "Coached 18 months", quote: "Added 90kg to my total working four hours a week with two kids. Dee built the program around my life, not the other way round." },
      { author: "Ellie R.", role: "First meet 2025", quote: "Went nine for nine at my first meet. She picked every attempt and every one of them was right." },
      { author: "Joaquin V.", role: "Post-injury return", quote: "Came back from a back injury terrified of deadlifting. Pulled a lifetime PR fourteen months later." },
    ],
  },
  {
    slug: "halden-partners",
    business: "Halden Partners",
    owner: "Ruth Halden",
    headline: "Fractional CFO · Seed to Series B",
    tagline: "Finance that survives a board meeting.",
    bio: "I run finance for six to eight venture-backed companies at a time — the month-end close, the board pack, the model, and the awkward conversation about runway. Fifteen years in the seat, four of them at a company that went from twelve people to two hundred.",
    type: "professional",
    theme: "mono",
    location: "Remote · London & NYC",
    address: "",
    phone: "+44 20 7946 0221",
    email: "ruth@haldenpartners.com",
    credential: "ACA · ICAEW",
    stats: [["15", "years in finance"], ["6–8", "clients at a time"], ["A", "seed to Series B"]],
    actions: [
      { kind: "booking", label: "Book an intro", value: "https://cal.com/ruthhalden/intro" },
      { kind: "email", label: "Email", value: "ruth@haldenpartners.com" },
      { kind: "linkedin", label: "LinkedIn", value: "https://linkedin.com/in/ruthhalden" },
      { kind: "form", label: "Enquire", value: "#enquire" },
    ],
    links: [
      { kind: "booking", label: "Book a 30-minute intro", sublabel: "Free · no deck required", value: "https://cal.com/ruthhalden/intro", highlight: true },
      { kind: "file", label: "Board pack template", sublabel: "The one I actually use", value: "https://example.com/board-pack.xlsx" },
      { kind: "file", label: "Runway model (Google Sheets)", sublabel: "Copy and fill in", value: "https://example.com/runway-model" },
      { kind: "linkedin", label: "LinkedIn", sublabel: "Notes on startup finance", value: "https://linkedin.com/in/ruthhalden" },
      { kind: "form", label: "Enquire about a retainer", sublabel: "Two slots from April", value: "#enquire" },
    ],
    items: [
      {
        title: "Fractional CFO Retainer",
        subtitle: "Monthly close, board pack, forecast",
        description: "Two days a month in your business. I own the close, the board pack and the model, and I sit in the board meeting to defend the numbers.",
        price: 3500,
        priceNote: "per month",
        status: "available",
        category: "Retainer",
        specs: [["Commitment", "2 days/month"], ["Term", "6 months min"], ["Includes", "Board attendance"], ["Best for", "Post-seed"]],
        features: ["Monthly close", "Board pack", "Rolling forecast", "Board attendance"],
        featured: true,
      },
      {
        title: "Fundraise Readiness Review",
        subtitle: "Two weeks · before you open the round",
        description: "I go through the model, the data room and the metrics the way a partner at a fund will, and give you the list of things they'll find before they find them.",
        price: 6000,
        status: "available",
        category: "Project",
        specs: [["Turnaround", "2 weeks"], ["Format", "Report + 2 calls"], ["Best for", "Pre-raise"]],
        features: ["Model review", "Data room audit", "Metrics benchmarking"],
      },
      {
        title: "Finance Function Build",
        subtitle: "Systems, process and your first hire",
        description: "Ledger, payroll, spend controls, close calendar, and the job spec for whoever takes it over. Eight to twelve weeks, then I hand it to your hire.",
        price: 14000,
        status: "available",
        category: "Project",
        specs: [["Length", "8–12 weeks"], ["Includes", "Systems + hiring"], ["Best for", "Series A"]],
        features: ["Systems selection", "Close calendar", "Hiring support", "Handover documentation"],
      },
      {
        title: "Board Meeting Coaching",
        subtitle: "For founders presenting numbers",
        description: "Three sessions before your next board meeting. We rehearse the hard questions until your answers are short.",
        price: 1800,
        status: "available",
        category: "Coaching",
        specs: [["Sessions", "3"], ["Length", "60 min each"], ["Best for", "First-time founders"]],
        features: ["Rehearsal", "Question bank", "Slide review"],
      },
    ],
    testimonials: [
      { author: "Ana Ferreira", role: "CEO, Series A SaaS", quote: "Our board pack went from an argument to a formality. That's worth more than the fee." },
      { author: "Tom Iwu", role: "Founder, marketplace", quote: "Ruth found three things in our model that our lead investor asked about a week later. Word for word." },
      { author: "Sasha Bell", role: "COO, fintech", quote: "She built the whole finance function and then handed it to the person she helped us hire. Clean exit, no dependency." },
    ],
  },
];

function seedEvents(site: Site, itemIds: string[], linkRows: { id: string; label: string }[], intensity: number) {
  const devices = ["iPhone", "Android", "Desktop", "iPad"];
  const deviceWeights = [0.54, 0.22, 0.19, 0.05];
  const referrers = ["Instagram", "Direct", "QR code", "Google", "WhatsApp", "LinkedIn", "NFC card"];
  const refWeights = [0.3, 0.24, 0.16, 0.12, 0.09, 0.05, 0.04];

  const pick = <T,>(arr: T[], weights: number[]): T => {
    const r = Math.random();
    let acc = 0;
    for (let i = 0; i < arr.length; i++) {
      acc += weights[i];
      if (r <= acc) return arr[i];
    }
    return arr[arr.length - 1];
  };

  const stmt = (kind: EventKind, targetId: string | null, label: string, at: Date, device: string, ref: string) =>
    run(
      `INSERT INTO events (id, site_id, kind, target_id, target_label, referrer, device, created_at) VALUES (?,?,?,?,?,?,?,?)`,
      id("evt"),
      site.id,
      kind,
      targetId,
      label,
      ref,
      device,
      at.toISOString(),
    );

  for (let day = 59; day >= 0; day--) {
    const date = new Date(Date.now() - day * 864e5);
    const dow = date.getDay();
    const weekend = dow === 0 || dow === 6 ? 0.65 : 1;
    // gentle upward trend so the analytics deltas read positive
    const trend = 0.7 + ((60 - day) / 60) * 0.7;
    const views = Math.max(0, Math.round(intensity * weekend * trend * (0.6 + Math.random() * 0.9)));

    for (let v = 0; v < views; v++) {
      const at = new Date(date);
      at.setHours(7 + Math.floor(Math.random() * 15), Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));
      const device = pick(devices, deviceWeights);
      const ref = pick(referrers, refWeights);
      stmt("view", null, "Page view", at, device, ref);

      if (Math.random() < 0.34 && linkRows.length) {
        const link = linkRows[Math.floor(Math.random() * linkRows.length)];
        stmt("link_click", link.id, link.label, new Date(at.getTime() + 20000), device, ref);
      }
      if (Math.random() < 0.28 && itemIds.length) {
        const idx = Math.floor(Math.random() ** 1.7 * itemIds.length);
        const item = SITES.find((s) => s.slug === site.slug)!.items[idx];
        stmt("item_view", itemIds[idx], item?.title ?? "Item", new Date(at.getTime() + 35000), device, ref);
      }
      if (Math.random() < 0.14) {
        stmt("action_click", null, "Quick action", new Date(at.getTime() + 12000), device, ref);
      }
      if (Math.random() < 0.06) {
        stmt("save_contact", null, "Save contact", new Date(at.getTime() + 50000), device, ref);
      }
      if (Math.random() < 0.035) {
        stmt("lead", null, "Enquiry", new Date(at.getTime() + 90000), device, ref);
      }
    }
  }
}

const LEAD_NAMES = [
  ["Alicia Moreau", "alicia.moreau@gmail.com", "+1 917 555 0110"],
  ["Ben Osei", "b.osei@outlook.com", "+1 646 555 0132"],
  ["Priyanka Raman", "priyanka.r@fastmail.com", "+1 415 555 0148"],
  ["Théo Lambert", "theo.lambert@proton.me", "+33 6 55 01 22 90"],
  ["Marguerite Cole", "mcole@workmail.com", "+1 503 555 0177"],
  ["Devon Ashby", "devon@ashbystudio.co", "+1 828 555 0104"],
  ["Yusuf Karim", "yusuf.karim@gmail.com", "+44 7700 900 812"],
  ["Sana Iqbal", "sana.iqbal@hey.com", "+1 512 555 0190"],
  ["Grant Whitmore", "grant.w@icloud.com", "+1 218 555 0121"],
  ["Noemi Castellanos", "noemi.c@gmail.com", "+1 845 555 0166"],
  ["Felix Andersen", "felix@andersen.dk", "+45 20 55 01 44"],
  ["Rhiannon Pryce", "r.pryce@gmail.com", "+44 7911 123 456"],
];

const LEAD_MESSAGES = [
  "Saw the listing on Instagram — is it still available? I could come Saturday morning.",
  "Hi, what's the earliest appointment you have? Flexible on the day.",
  "Could you send more detail on pricing and what's included? Thanks.",
  "Found you through a friend. Do you have anything coming up that isn't listed yet?",
  "Interested in the featured one. Can I get a call this week?",
  "Quick question about availability for a group of six.",
  "Do you take on remote clients? I'm outside the area.",
  "What's the process and how far ahead do you book?",
  "Sent this to my partner and we'd both like to see it. Sunday work?",
  "Been following for a while, finally ready to talk. Best number to reach you?",
];

const LEAD_STATUSES = ["new", "new", "new", "contacted", "contacted", "qualified", "won", "lost"];

export function isSeeded(): boolean {
  const row = get<{ c: number }>("SELECT COUNT(*) AS c FROM users");
  return (row?.c ?? 0) > 0;
}

export function seed(): { email: string; password: string } {
  const password = "demo1234";

  const teamId = id("team");
  run(
    "INSERT INTO teams (id, name, owner_id, plan, seats, created_at) VALUES (?,?,?,?,?,?)",
    teamId,
    "Vance & Co. Realty",
    "",
    "team",
    4,
    now(),
  );

  SITES.forEach((s, index) => {
    const isDemo = index === 0;
    const user = createUser({
      email: isDemo ? "demo@frontdesk.app" : `${s.slug.split("-")[0]}@${s.slug.replace(/-/g, "")}.com`,
      name: s.owner,
      password,
      plan: isDemo ? "team" : "individual",
      teamId: isDemo ? teamId : null,
      role: "owner",
    });
    run("UPDATE users SET onboarded = 1, avatar_url = ?, credits = ? WHERE id = ?", face(s.slug, s.owner), isDemo ? 180 : 40, user.id);
    if (isDemo) run("UPDATE teams SET owner_id = ? WHERE id = ?", user.id, teamId);

    const theme = themeById(s.theme);
    const site = createSite(user.id, {
      slug: s.slug,
      business_name: s.business,
      owner_name: s.owner,
      headline: s.headline,
      tagline: s.tagline,
      bio: s.bio,
      business_type: s.type,
      avatar_url: face(s.slug, s.owner),
      cover_url: img(`${s.slug}-cover`, 1600, 900),
      location: s.location,
      address: s.address,
      phone: s.phone,
      email: s.email,
      whatsapp: s.phone.replace(/[^\d]/g, ""),
      website: `https://${s.slug.replace(/-/g, "")}.com`,
      credential: s.credential,
      verified: 1,
      published: 1,
      theme: { ...theme },
      layout: DEFAULT_SECTIONS.map((d) =>
        d.id === "map" && !s.address ? { ...d, enabled: false } : { ...d },
      ),
      hours: DEFAULT_HOURS,
      gallery: [1, 2, 3, 4, 5, 6].map((n) => img(`${s.slug}-g${n}`, 900, 900)),
      stats: s.stats.map(([value, label]) => ({ value, label })),
      seo: {
        title: `${s.owner} — ${s.business}`,
        description: s.tagline,
      },
    });

    s.actions.forEach((a, i) =>
      createLink(site.id, {
        kind: a.kind as never,
        label: a.label,
        value: a.value,
        is_action: 1,
        position: i,
        active: 1,
      }),
    );

    const linkRows = s.links.map((l, i) =>
      createLink(site.id, {
        kind: l.kind as never,
        label: l.label,
        sublabel: l.sublabel,
        value: l.value,
        highlight: l.highlight ? 1 : 0,
        position: i,
        active: 1,
      }),
    );

    const itemIds = s.items.map((it, i) =>
      createItem(site.id, {
        title: it.title,
        subtitle: it.subtitle,
        description: it.description,
        price: it.price,
        price_note: it.priceNote ?? "",
        status: (it.status ?? "available") as never,
        category: it.category,
        location: it.location ?? s.location,
        images: [1, 2, 3, 4].map((n) => img(`${s.slug}-${i}-${n}`, 1200, 800)),
        specs: it.specs.map(([label, value]) => ({ label, value })),
        features: it.features,
        featured: it.featured ? 1 : 0,
        position: i,
        active: 1,
      }).id,
    );

    s.testimonials.forEach((t, i) =>
      createTestimonial(site.id, {
        author: t.author,
        role: t.role,
        quote: t.quote,
        rating: 5,
        avatar_url: face(`${s.slug}-t${i}`, t.author),
        position: i,
      }),
    );

    seedEvents(site, itemIds, linkRows.map((l) => ({ id: l.id, label: l.label })), isDemo ? 26 : 11);

    const leadCount = isDemo ? 14 : 6;
    for (let i = 0; i < leadCount; i++) {
      const person = LEAD_NAMES[(index * 3 + i) % LEAD_NAMES.length];
      const daysAgo = Math.floor(Math.random() * 45);
      const created = new Date(Date.now() - daysAgo * 864e5 - Math.random() * 8.64e7);
      run(
        `INSERT INTO leads (id, site_id, item_id, name, email, phone, message, source, status, notes, created_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        id("lead"),
        site.id,
        Math.random() < 0.6 ? itemIds[Math.floor(Math.random() * itemIds.length)] : null,
        person[0],
        person[1],
        person[2],
        LEAD_MESSAGES[(index * 2 + i) % LEAD_MESSAGES.length],
        ["Page form", "Listing enquiry", "QR code", "Instagram"][i % 4],
        daysAgo < 3 ? "new" : LEAD_STATUSES[i % LEAD_STATUSES.length],
        "",
        created.toISOString(),
      );
    }
  });

  // A second seat on the demo team, so the Team screen has something to show.
  const teammate = createUser({
    email: "jonah@vanceco.com",
    name: "Jonah Pike",
    password,
    plan: "team",
    teamId,
    role: "member",
  });
  run("UPDATE users SET onboarded = 1, avatar_url = ? WHERE id = ?", face("jonah-pike", "Jonah Pike"), teammate.id);
  const mateSite = createSite(teammate.id, {
    slug: "jonah-pike",
    business_name: "Vance & Co. Realty",
    owner_name: "Jonah Pike",
    headline: "Salesperson · Hudson Valley",
    tagline: "First-time buyers a speciality.",
    bio: "I work with people buying their first place, which mostly means answering the questions nobody wants to ask out loud.",
    business_type: "real_estate",
    avatar_url: face("jonah-pike", "Jonah Pike"),
    cover_url: img("jonah-cover", 1600, 900),
    location: "Beacon, NY",
    address: "18 Main Street, Beacon, NY 12508",
    phone: "+1 845 555 0143",
    email: "jonah@vanceco.com",
    credential: "NY Lic. #10401299871",
    verified: 1,
    theme: { ...themeById("bone") },
  });
  createLink(mateSite.id, { kind: "call", label: "Call", value: "+18455550143", is_action: 1, position: 0 });
  createLink(mateSite.id, { kind: "email", label: "Email", value: "jonah@vanceco.com", is_action: 1, position: 1 });
  createLink(mateSite.id, {
    kind: "form",
    label: "First-time buyer checklist",
    sublabel: "What to do, in order",
    value: "#enquire",
    highlight: 1,
    position: 0,
  });
  createItem(mateSite.id, {
    title: "19 Tioronda Avenue",
    subtitle: "Starter home, walk to town",
    description: "Two bedrooms, a real yard, and a roof that was done in 2022. The kind of first house that doesn't need anything on day one.",
    price: 389000,
    category: "Single family",
    location: "Beacon, NY",
    images: [1, 2, 3].map((n) => img(`jonah-1-${n}`, 1200, 800)),
    specs: [
      { label: "Beds", value: "2" },
      { label: "Baths", value: "1" },
      { label: "Sq ft", value: "1,120" },
      { label: "Built", value: "1948" },
    ],
    features: ["New roof 2022", "Walk to town", "Fenced yard"],
    featured: 1,
  });
  seedEvents(mateSite, [], [], 6);

  return { email: "demo@frontdesk.app", password };
}

export function resetAndSeed() {
  for (const table of ["events", "leads", "testimonials", "items", "links", "media", "sessions", "sites", "users", "teams"]) {
    run(`DELETE FROM ${table}`);
  }
  return seed();
}

