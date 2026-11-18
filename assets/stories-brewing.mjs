// Reader questions and source notes belong to the editorial research record.
const editionDate = '2026-11-18';

export default [
  {
    slug: 'channi-french-press-filter-coffee-grind',
    date: editionDate,
    title: 'Which grind should I buy for a channi, French press or South Indian filter?',
    category: 'Buying coffee · Grind size',
    description: 'Match the grind on an Indian roaster’s order form to the brewer in your cupboard, and work out what to do if you bought the wrong bag.',
    photo: 'grind',
    extraPhoto: 'fine',
    plate: ['At the roaster', 'Choose your grind', 'Three ways to brew'],
    sections: [
      ['The right choice at checkout', 'For a tea strainer, choose “channi” or “coarse”. For a French press, select the French press option. Blue Tokai says its French press setting also suits a channi, so either brewer can share that bag. For a traditional steel South Indian filter, pick the option with the brewer’s full name. That coffee will generally feel finer than the other two. Buy whole beans only if you have a grinder or someone who can grind them for you.'],
      ['A tea strainer catches the grounds at the end', 'Put the coffee and hot water together in a mug and give them time to steep. Use the channi when you pour the drink into a second cup. Water poured straight through a spoonful of coarse grounds in a tea strainer will spend very little time there. A pale cup in that situation is a reason to change how you use the strainer before buying finer coffee.', 'A little sediment can settle in the last mouthful. Leave that sip in the cup. If there is grit throughout the drink, look at the mesh against the light. A piece of clean, tightly woven muslin in the strainer can catch smaller particles.'],
      ['What changes with a French press or a steel filter?', 'In a French press, coffee steeps in the beaker. The plunger carries a metal screen through the brew, so a coarse grind is a reasonable first order. In the two-chamber Indian filter, water travels through the ground coffee and collects underneath. Grind size affects how easily that water can pass. A label that just says “filter” could also mean a paper dripper. If you are ordering over WhatsApp or at a counter, tell the roaster you use the steel filter with the collecting vessel below.'],
      ['If one bag has to do two jobs', 'A channi and a French press make an easy pair. If the two brewers are a French press and a steel filter, ask whether the roaster can split the order into two labelled packets. Already holding a coarse bag for the steel filter? Brew a cup by steeping and straining it while you try a small packet ground for the filter. You can compare both without committing to another large bag.']
    ],
    sources: [
      ['Blue Tokai · Why Different Grind Sizes?', 'https://bluetokaicoffee.com/blogs/blue-tokai-coffee-roasters/why-different-grind-sizes'],
      ['Blue Tokai · Channi brewing method and fine sediment', 'https://bluetokaicoffee.com/pages/channi-coffee-brewing-guides'],
      ['Kaapiswada · Grind for a South Indian filter', 'https://kaapiswada.in/blog/grind-size-for-south-indian-filter-coffee']
    ],
    atlas: [['Find a roaster to grind your beans', '/explore/?kind=roasters'], ['Browse French presses', '/equipment/?q=French%20Press'], ['Troubleshoot a South Indian decoction', '/journal/south-indian-filter-coffee-decoction/']],
    intent: {
      query: 'which coffee grind should I buy for channi French press or South Indian filter India',
      reference: 'https://bluetokaicoffee.com/blogs/blue-tokai-coffee-roasters/why-different-grind-sizes',
      signal: 'An IndiaCoffee reader about to order from Blue Tokai asks whether to keep the French press/channi setting when switching brewer.',
      signalUrl: 'https://www.reddit.com/r/IndiaCoffee/comments/1f8pbyu',
      angle: 'Follow the grind selector for three common brewers and salvage a mismatched bag.'
    }
  },
  {
    slug: 'south-indian-filter-coffee-decoction',
    date: editionDate,
    title: 'Why is my South Indian filter coffee weak, or barely dripping?',
    category: 'Brew guide · Filter kaapi',
    description: 'Check the flow through your steel filter and taste the decoction before adding milk. Those two observations tell you which part of breakfast to fix.',
    photo: 'decoction',
    plate: ['At home', 'The slow drip', 'South Indian filter coffee'],
    sections: [
      ['Set aside a spoonful of decoction', 'Before the milk goes in, pour a little of the coffee from the lower vessel onto a spoon and let it cool enough to taste. Does it have the strength you expected? A good decoction can disappear in a large tumbler of milk. Changing the powder or pressing harder tomorrow will send you looking for a brewing fault when today’s problem was in the serving.'],
      ['If breakfast is ready and the water is still sitting there', 'Let the filter cool before lifting it apart. Empty the upper chamber and look through its perforated base towards a light. Clear any grounds sitting in the little holes with water and a soft brush. If you use an older brass filter, follow its care instructions for the finish.', 'On the next brew, use the same bag and quantity. Spread the coffee evenly and rest the disc on the surface with a light hand. Pressing a deep, tight plug of powder into a small filter can slow the drip right down. If it still stalls with clean holes and a loosely settled bed, ask the roaster for a slightly coarser grind for this filter. Some modern brewers have vents and their own recipes. Use the instructions for the one on your counter.'],
      ['If the lower vessel fills quickly but tastes thin', 'Use a level spoon to measure the powder and the same small cup to measure the water for two mornings. Keep the water amount steady and try a little more coffee on the second morning, leaving room in the upper chamber. A gentle pour over the disc helps keep the bed even. If you change the coffee, the water and the grind together, you lose the comparison.'],
      ['Give two small tumblers different amounts of milk', 'If the plain decoction tastes right, divide a small amount equally between two cups. For example, put 15 ml of decoction in each and add 15 ml of hot milk to one and 30 ml to the other. These are tasting portions. Choose the one you prefer and keep that proportion for a full tumbler. You can do this with the very first batch, even if you make only enough coffee for one person.']
    ],
    sources: [
      ['Kaapiswada · Using the filter and fixing a slow drip', 'https://kaapiswada.in/blog/south-indian-coffee-filter-how-to-use-and-clean'],
      ['Aramse · How vents and pouring work in the SOFI brewer', 'https://aramse.coffee/products/sofi'],
      ['Blue Tokai · South Indian filter quantities and serving example', 'https://bluetokaicoffee.com/pages/how-to-make-coffee-from-south-indian-filter']
    ],
    atlas: [['Browse South Indian filter equipment', '/equipment/?q=South%20Indian'], ['Find coffees for a milk brew', '/coffee/'], ['Choose the right grind for your filter', '/journal/channi-french-press-filter-coffee-grind/']],
    intent: {
      query: 'why is my South Indian filter coffee decoction weak or not dripping',
      reference: 'https://kaapiswada.in/blog/south-indian-coffee-filter-how-to-use-and-clean',
      signal: 'An IndiaCoffee user describes waiting over half an hour after adding 100 ml water to a South Indian filter.',
      signalUrl: 'https://www.reddit.com/r/IndiaCoffee/comments/1n7299t/need_help_for_south_indian_coffee_filter/',
      angle: 'Use one spoonful and a two-tumbler milk comparison to distinguish a brew problem from a serving problem.'
    }
  },
  {
    slug: 'cold-brew-or-iced-coffee-with-milk',
    date: editionDate,
    title: 'Cold brew or iced coffee: which one works with milk?',
    category: 'Brew guide · Cold coffee',
    description: 'Make a glass now with hot-brewed coffee, or steep a jar for tomorrow. Keep the coffee flavour when milk and melting ice go in.',
    photo: 'iced',
    plate: ['Cold coffee', 'Today or tomorrow?', 'Milk and ice'],
    sections: [
      ['If you want a glass now', 'Use coffee you can brew hot and strong, such as the first decoction from a South Indian filter or coffee from a moka pot. Pour a small measure into a heatproof cup, stir in sugar now if you use it, then add chilled milk. Add ice to serve. You have made iced coffee. The word “iced” tells the person drinking it how it arrives. It leaves you quite a bit of choice about the brewer.', 'A large mug of black filter coffee already contains the water that makes it a pleasant drink. Tip the whole mug onto ice, then add a generous amount of milk, and it is easy to lose the coffee altogether. Use less milk in a first pour, or start with a smaller, stronger brew.'],
      ['If you want a jar ready tomorrow', 'Cold brew starts with ground coffee in cold water. A small fridge batch is easier to judge than a litre of a new bag. Put 30 g of coarsely ground coffee and 240 g of cold drinking water in a clean jar. Wet all the grounds, cover the jar and refrigerate for about 14 hours. Strain into a clean container. These quantities scale the 1:8 refrigerated method described by Navees Farm. The grounds keep some of the water, so the final liquid will measure less than 240 ml.', 'Keep the filtered coffee covered and refrigerated. Add milk when you pour a serving. That way the same batch can become a short black glass for one person and a milky coffee for another.'],
      ['Choose a milk ratio with two mouthfuls', 'Pour 20 ml of the concentrate into each of two small cups. Add 20 ml of milk to the first and 40 ml to the second. Taste both before adding ice. If you like the first, 60 ml of concentrate and 60 ml of milk will give you the same starting balance in a bigger glass. Ice will soften it further as it melts.', 'With a bought bottle, read the serving instructions first. “Ready to drink” usually means the maker has already chosen the strength. A bottle labelled “concentrate” is meant to be diluted and its recommended amount can differ from this home batch. Two bottles with the same volume can therefore make quite different numbers of glasses.']
    ],
    sources: [
      ['Nescafé India · Cold brew and iced coffee', 'https://www.nescafe.com/in/coffee-culture/knowledge/what-is-cold-brew-coffee'],
      ['Navees Farm & Roastery · Refrigerated cold brew ratio and steep time', 'https://naveesfarm.in/cold-brew-coffee-powder/'],
      ['Toddy · Home cold brew system brewing guide', 'https://toddycafe.com/downloads/toddy_retail_instructions.pdf']
    ],
    atlas: [['Browse cold brew equipment', '/equipment/?q=Cold%20Brew'], ['Explore the coffee catalogue', '/coffee/'], ['Brew a South Indian decoction', '/journal/south-indian-filter-coffee-decoction/']],
    intent: {
      query: 'cold brew vs iced coffee with milk which to make at home India',
      reference: 'https://www.nescafe.com/in/coffee-culture/knowledge/what-is-cold-brew-coffee',
      signal: 'An IndiaCoffee thread explicitly asks how to make cold brew for milk in a French press. The Indian Nescafé comparison also appeared in the unbranded topic search.',
      signalUrl: 'https://www.reddit.com/r/IndiaCoffee/comments/1fjbv7w',
      angle: 'Offer one drink for today and one for tomorrow, plus a small side-by-side serving test.'
    }
  },
  {
    slug: 'moka-pot-sputtering-bitter-coffee',
    date: editionDate,
    title: 'Why does my moka pot sputter and make bitter coffee?',
    category: 'Brew guide · Stovetop',
    description: 'Tell a finishing gurgle from a pot that leaks or spits from the start. A cold-pot check helps you decide what to change before the next brew.',
    photo: 'moka',
    plate: ['On the hob', 'Listen to the pot', 'Moka Express'],
    sections: [
      ['When did you hear the noise?', 'A gurgle after most of the coffee has reached the upper chamber is the cue to take a classic Moka Express off the heat. Waiting for one final spoonful can leave the coffee you already have sitting over the burner. A pot that spits from the first drops, leaks steam at the screwed joint, or heats without coffee coming up is a different problem. Switch off the hob and let the pot cool completely before opening it.'],
      ['Check the pieces at the sink', 'With a cold, empty pot, lift out the funnel and check its rim. It should sit evenly in the base. A dented funnel can prevent a good seal. Look at the rubber ring and the metal filter plate under the upper chamber. Clean off any particles from the rim and sealing surfaces. Replace a worn gasket with the one made for your model and size. Bialetti’s troubleshooting guide also points to a blocked filter plate when coffee fails to reach the top.', 'A leak around the middle is useful information. The pot relies on a seal to send water up through the grounds. Turning the burner higher will heat the pot further while the leak is still there.'],
      ['Build the next pot cold', 'For a classic Moka Express, fill the base to just below its safety valve. Drop in the funnel and loosely fill it with ground coffee suitable for a moka pot. Level the surface, wipe loose grounds off the rim and screw the chambers together firmly. Leave the coffee loose. Pressing it down as you would an espresso puck adds resistance. Other models, including the Brikka, have their own filling instructions.', 'On a gas stove choose a ring small enough for the flame to stay underneath the base. Use low to medium heat and keep the handle clear of the flame. If steam vents from the safety valve, stop heating. Let the pot cool, consult its manual and have persistent venting checked by the maker or dealer before another brew.'],
      ['If it flows normally but tastes harsh', 'Start with the same coffee tomorrow. Remove the pot promptly at the end of the brew, pour your cup and let it cool to drinking temperature. If a small splash of hot water gives you the flavour you wanted, serving strength was part of the problem. If the bitter finish stays, trying a different roast is a more useful comparison than forcing more water through the same grounds.']
    ],
    sources: [
      ['Bialetti New Zealand · Troubleshooting leaks and missing flow', 'https://www.bialetti.co.nz/blogs/making-great-coffee/troubleshooting-faqs'],
      ['Bialetti support · Filling and heating a Moka Express', 'https://bialetti-cookware.zendesk.com/hc/en-us/articles/5416235346322-How-to-use-the-Moka-Express'],
      ['Bialetti · Moka instructions and safety-valve guidance (PDF)', 'https://m.media-amazon.com/images/I/91OsJ8-iNWL.pdf']
    ],
    atlas: [['Find moka pots and parts in the equipment catalogue', '/equipment/?q=Moka'], ['Find an Indian coffee roaster', '/explore/?kind=roasters'], ['Use a moka brew in iced coffee', '/journal/cold-brew-or-iced-coffee-with-milk/']],
    intent: {
      query: 'why is my moka pot sputtering and tasting bitter India',
      reference: 'https://www.bialetti.co.nz/blogs/making-great-coffee/troubleshooting-faqs',
      signal: 'An Indian moka-pot owner describes sputtering and bitterness and asks whether the brewer needs replacing.',
      signalUrl: 'https://www.reddit.com/r/IndiaCoffee/comments/1iqk53f',
      angle: 'Sort the fault by when and where the noise starts, then check sealing, brewing and serving strength separately.'
    }
  }
];
