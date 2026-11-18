const nammaGuide = 'https://namma.coffee/blog/from-bean-to-brew-the-art-of-making-the-perfect-south-indian-filter-coffee';
const hoysalaGuide = 'https://hoysalacoffeeandspices.com/blogs/journal/coffee-processing-methods';
const cuppingGuide = 'https://somethingsbrewing.in/blogs/brewing-tips/coffee-tasting-101-a-beginner-friendly-guide-to-coffee-tasting-cupping';

export default [
  {
    slug: 'arabica-robusta-south-indian-filter-coffee',
    title: 'Arabica or Robusta for South Indian filter coffee?',
    description: 'Read the two ratios on a filter coffee packet, then use your usual tumbler of milk coffee to choose between beans.',
    category: 'Buying coffee · South Indian filter',
    date: '2026-11-18',
    photo: 'species',
    sections: [
      ['What does 80:20 mean on this packet?',
        'Take Namma Coffee’s Classic Blend. The front says 80% coffee and 20% chicory. Turn to the description and you’ll find that the coffee portion contains Arabica and Robusta. If you bought 100 g of that blend, 20 g would be chicory. You still wouldn’t know how many of the other 80 g were Robusta.',
        'That distinction helps at a coffee shop that grinds to order. If someone offers “seventy-thirty”, ask them to name both ingredients. A mix of 70 g Arabica and 30 g Robusta is entirely coffee. A mix of 70 g coffee and 30 g chicory puts a different ingredient in your filter. Say which one you drink at home before anyone weighs out the beans.'],
      ['Choose for the milk you actually use',
        'Arabica and Robusta name two coffee species. You’ll also see Canephora on Indian specialty bags. That’s the species name for Robusta. Indian filter blends often use Robusta for weight in the cup and Arabica for aroma. The roast and the amount of milk you pour can change which quality you notice first.',
        'If you like a pronounced coffee taste in a milky tumbler, try a small pack of a blend that names its Robusta component. If you drink yours with just a dash of milk and often wish you could smell more of the coffee, try an Arabica alongside it. Ask the roaster for a similar roast and the same South Indian filter grind for both.'],
      ['An estate name still leaves a question',
        'Garigekhan Estate in Karnataka grows both Arabica and Robusta. Knowing the farm narrows down the origin, while the species on the bag tells you which of its crops you’re buying. In Wayanad, Kelachandra lists Robusta as the primary commercial crop at Brahmagiri Estate. It’s a useful name to look up if you’d like to try a Robusta on its own.'],
      ['Compare at breakfast',
        'Brew the first pack the way you usually do. Note the amount of ground coffee, water, decoction and milk. Repeat with the second pack the next morning, including your usual sugar if you take it. A question as simple as “Which cup still tastes of coffee after the milk goes in?” is enough to decide which packet to buy again.']
    ],
    sources: [
      ['Namma Coffee · How to choose filter coffee powder', nammaGuide],
      ['Namma Coffee · Classic Blend ingredient proportions', 'https://namma.coffee/products/classic-blend'],
      ['Plant Varieties Authority of India · Arabica and Canephora', 'https://plantauthority.gov.in/sites/default/files/dusguidelinescoffee-finale.pdf'],
      ['Kelachandra Coffee · Crops at Garigekhan Estate', 'https://kelachandracoffee.com/garigekhan/'],
      ['Kelachandra Coffee · Crops at Brahmagiri Estate', 'https://kelachandracoffee.com/brahmagiri/']
    ],
    atlas: [['Garigekhan Estate', '/places/garigekhan-estate/'], ['Brahmagiri Estate', '/places/kelachandra-coffee-brahmagiri-estate/'], ['Browse the coffee catalogue', '/coffee/']],
    intent: {
      query: 'arabica vs robusta for South Indian filter coffee with milk',
      reference: nammaGuide,
      signal: 'An IndiaCoffee reader choosing a milk coffee asked for the undisclosed Arabica-to-Robusta split in a particular Devan’s blend. This demonstrates the buying question, not the actual blend ratio.',
      signalUrl: 'https://www.reddit.com/r/IndiaCoffee/comments/1xayi8a/robusta_arabica_percentage_in_devans_premium_blend/',
      angle: 'Work through a real 80:20 ingredient label, illustrate the species question with two estate profiles, then compare the coffees in the reader’s regular tumbler.'
    }
  },
  {
    slug: 'washed-natural-honey-indian-coffee',
    title: 'Washed, natural or honey: which Indian coffee should you buy?',
    description: 'Three ways of drying a coffee seed, two pairs of Karnataka lots and a practical way to choose the next bag.',
    category: 'Buying coffee · Processing',
    date: '2026-11-18',
    photo: 'process',
    sections: [
      ['Follow the fruit to the drying bed',
        'The bean in your grinder was once a seed inside a coffee cherry. Washed, honey and natural tell you how much of that fruit was still around the seed when drying began. On a washed lot, the producer removes the skin and flesh and clears away the sticky layer around the seed before drying. On a natural, the cherry dries whole. The dried fruit is removed afterwards.',
        'Honey sits between those two methods. The skin comes off, but some sticky fruit material, called mucilage, stays on as the seed dries. The name refers to that process. Nobody needs to add honey. If the same bag has “honey” among its tasting notes, that second mention describes something the taster noticed in the cup.'],
      ['Two pairs you can use to read a lot list',
        'Hoysala Coffee & Spices in Karnataka names four lots that make the distinction easy to see. Athi is washed Arabica and Nerle is natural Arabica. Basri is washed Robusta and Halsu is natural Robusta. Pair Athi with Nerle to compare processing within one species. Pair Nerle with Halsu and you’ve kept the natural process but changed the species.',
        'Honey processing also works with either species. South India Coffee Company’s 2025–26 listings include honey lots from Gungegiri Estate in Chikkamagaluru identified separately as Arabica and Canephora. When a café lists only “Gungegiri honey” on the board, the barista may be able to tell you which one is in the grinder.'],
      ['Pick the first bag by what you want to taste',
        'If you want to pick out a distinct citrus or floral note, a washed coffee whose roaster describes it that way is a useful starting point. If you’ve enjoyed a coffee that reminded you of dried fruit, look at the roaster’s notes on the naturals. A honey lot is worth considering when its description appeals to you. Colour names such as red or black honey can vary by producer, so they make poor sweetness scores.'],
      ['Make the second bag a useful comparison',
        'Ask for two small packs from one producer, with similar roasts and different processes. Brew both using your normal recipe and compare them at about the same temperature. Write one observation for each before reading the roaster’s notes. If the only pair available comes from different farms or very different roasts, enjoy the comparison and keep both names on your note. The process is only one possible reason you preferred one cup.']
    ],
    sources: [
      ['Hoysala Coffee & Spices · Washed, natural and honey processing in India', hoysalaGuide],
      ['South India Coffee Company · Honey lots by estate and species', 'https://southindia.coffee/process/honey/']
    ],
    atlas: [['Compare coffees in the catalogue', '/coffee/'], ['Chikkamagaluru district', '/states/karnataka/districts/chikkamagaluru/'], ['Read about two Karnataka origin names', '/journal/chikmagalur-and-bababudangiris/']],
    intent: {
      query: 'washed vs natural vs honey processed coffee which to buy India',
      reference: hoysalaGuide,
      signal: 'A buyer comparing MokkaFarms options in IndiaCoffee asked what the processing choices meant and whether washed coffee was better or more consistent.',
      signalUrl: 'https://www.reddit.com/r/IndiaCoffee/comments/1r7bjsf/what_are_these_options_in_mokkafarms_coffee/',
      angle: 'Use named Indian grower lots to make two controlled comparisons, and explain the same word appearing as both a process and a tasting note.'
    }
  },
  {
    slug: 'first-coffee-cupping-india',
    title: 'Your first coffee cupping in India: what happens at the table?',
    description: 'How to find a public tasting, what to do with the spoon and which details to take home when you find a coffee you like.',
    category: 'Coffee community · Public tastings',
    date: '2026-11-18',
    photo: 'cupping',
    sections: [
      ['Choose a session you can join',
        'At a cupping, several coffees are brewed in a comparable way so the people around the table can taste differences between them. For a first visit, look for an organiser describing a public tasting, a guided cupping or a beginner workshop. Some cuppings are working sessions for producers and buyers. For example, a Fairtrade programme with the Coffee Board brought together 63 producer members from Kerala and Karnataka. A report from that table makes interesting reading, but it isn’t an invitation to the next one.',
        'Start with the events calendar and filter by state. Open the organiser’s own listing and check the date, the café branch, whether there is a ticket, and whether booking is still open. If a poster just says “cupping”, a perfectly good message is “I brew at home and haven’t been to a tasting before. Is this session open to beginners?”'],
      ['Let the host show you the spoons',
        'At a bowl cupping, you’ll often smell the dry grounds first. Hot water goes in and a layer of grounds gathers at the surface. Watch the person leading the session break that crust and skim the grounds away. The smell changes as the crust opens. This is one reason to arrive before the pouring starts, even if the tasting itself sounds like the part you came for.',
        'Before your first sip, check how the host wants you to transfer coffee to your individual cup or spoon. Keep anything that has touched your mouth out of the shared bowl. When the coffee is comfortable to taste, start with a little. You can come back to the same cup as it cools.'],
      ['Taste two bowls before you name a flavour',
        'Imagine the cups are labelled A and B. Taste A, then B. Which feels heavier on your tongue? Which leaves a taste for longer after you swallow or spit? Go back to A before answering. A note like “B feels thinner but the sweetness stays longer” will help you remember the difference even if you never find a fruit to name.',
        'At the reveal, take down the name of the coffee beside the bowl letter. An estate, a process and a roaster together are more useful on your next shopping trip than a photo of six unlabelled bowls. If you want to brew the coffee with milk at home, ask the roaster which lot they’d suggest for that. A cupping gives you a place to start that conversation.']
    ],
    sources: [
      ['Something’s Brewing · A beginner-friendly guide to coffee tasting and cupping', cuppingGuide],
      ['Something’s Brewing · Learning and workshop listings', 'https://somethingsbrewing.in/pages/learn-page'],
      ['Fairtrade NAPP · Coffee Board session for 63 producer members', 'https://www.fairtrade.net/napp-en/get-involved/news/Coffee_Cupping_Session_Empowering_63_Producer_members_in_India_to_enhance_quality_and_flavour_profiling_An_initiative_under_Fairtrade_Coffee_Development_Plan.html']
    ],
    atlas: [['Check the events calendar', '/events/'], ['Find a local coffee community', '/community/'], ['Read the Kerala Origins event archive', '/journal/kerala-origins-two-tables/']],
    intent: {
      query: 'first coffee cupping session India beginners what happens at a coffee tasting',
      reference: cuppingGuide,
      signal: 'An IndiaCoffee participant described a beginners’ cupping with Genetics Coffee Roasters at Something’s Brewing in Indiranagar. It supplies first-person local interest, not a current event date.',
      signalUrl: 'https://www.reddit.com/r/IndiaCoffee/comments/1ofuylm/',
      angle: 'Help a first-time guest distinguish an open event from a professional report, follow a shared table and carry the identity of a favourite lot home.'
    }
  }
];
