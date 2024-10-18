let lastInputWord = "";
let repeatCount = 0;

document.getElementById("button").addEventListener("click", generatePoem);

// Function to generate a haiku poem based on user input
function generatePoem() {
  const inputField = document.getElementById("input-field");
  const inputWord = inputField.value.trim();

  // Displaying moody comments with probability
  // The following 4 lines of code is from stack overflow: https://stackoverflow.com/questions/11552158/percentage-chance-of-saying-something
  let randomNum = Math.random();
  if (randomNum < 0.1) {
    document.getElementById("poem-output").textContent = "ugh 🙄 really?";
    return;
  } else if (randomNum < 0.2) {
    document.getElementById("poem-output").textContent = "no.";
    return;
  }

  document.getElementById("poem-output").textContent = "Generating poem...";

  // Check if current input = last input to count repeats
  let wordToUse = inputWord;
  if (inputWord === lastInputWord) {
    repeatCount++;
  } else {
    repeatCount = 0;
  }

  lastInputWord = inputWord;

  console.log(`Input Word: ${inputWord}, Repeat Count: ${repeatCount}`);

  // Generate opposite word if repeated 5 times
  if (repeatCount === 5) {
    console.log("Fetching antonym...");
    getOppositeWordOrTone(inputWord).then((ConflictingWord) => {
      console.log(`Conflicting Word Found: ${ConflictingWord}`);
      if (ConflictingWord !== inputWord) {
        wordToUse = ConflictingWord;
        inputField.value = ConflictingWord; // Update input field with antonym
      }
      fetchWords(wordToUse);
    });
    repeatCount = 0;
  } else {
    fetchWords(wordToUse);
  }
}

// Function to fetch words for poem with retries (ChatGPT)
function fetchWords(inputWord, retryCount = 10) {
  const tryFetch = (attempt) => {
    return Promise.all([
      fetch(`https://api.datamuse.com/words?rel_trg=${inputWord}`), // Related words
      fetch(`https://api.datamuse.com/words?rel_jjb=${inputWord}`), // Adjectives
      fetch(`https://api.datamuse.com/words?rel_jja=${inputWord}`), // Nouns
    ])
      .then(([relatedResponse, adjectiveResponse, nounResponse]) =>
        Promise.all([
          relatedResponse.json(),
          adjectiveResponse.json(),
          nounResponse.json(),
        ])
      )
      .then(([relatedWords, adjectives, nouns]) => {
        if (
          adjectives.length > 0 &&
          nouns.length > 0 &&
          relatedWords.length > 0
        ) {
          const selectedAdjectives = shuffleArray(adjectives).map(
            (item) => item.word
          ); // Random adjectives
          const selectedNouns = shuffleArray(nouns).map((item) => item.word); // Random nouns
          const selectedRelatedWords = shuffleArray(relatedWords).map(
            (item) => item.word
          ); // Random related words

          const verbPromises = selectedRelatedWords.map((word) =>
            fetchPartOfSpeech(word)
          );

          Promise.all(verbPromises).then((partOfSpeechArray) => {
            const verbs = [];

            partOfSpeechArray.forEach((parts, index) => {
              if (parts.includes("verb")) {
                verbs.push(selectedRelatedWords[index]); // Only push verbs to the array
              }
            });

            const haiku = createHaiku(selectedAdjectives, selectedNouns, verbs);

            if (haiku) {
              document.getElementById("poem-output").innerHTML = haiku;
            } else {
              document.getElementById("poem-output").textContent =
                "Couldn't generate a valid haiku. Try again!";
            }
          });
        } else {
          if (attempt < retryCount) {
            console.warn(`Attempt ${attempt} failed, retrying...`);
            return tryFetch(attempt + 1); // Retry the fetch
          }
          document.getElementById("poem-output").textContent =
            "Couldn't generate a poem. Try again!";
        }
      })
      .catch((error) => {
        if (attempt < retryCount) {
          console.warn(
            `Attempt ${attempt} failed due to error, retrying...`,
            error
          );
          return tryFetch(attempt + 1); // Retry the fetch
        }
        document.getElementById("poem-output").textContent =
          "Couldn't generate a poem. Try again";
        console.error("Error fetching data from Datamuse API:", error);
      });
  };

  tryFetch(1); // Start with the first attempt
}

// Function to fetch the part of speech for a word using the Dictionary API
function fetchPartOfSpeech(word) {
  const dictionaryApiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;

  return fetch(dictionaryApiUrl)
    .then((response) => response.json())
    .then((data) => {
      if (data && Array.isArray(data) && data.length > 0 && data[0].meanings) {
        // Get parts of speech from the first meaning of the word
        const parts = data[0].meanings.map((meaning) => meaning.partOfSpeech);
        console.log(`Word: ${word}, Parts of Speech: ${parts}`);
        return parts;
      }
      return []; // Return empty array if no data found
    })
    .catch((error) => {
      console.error(`Error fetching part of speech for word "${word}":`, error);
      return []; // Return empty array on error
    });
}

// Function for fetching conflicting/opposite words
// The following 2 blocks of code is from ChatGPT
function getOppositeWordOrTone(word) {
  return getOppositeWord(word).then((antonym) => {
    return antonym;
  });
}

// Function for fetching opposite words (antonyms)
function getOppositeWord(word) {
  return fetch(`https://api.datamuse.com/words?rel_ant=${word}`) // Find antonyms
    .then((response) => response.json())
    .then((data) => {
      console.log(`Antonym Response Data:`, data);
      if (data.length > 0) {
        return data[0].word; // Return the first antonym found
      }
      console.log(`No antonyms found for: ${word}`);
      return word; // Return original word if no antonym is found
    })
    .catch((error) => {
      console.error("Error fetching antonym from Datamuse API:", error);
      return word; // Return original word on error
    });
}

// Syllables counter function reference: https://andyhartnett.medium.com/to-parse-a-haiku-using-only-javascript-was-interesting-5ea64ce31948
// Function to count syllables in a word
function syllables(word) {
  word = word.toLowerCase();
  if (word.length <= 3) {
    return 1;
  }
  const matches = word
    .replace(/(?:[^laeiouy]es|ed|lle|[^laeiouy]e)$/, "")
    .replace(/^y/, "")
    .match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 0; // If no matches, return 0
}

// Function to check syllable count in a sentence
function checkLine(sentence) {
  let count = 0;
  const words = sentence.split(" ");

  words.forEach(function (val) {
    count += syllables(val);
  });

  return count;
}

// Function to capitalize the first letter of a string
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Function to generate a haiku
function createHaiku(adjectives, nouns, verbs) {
  let lines = ["", "", ""]; // Three lines for the haiku
  let remainingSyllables = [5, 7, 5]; // Expected syllable counts per line

  // Function to pick and remove word from array to prevent repetition of the same words
  // Following 3 blocks of code are from ChatGPT
  function pickAndRemove(array) {
    if (array.length > 0) {
      return array.splice(Math.floor(Math.random() * array.length), 1)[0];
    }
    return "";
  }

  // Template for haiku word structure
  const templates = [
    { line: 1, structure: ["Adjective", "Noun"] },
    {
      line: 2,
      structure: ["Noun", "Verb", "Preposition", "Adjective", "Noun"],
    },
    { line: 3, structure: ["Adjective", "Noun", "Verb"] },
  ];

  // Function to build each line
  function buildLine(template) {
    let parts = [];

    template.structure.forEach((type) => {
      if (type === "Adjective") {
        parts.push(pickAndRemove(adjectives));
      } else if (type === "Noun") {
        parts.push(pickAndRemove(nouns));
      } else if (type === "Verb") {
        parts.push(pickAndRemove(verbs));
      } else if (type === "Preposition") {
        const prepositions = ["with", "by", "on", "in", "at", "of"];
        parts.push(
          prepositions[Math.floor(Math.random() * prepositions.length)]
        );
      }
    });

    // Remove any undefined or empty words
    parts = parts.filter((word) => word);
    return parts.join(" ").trim();
  }

  // Try to build each line according to the syllable count and template
  for (let i = 0; i < 3; i++) {
    let currentLine = [];
    let template = templates.find((t) => t.line === i + 1);

    for (let attempts = 0; attempts < 10; attempts++) {
      // Try multiple times to find a match
      let linePart = buildLine(template);
      let syllableCount = checkLine(linePart);

      if (syllableCount === remainingSyllables[i]) {
        currentLine = linePart;
        break;
      }
    }

    if (currentLine.length === 0) {
      console.log(`Failed to match the syllable requirement for line ${i + 1}`);
      return false; // Couldn't generate a valid haiku, abort
    }

    lines[i] = capitalizeFirstLetter(currentLine);
  }

  console.log(`Generated Haiku: ${lines[0]}, ${lines[1]}, ${lines[2]}`);

  return `<div>${lines[0]}<br><br>${lines[1]}<br><br>${lines[2]}</div>`;
}

// Function to shuffle an array (Fisher-Yates Shuffle Algorithm) (chatGPT)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
}
