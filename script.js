document.getElementById("button").addEventListener("click", generatePoem);

// Function to generate a poem based on user input
function generatePoem() {
  const inputWord = document.getElementById("input-field").value;

  document.getElementById("poem-output").textContent = "Generating poem...";

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
        const selectedAdjectives = shuffleArray(adjectives)
          .slice(0, 4)
          .map((item) => item.word); // 4 random adjectives

        const selectedNouns = shuffleArray(nouns)
          .slice(0, 4)
          .map((item) => item.word); // 4 random nouns

        // Create the poem using the selected words
        const poem = createPoem(selectedAdjectives, selectedNouns);

        // Update the poem output
        document.getElementById("poem-output").innerHTML = poem;
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

// Function to create a poem from adjectives and nouns
function createPoem(adjectives, nouns) {
  let poemLines = "";
  for (let i = 0; i < adjectives.length && i < nouns.length; i++) {
    const line = `${adjectives[i]} ${nouns[i]}`;
    const capitalizedLine = line.charAt(0).toUpperCase() + line.slice(1);
    poemLines += `${capitalizedLine}<br><br>`;
  }
  return `<div>${poemLines.trim()}</div>`;
}

// Function to shuffle an array (Fisher-Yates Shuffle Algorithm)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
}
