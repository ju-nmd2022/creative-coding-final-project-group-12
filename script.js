////// Haiku version   5-7-5
let lastInputWord = "";
let repeatCount = 0;

document.getElementById("button").addEventListener("click", generatePoem);

// Function to generate a haiku poem based on user input
function generatePoem() {
  const inputWord = document.getElementById("input-field").value;

  document.getElementById("poem-output").textContent = "Generating poem...";

  // Check if current input = last input
  let wordToUse = inputWord;
  if (inputWord === lastInputWord) {
    repeatCount++;
  } else {
    repeatCount = 0;
  }

  lastInputWord = inputWord;

  console.log(`Input Word: ${inputWord}, Repeat Count: ${repeatCount}`);

  // Generate opposite word
  if (repeatCount === 1) {
    console.log("Fetching antonym...");
    getOppositeWordOrTone(inputWord).then((ConflictingWord) => {
      console.log(`Conflicting Word Found: ${ConflictingWord}`);
      if (ConflictingWord !== inputWord) {
        wordToUse = ConflictingWord;
      }
      fetchWords(wordToUse);
    });
    repeatCount = 0;
  } else {
    fetchWords(wordToUse);
  }
}

// Function to fetch words for poem
function fetchWords(inputWord) {
  // Fetch adjectives and nouns related to the input word
  Promise.all([
    fetch(`https://api.datamuse.com/words?rel_jjb=${inputWord}`), // Get adjectives
    fetch(`https://api.datamuse.com/words?rel_jja=${inputWord}`), // Get nouns
  ])
    .then(([adjectiveResponse, nounResponse]) =>
      Promise.all([adjectiveResponse.json(), nounResponse.json()])
    )
    .then(([adjectives, nouns]) => {
      if (adjectives.length > 0 && nouns.length > 0) {
        const selectedAdjectives = shuffleArray(adjectives).map(
          (item) => item.word
        ); // Random adjectives
        const selectedNouns = shuffleArray(nouns).map((item) => item.word); // Random nouns

        // Create the haiku using the selected words
        const haiku = createHaiku(selectedAdjectives, selectedNouns);

        // Update the poem output
        if (haiku) {
          document.getElementById("poem-output").innerHTML = haiku;
        } else {
          document.getElementById("poem-output").textContent =
            "Couldn't generate a valid haiku. Try another word!";
        }
      } else {
        document.getElementById("poem-output").textContent =
          "Couldn't generate a poem. Try another word!";
      }
    })
    .catch((error) => {
      document.getElementById("poem-output").textContent =
        "Error generating poem";
      console.error("Error fetching data from Datamuse API:", error);
    });
}

// Function for fetching opposite words or conflicting tones
function getOppositeWordOrTone(word) {
  return getOppositeWord(word).then((antonym) => {
    if (antonym === word) {
      console.log("Fetching opposing emotional tone...");
      return getNegativeToneWord(word);
    }
    return antonym;
  });
}

// Function for fetching opposite words (antonyms)
function getOppositeWord(word) {
  return fetch(`https://api.datamuse.com/words?rel_ant=${word}`) // Finding antonyms
    .then((response) => response.json())
    .then((data) => {
      console.log(`Response Data:`, data);
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

// Function to fetch words with negative connotations
function getNegativeToneWord(word) {
  return fetch(`https://api.datamuse.com/words?rel_trg=${word}`) // Fetch words with a similar meaning
    .then((response) => response.json())
    .then((data) => {
      if (data.length > 0) {
        const negativeWord = shuffleArray(data).find((w) => w.word !== word); // Choose a random conflicting word
        return negativeWord ? negativeWord.word : word;
      }
      return word; // Return original word if no conflicting tone is found
    })
    .catch((error) => {
      console.error("Error fetching negative tone word:", error);
      return word; // Return original word on error
    });
}

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

// Function to generate a haiku
function createHaiku(adjectives, nouns) {
  let lines = ["", "", ""]; // Three lines for the haiku
  let remainingSyllables = [5, 7, 5]; // Expected syllable counts per line

  // Try to build each line according to the syllable count
  for (let i = 0; i < 3; i++) {
    let currentLine = [];
    let currentSyllables = 0;

    while (
      currentSyllables < remainingSyllables[i] &&
      (adjectives.length > 0 || nouns.length > 0)
    ) {
      let adj = adjectives.length > 0 ? adjectives.pop() : ""; // Use adjective if available
      let noun = nouns.length > 0 ? nouns.pop() : ""; // Use noun if available

      let linePart = `${adj} ${noun}`.trim(); // Trim to avoid unnecessary spaces
      let syllableCount = checkLine(linePart);

      console.log(
        `Trying: "${linePart}" with syllable count: ${syllableCount}`
      );

      // Ensure adding this part doesn't exceed the syllable count
      if (
        currentSyllables + syllableCount <= remainingSyllables[i] &&
        syllableCount > 0
      ) {
        currentLine.push(linePart);
        currentSyllables += syllableCount;
      }
    }

    console.log(
      `Line ${i + 1} generated: "${currentLine.join(
        " "
      )}" with ${currentSyllables} syllables.`
    );

    if (currentSyllables !== remainingSyllables[i]) {
      console.log(`Failed to match the syllable requirement for line ${i + 1}`);
      return false; // Couldn't generate a valid haiku, abort
    }

    lines[i] = currentLine.join(" ");
  }

  return `<div>${lines[0]}<br><br>${lines[1]}<br><br>${lines[2]}</div>`;
}

// Function to shuffle an array (Fisher-Yates Shuffle Algorithm)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
}
