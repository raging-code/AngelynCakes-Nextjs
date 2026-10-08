// Single source of truth for SEO data (used by app/layout.js JSON-LD and components/Occasions.js).
// >>> Check every value here is correct for the business. <<<

export const SITE = 'https://www.angelynscake.com';

export const BUSINESS = {
  name: "Angelyn's Cakes",
  alternateNames: [
    "Angelyn's Cakes",
    "Angelyn's Cake",
    'Angelyns Cakes',
    'Angelyns Cake',
    'Angelyn Cakes',
    'Angelyn Cake',
    'AngelynCakes',
    'angelynscake.com',
    'www.angelynscake.com',
  ],
  email: 'contact.angelynscakes@gmail.com',
  phones: ['+63 2 8524 4452', '+63 917 815 2578'],
  street: '60 Russel Ave, Brgy. San Rafael',
  city: 'Pasay City',
  region: 'Metro Manila',
  country: 'PH',
  mapUrl: 'https://maps.app.goo.gl/dpGJnVEoqirTxCUv8',
  instagram: 'https://www.instagram.com/angelynscakes',
  facebook: 'https://www.facebook.com/angelynscakes',
  image: SITE + '/images/hero-poster-desktop.jpg',
  logo: SITE + '/images/icon.png',
};

export const OCCASIONS = [
  {
    title: 'Wedding Cakes',
    text: 'Elegant custom wedding cakes designed around your theme, colors and guest count, from intimate celebrations to grand ballroom receptions.',
  },
  {
    title: 'Birthday Cakes',
    text: 'Custom birthday cakes for kids and adults, from themed designs to giant showpiece cakes made to order.',
  },
  {
    title: 'Debut (18th Birthday) Cakes',
    text: 'Statement cakes for a once-in-a-lifetime 18th birthday, personalized to the celebrant and the party theme.',
  },
  {
    title: 'Christening & Baptism Cakes',
    text: 'Delicate, tasteful christening and baptism cakes for your little one\u2019s special day.',
  },
  {
    title: 'Anniversary Cakes',
    text: 'Custom anniversary cakes for milestone years, with designs that reflect your story.',
  },
  {
    title: 'Corporate & Hotel Event Cakes',
    text: 'Branded and bespoke cakes for corporate events, product launches and 5-star hotel functions.',
  },
  {
    title: 'Graduation Cakes',
    text: 'Celebrate the achievement with a custom graduation cake made for your school colors and theme.',
  },
  {
    title: 'Private Party Cakes',
    text: 'Bridal showers, gender reveals, family gatherings and more: tell us the occasion and we will design the cake.',
  },
];

export const METRO_CITIES = [
  'Pasay City', 'Makati', 'Manila', 'Quezon City', 'Taguig', 'Mandaluyong', 'San Juan', 'Pasig',
  'Parañaque', 'Las Piñas', 'Muntinlupa', 'Caloocan', 'Malabon', 'Navotas', 'Valenzuela', 'Marikina', 'Pateros',
];

export const FAQ = [
  {
    q: 'Where can I order custom cakes in Manila?',
    a: "Angelyn's Cakes is a custom cake shop at 60 Russel Ave, Brgy. San Rafael, Pasay City, Metro Manila. Our showroom is open daily from 7:30 AM to 6:00 PM, by appointment only.",
  },
  {
    q: 'Do you make wedding cakes?',
    a: 'Yes. We create custom wedding cakes designed around your theme, colors and number of guests. Book a private consultation at our Pasay showroom to plan yours.',
  },
  {
    q: 'Do you make birthday cakes and debut cakes?',
    a: 'Yes. We make custom birthday cakes for kids and adults, debut (18th birthday) cakes, and giant celebration cakes. We also make christening, baptism, anniversary, graduation and corporate event cakes.',
  },
  {
    q: 'How do I order a custom cake?',
    a: 'Call (02) 8524 4452 or 0917 815 2578, message us on Viber, Instagram (@angelynscakes) or Facebook, or email contact.angelynscakes@gmail.com. Tell us your date, number of guests and theme, and we will set up a consultation.',
  },
  {
    q: 'Do you deliver cakes in Metro Manila?',
    a: 'Send us your celebration date and venue by phone, Viber or email and we will confirm delivery arrangements for your location.',
  },
  {
    q: 'Can I visit the showroom without an appointment?',
    a: 'Our showroom is by appointment only so we can prepare for your visit. Please contact us ahead to schedule a time.',
  },
  {
    q: 'Which areas in Metro Manila do you serve?',
    a: 'We make custom cakes for celebrations across Metro Manila, including ' + METRO_CITIES.join(', ') + '. Send us your celebration date and venue by phone, Viber or email and we will confirm delivery arrangements for your location.',
  },
  {
    q: "Is Angelyn's Cakes the same as Angelyns Cakes, Angelyn Cakes or Angelyn Cake?",
    a: "Yes. Angelyn's Cakes is also searched as Angelyns Cakes, Angelyns Cake, Angelyn Cakes, Angelyn Cake and angelyncakes. It is one custom cake shop in Pasay City, Metro Manila, at www.angelynscake.com.",
  },
];

const hours = {
  '@type': 'OpeningHoursSpecification',
  dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  opens: '07:30',
  closes: '18:00',
};

export const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': SITE + '/#website',
      url: SITE + '/',
      name: BUSINESS.name,
      inLanguage: 'en-PH',
      publisher: { '@id': SITE + '/#business' },
    },
    {
      '@type': 'Bakery',
      '@id': SITE + '/#business',
      name: BUSINESS.name,
      alternateName: BUSINESS.alternateNames,
      url: SITE + '/',
      description:
        "Angelyn's Cakes creates bespoke custom cakes in Manila for weddings, birthdays, debuts, christenings, anniversaries, graduations and corporate events. Showroom in Pasay City, by appointment.",
      image: BUSINESS.image,
      logo: BUSINESS.logo,
      email: BUSINESS.email,
      telephone: BUSINESS.phones[0],
      contactPoint: BUSINESS.phones.map((t) => ({
        '@type': 'ContactPoint',
        telephone: t,
        contactType: 'customer service',
        areaServed: 'PH',
        availableLanguage: ['English', 'Filipino'],
      })),
      address: {
        '@type': 'PostalAddress',
        streetAddress: BUSINESS.street,
        addressLocality: BUSINESS.city,
        addressRegion: BUSINESS.region,
        addressCountry: BUSINESS.country,
      },
      hasMap: BUSINESS.mapUrl,
      openingHoursSpecification: [hours],
      areaServed: [
        { '@type': 'AdministrativeArea', name: 'Metro Manila' },
        ...METRO_CITIES.map((c) => ({ '@type': 'City', name: c })),
      ],
      knowsAbout: OCCASIONS.map((o) => o.title),
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Custom cakes',
        itemListElement: OCCASIONS.map((o) => ({
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: o.title,
            description: o.text,
            serviceType: o.title,
            provider: { '@id': SITE + '/#business' },
            areaServed: { '@type': 'AdministrativeArea', name: 'Metro Manila' },
          },
        })),
      },
      sameAs: [BUSINESS.instagram, BUSINESS.facebook],
    },
  ],
};

// Structured data for the /faq page only (matches the visible FAQ on that page).
export const FAQ_JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'FAQPage',
      '@id': SITE + '/faq#faq',
      url: SITE + '/faq',
      isPartOf: { '@id': SITE + '/#website' },
      about: { '@id': SITE + '/#business' },
      mainEntity: FAQ.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: "Angelyn's Cakes", item: SITE + '/' },
        { '@type': 'ListItem', position: 2, name: 'Occasions & FAQ', item: SITE + '/faq' },
      ],
    },
  ],
};
