const words = {
    love: {
      happy: {
        subjects: ["love", "our hearts", "the light", "a kiss"],
        verbs: ["shines", "beats", "embraces", "whispers"],
        objects: ["like a flame", "with passion", "forever", "through time"]
      },
      grumpy: {
        subjects: ["love", "our hearts", "the shadow"],
        verbs: ["fades", "breaks", "shatters", "withers"],
        objects: ["into dust", "with bitterness", "forever lost", "into the void"]
      },
      lazy: {
        subjects: ["love", "stuff", "a thing"],
        verbs: ["is", "exists", "just sits", "lays around"],
        objects: ["there", "like meh", "kind of okay", "nothing special"]
      }
    },
    nature: {
      happy: {
        subjects: ["the sun", "the forest", "a river", "the mountain"],
        verbs: ["glows", "sings", "flows", "stands tall"],
        objects: ["with beauty", "in harmony", "forever", "reaching the sky"]
      },
      grumpy: {
        subjects: ["the storm", "the shadow", "the night", "the wind"],
        verbs: ["howls", "crashes", "moans", "fades away"],
        objects: ["into chaos", "with no end", "in darkness", "without a trace"]
      },
      lazy: {
        subjects: ["the cloud", "the grass", "a thing"],
        verbs: ["sits", "does nothing", "lays around", "barely moves"],
        objects: ["just there", "like whatever", "kind of sleepy", "meh"]
      }
    }
  };
  

const templates = {
    love: {
      happy: [
        "[subject] is like [object], [verb] with every hour.",
        "In the warmth of [subject], [object] [verb] forever.",
        "With [subject], we [verb] beyond [object]."
      ],
      grumpy: [
        "[subject] [verb] like [object], lost in the dark.",
        "Beneath the weight of [subject], [object] [verb] away.",
        "[subject] is nothing but [object], doomed to [verb]."
      ],
      lazy: [
        "[subject] [verb] and [verb], [object] whatever.",
        "[subject] is [verb] with no rush, just [object].",
        "Meh, [subject] is like [object], it [verb] when it feels like it."
      ]
    },
    nature: {
      happy: [
        "In the [subject], [object] [verb] gently.",
        "[subject] shines like [object], [verb] through the sky.",
        "[subject] and [object] [verb] together in harmony."
      ],
      grumpy: [
        "[subject] [verb], leaving [object] behind in ruin.",
        "The [subject] [verb], lost in [object].",
        "Beneath the [subject], [object] slowly [verb] into nothing."
      ],
      lazy: [
        "[subject] just [verb], [object] happens sometimes.",
        "[subject] [verb], not much else to say about it.",
        "[subject] and [object] [verb] without care."
      ]
    }
  };
  