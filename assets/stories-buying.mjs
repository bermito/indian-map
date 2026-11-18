const roastGuide = 'https://sundarcoffee.com/light-medium-dark-roast-guide/';
const tastingGuide = 'https://coffeeculture.co.in/blogs/news/coffee-tasting-guide-how-to-identify-flavors-like-a-professional';
const storageGuide = 'https://levista.in/blogs/news/how-to-store-coffee-useful-tips';
const selection = 'https://www.arakucoffee.in/products/selection';

export default [
  {
    slug: 'choosing-coffee-for-milk-or-black',
    photo: 'roasts',
    date: '2026-11-18',
    title: 'Which coffee roast should I buy for milk or black coffee?',
    category: 'Buying coffee · Roast',
    description: 'A splash of milk in a moka pot brew and a tumbler filled mostly with milk ask different things of a coffee. Here is how to choose the first bag.',
    plate: ['Buying coffee', 'Milk or black?', 'Roast guide'],
    sections: [
      ['How much milk goes into your cup?', 'If most of your tumbler is hot milk, start with a medium-dark roast that the roaster recommends for milk drinks. Look for descriptions such as cocoa, caramel or roasted nuts if those are tastes you enjoy. A dark roast is another good candidate if you like a distinctly bitter finish. If all you add is a spoonful of milk, you have much more room to choose on taste alone.',
        'Think about the coffee underneath the milk, too. A small serving of steel-filter decoction can carry more flavour into a tumbler than the same volume of a pour-over brewed to drink straight. When the coffee tasted good before you added milk but seems to disappear afterwards, pour a little less milk into the next cup before ordering a darker bag.'],
      ['For black coffee, choose the finish you like', 'Someone who drinks coffee black can enjoy a dark roast. What matters is what you want to taste after you swallow. If you enjoy the edge of dark chocolate, look for a cocoa-led coffee at medium or darker roast. If you want something closer to the brightness of biting into an orange, try a lighter roast with a citrus note. These are useful starting points. The roaster’s description of that particular coffee is more informative than a colour alone.',
        'ARAKU Selection makes a good label to practise on. ARAKU describes it as medium-dark, suggests brewing it in a moka pot or as espresso, and recommends it black or with a splash of milk. That last detail tells you how the roaster imagines the cup. It also gives you a more precise question to ask if your usual drink contains considerably more milk.'],
      ['One bag for two people', 'Buy the smaller pack for the first comparison. Brew one batch the usual way and divide it between two cups before adding anything. Keep one black. Add your normal measure of milk to the other. Taste both and write down which you would want again. “Good black, disappears in my big mug” is a much better note for your next order than just “medium roast”.',
        'If you are buying at a café, mention the brewer you own and how you take the drink. “I use a steel filter, add hot milk and like a little bitterness” gives the person behind the counter enough detail to suggest a bag and grind.']
    ],
    sources: [['Sundar Coffee · Choosing between three roast levels', roastGuide], ['ARAKU · Selection, roast and serving suggestions', selection]],
    atlas: [['Browse medium-dark roasts', '/coffee/?roast=Medium-dark'], ['Browse light roasts', '/coffee/?roast=Light'], ['ARAKU Coffee’s atlas profile', '/places/araku-coffee-ind-c83212429718/']],
    intent: {
      query: 'which coffee roast is good with milk or black coffee India',
      reference: roastGuide,
      signal: 'An r/IndiaCoffee reader asks which coffee goes well with milk.',
      signalUrl: 'https://www.reddit.com/r/IndiaCoffee/comments/1sn9i4d/any_recommendation_for_coffee_that_goes_well_with/',
      angle: 'Use milk quantity and the strength of the brewed base to choose a bag, then compare one brew in two cups.'
    }
  },
  {
    slug: 'coffee-tasting-notes-or-added-flavour',
    photo: 'tasting',
    date: '2026-11-18',
    title: 'When a coffee bag says “chocolate”, has anything been added?',
    category: 'Reading the bag · Tasting notes',
    description: 'Learn to tell a tasting note from an added flavour, and find a few words for what you taste even when they differ from the packet.',
    plate: ['Reading the bag', 'Notes or ingredients?', 'Tasting guide'],
    sections: [
      ['Where the word appears matters', 'If “chocolate” sits under tasting notes on a bag of plain roasted coffee, the roaster is describing the cup. Something about its aroma, bitterness or finish reminded the taster of chocolate. Reading that line alone tells you little about what went into the bag. For that, turn it over and read the product description and ingredients.',
        'Consider two Indian labels. Sleepy Owl describes its Original ground coffee as having chocolatey notes from the coffee itself. Its ground coffee collection describes the French Vanilla version as coffee blended with vanilla flavour. The words “chocolate” and “vanilla” sound equally plausible on a café menu, yet the two labels give you different information. If the online shop shows only the front of the pack, ask for a photograph of the back.'],
      ['Taste once with the label turned away', 'Make your usual cup and take a sip when it is comfortably warm. See whether a word comes to mind before you read the notes. Does the smell remind you of the inside of a cocoa tin? Does a bright taste linger at the sides of your tongue? A broad word like “fruity” is plenty. On a second sip, decide whether you can say anything more useful about it.',
        'The Specialty Coffee Association’s flavour wheel works outwards from broad groups to more specific terms. You can stop at a broad group. If the roaster writes “orange” and you think of mosambi, keep your word. You both noticed something citrus-like, and mosambi might help you remember the coffee the next time you order.'],
      ['Ask a more useful question', 'At a café, try asking, “What about this coffee made you write chocolate?” The barista might point to the smell of the grounds or the finish after a sip. That gives you a particular moment to pay attention to. If the packet carries a term such as “infused” or “co-fermented”, ask the roaster what went into that lot and at which stage. The producer’s process description answers a different question from the taster’s notes.',
        'For shopping, keep a short list in your own language. A preference like “I liked the cocoa finish and the soft acidity” will still make sense when a shop sells out of that estate. Use that when browsing another roaster’s coffees, even if the two bags share none of the same three words.']
    ],
    sources: [
      ['Coffee Culture India · Coffee tasting and natural flavour descriptions', tastingGuide],
      ['Specialty Coffee Association · Using the Coffee Taster’s Flavor Wheel', 'https://sca.coffee/sca-news/how-to-use-the-flavor-wheel-in-eight-steps-ab2hy'],
      ['Sleepy Owl · Original ground coffee', 'https://sleepyowl.co/products/ground-coffee-original'],
      ['Sleepy Owl · Ground coffee collection and French Vanilla description', 'https://sleepyowl.co/collections/ground-coffee']
    ],
    atlas: [['Look for a chocolate tasting note', '/coffee/?q=chocolate'], ['Sleepy Owl Coffee’s atlas profile', '/places/sleepy-owl-coffee-ind-38d635b3448f/'], ['Coffee education and tasting resources', '/learn/']],
    intent: {
      query: 'coffee tasting notes are flavours added India chocolate coffee beans',
      reference: tastingGuide,
      signal: 'An r/IndiaCoffee reader explicitly asks where honey and chocolate notes in specialty coffee come from.',
      signalUrl: 'https://www.reddit.com/r/IndiaCoffee/comments/1jbrdr2/noob_question_those_notes_on_speciality_coffee/',
      angle: 'Read a plain and a flavoured coffee from the same Indian brand, then practise describing an unmarked cup.'
    }
  },
  {
    slug: 'storing-coffee-beans-and-ground-coffee-in-india',
    photo: 'storage',
    date: '2026-11-18',
    title: 'How should I store coffee beans and grounds after opening?',
    category: 'At home · Coffee storage',
    description: 'Choose a cupboard and container for the coffee you use every day, then work out whether 250 g or a larger pack fits the way you brew.',
    plate: ['At home', '250 g or 1 kg?', 'Coffee storage'],
    sections: [
      ['Choose a spot before buying a jar', 'Keep your daily coffee sealed, dry and away from heat and direct light. A kitchen cupboard across the room from the hob is a better spot than a shelf over a boiling kettle. A clear jar with a sound lid can work inside a closed cupboard. If the original bag has a zip that still closes properly, use that. A one-way valve on the front of the pouch will do little for an opening left unsealed at the top.',
        'In a kitchen that gets steamy during the monsoon, measure the grounds on a dry stretch of counter. Close the bag before you start heating water. Check the zip for grounds that can stop the edges meeting. If the bag tore when you opened it, move the coffee to a clean, dry container with an airtight lid. There is no need to buy a special coffee canister for this.'],
      ['How long will this bag actually be open?', 'Start with the amount you use, in grams, each time you brew. At 15 g every morning, a 250 g bag gives you 16 full brews and 10 g left over. A kilo at the same pace takes about 67 days. Now consider a household making two 15 g cups every day. That same 250 g lasts a little over eight days. It makes sense for those two households to order different quantities.',
        'Check the small print on a larger size. ARAKU’s Selection lists its kilo option as four 250 g packs. That lets you finish one pack before opening the next. When another shop offers a kilo in a single bag, ask how it is packed before comparing the price per gram.'],
      ['If you buy the coffee already ground', 'Ground coffee gives up its aroma faster than whole beans. Buy a smaller pack if you only brew on weekends. At two 15 g cups a week, even 100 g is more than three weekends of coffee. If a roaster offers a sampler, check that the portions are sealed separately before buying several coffees at once.',
        'For the bag you open every day, a dry cupboard avoids repeated trips between the refrigerator and a warm kitchen. Write the coffee name and the day you opened it on the container. Next time you reach the bottom, you will know how long that size lasted and whether you still enjoyed the last few cups. Use that information, along with the instructions on the pack, when you reorder.']
    ],
    sources: [
      ['Levista · Storing coffee at home', storageGuide],
      ['IndianCoffeeBeans · Opened coffee, ground coffee and monsoon storage', 'https://www.indiancoffeebeans.com/learn/storing-coffee-beans-at-home-india'],
      ['ARAKU · Selection pack sizes', selection]
    ],
    atlas: [['Browse coffee and pack sizes', '/coffee/'], ['Explore sampler packs', '/more/?q=sampler'], ['Levista Coffee’s atlas profile', '/places/levista-coffee-ind-7fb3e6df8910/']],
    intent: {
      query: 'how to store coffee beans and ground coffee after opening in India',
      reference: storageGuide,
      signal: 'An r/IndiaCoffee reader requests storage methods for pre-ground coffee.',
      signalUrl: 'https://www.reddit.com/r/IndiaCoffee/comments/1jg8u31/',
      angle: 'Use actual brew frequency, Indian pack formats and cupboard conditions to choose a bag size and daily routine.'
    }
  }
];
