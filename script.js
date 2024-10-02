function createPoem(words) {
  return `\n\n${words.join(", ")}.`;
}

document.getElementById("button").addEventListener("click", generatePoem);

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
        const selectedAdjectives = adjectives
          .slice(0, 4)
          .map((item) => item.word); // 4 adjectives
        const selectedNouns = nouns.slice(0, 4).map((item) => item.word); // 4 nouns

        const poem = createPoem(selectedAdjectives, selectedNouns);

        document.getElementById("poem-output").textContent = poem;
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

function createPoem(adjectives, nouns) {
  let poemLines = "";
  for (let i = 0; i < adjectives.length && i < nouns.length; i++) {
    poemLines += `${adjectives[i]} ${nouns[i]}\n`;
  }
  return `\n\n${poemLines.trim()}`;
}
