import React, { useState } from "react";
import { Copy, BarChart3, Wand2 } from "lucide-react";

const Lrdi = () => {
	const [inputText, setInputText] = useState("");
	const [solutionText, setSolutionText] = useState("");
	const [outputText, setOutputText] = useState("");
	const [copySuccess, setCopySuccess] = useState(false);

	const parseLRDIContent = (content) => {
		// Parse solutions from input if provided
		const parseSolutions = (solutionInput) => {
			const solutions = {};
			if (!solutionInput.trim()) return solutions;

			const solutionRegex =
				/(\d+)\.\s*\(([a-d])\)\s*(.*?)(?=\d+\.\s*\([a-d]\)|$)/gs;
			let match;
			while ((match = solutionRegex.exec(solutionInput)) !== null) {
				const [, questionNum, correctOption, solution] = match;
				solutions[questionNum] = {
					correctOption: correctOption.toLowerCase(),
					solution: solution.trim(),
				};
			}
			return solutions;
		};

		const solutions = parseSolutions(solutionText);

		// Split content into lines
		const lines = content.split("\n");
		const sets = [];
		let i = 0;

		console.log("Starting to parse content..."); // Debug log

		while (i < lines.length) {
			const line = lines[i] ? lines[i].trim() : "";

			// Skip empty lines
			if (!line) {
				i++;
				continue;
			}

			// Enhanced regex to catch all direction formats
			const directionsMatch =
				line.match(
					/^Directions?\s*[\(:]*\s*(\d+)\s*-?\s*(\d+)\s*[\):]*\s*[:]*\s*(.*)/i
				) ||
				line.match(
					/^Direction\s*[\(:]*\s*(\d+)\s*-?\s*(\d+)\s*[\):]*\s*[:]*\s*(.*)/i
				);

			if (directionsMatch) {
				console.log("Found direction:", line); // Debug log

				const [, startNum, endNum, directionsContent] = directionsMatch;
				const currentSet = {
					startQuestion: parseInt(startNum),
					endQuestion: parseInt(endNum),
					directions: directionsContent
						.replace(/\\_/g, "_")
						.replace(/\\%/g, "%"),
					questions: [],
				};

				console.log(`Processing direction set: ${startNum}-${endNum}`); // Debug log

				// Continue reading direction text until we hit a question
				i++;
				while (i < lines.length) {
					const nextLine = lines[i] ? lines[i].trim() : "";
					if (!nextLine) {
						i++;
						continue;
					}

					// If we hit a question number, break
					if (nextLine.match(/^\d+\./)) {
						break;
					}

					// Add to directions
					currentSet.directions +=
						" " + nextLine.replace(/\\_/g, "_").replace(/\\%/g, "%");
					i++;
				}

				// Now process questions for this set
				while (i < lines.length) {
					const questionLine = lines[i] ? lines[i].trim() : "";

					if (!questionLine) {
						i++;
						continue;
					}

					// Check if we hit another directions line
					if (
						questionLine.match(/^Directions?\s*[\(:]*\s*\d+/i) ||
						questionLine.match(/^Direction\s*[\(:]*\s*\d+/i)
					) {
						console.log("Hit next direction, breaking"); // Debug log
						break; // Exit to process next directions
					}

					// Check if this is a question line
					const questionMatch = questionLine.match(/^(\d+)\.\s*(.*)/);
					if (questionMatch) {
						const [, questionNum, questionText] = questionMatch;
						const questionNumber = parseInt(questionNum);

						console.log(`Processing question ${questionNumber}`); // Debug log

						// Only process if question belongs to this set
						if (
							questionNumber >= currentSet.startQuestion &&
							questionNumber <= currentSet.endQuestion
						) {
							const currentQuestion = {
								number: questionNumber,
								text: questionText.replace(/\\_/g, "_").replace(/\\%/g, "%"),
								options: [],
							};

							// Continue reading question text and options
							i++;
							while (i < lines.length) {
								const nextLine = lines[i] ? lines[i].trim() : "";
								if (!nextLine) {
									i++;
									continue;
								}

								// If we hit next question, directions, or end of content, break
								if (
									nextLine.match(/^\d+\./) ||
									nextLine.match(/^Directions?/i) ||
									nextLine.match(/^Direction\s/i)
								) {
									break;
								}

								// Check if this is an option line
								const optionMatch = nextLine.match(/^\(([a-d])\)\s*(.*)/);
								if (optionMatch) {
									const [, optionLetter, optionText] = optionMatch;
									currentQuestion.options.push({
										letter: optionLetter.toLowerCase(),
										text: optionText.replace(/\\_/g, "_").replace(/\\%/g, "%"),
									});
								} else {
									// Continue question text
									currentQuestion.text +=
										" " + nextLine.replace(/\\_/g, "_").replace(/\\%/g, "%");
								}
								i++;
							}

							// Only add if question has options (MCQ) - this filters out TITA questions
							if (currentQuestion.options.length > 0) {
								console.log(
									`Added question ${questionNumber} with ${currentQuestion.options.length} options`
								); // Debug log
								currentSet.questions.push(currentQuestion);
							} else {
								console.log(
									`Skipped question ${questionNumber} - no options (TITA)`
								); // Debug log
							}
							continue;
						} else {
							console.log(
								`Question ${questionNumber} not in range ${currentSet.startQuestion}-${currentSet.endQuestion}`
							); // Debug log
						}
					}

					i++;
				}

				console.log(
					`Set ${currentSet.startQuestion}-${currentSet.endQuestion} has ${currentSet.questions.length} questions`
				); // Debug log
				sets.push(currentSet);
				continue;
			}

			i++;
		}

		console.log(`Total sets found: ${sets.length}`); // Debug log
		sets.forEach((set) => {
			console.log(
				`Set ${set.startQuestion}-${set.endQuestion}: ${set.questions.length} questions`
			);
		});

		return formatLRDISets(sets, solutions);
	};

	const formatLRDISets = (sets, solutions) => {
		let formattedOutput = "";

		sets.forEach((set, setIndex) => {
			// Add line break before new directions (except first one)
			if (setIndex > 0) {
				formattedOutput += "\n";
			}

			// Add directions header
			formattedOutput += `[Directions(${set.startQuestion}-${set.endQuestion})] ${set.directions}\n\n`;

			// Filter and add only questions that belong to this set and have options (MCQ questions only)
			const validQuestions = set.questions.filter(
				(q) =>
					q.number >= set.startQuestion &&
					q.number <= set.endQuestion &&
					q.options.length > 0
			);

			validQuestions.forEach((question, questionIndex) => {
				formattedOutput += `Q.${question.number}) ${question.text}\n`;

				// Get correct answer from solutions
				const solution = solutions[question.number.toString()];
				const correctOption = solution?.correctOption;

				// Add options
				question.options.forEach((option) => {
					const isCorrect = correctOption === option.letter;
					const prefix = isCorrect ? "*" : "";
					formattedOutput += `    ${prefix}[${option.letter}] ${option.text}\n`;
				});

				// Add solution if available
				if (solution) {
					formattedOutput += `\n[S${question.number}]\n(Answer)${correctOption}\n\n${solution.solution}\n`;
				} else {
					formattedOutput += `\n[S${question.number}]\n(Answer)\n\n\n`;
				}

				// Add spacing between questions within a set
				if (questionIndex < validQuestions.length - 1) {
					formattedOutput += "\n";
				}
			});

			// Add extra spacing between sets
			if (setIndex < sets.length - 1) {
				formattedOutput += "\n";
			}
		});

		return formattedOutput;
	};

	const handleConvert = () => {
		if (!inputText.trim()) {
			setOutputText("Please paste your LRDI content in the input area.");
			return;
		}

		try {
			const converted = parseLRDIContent(inputText);
			setOutputText(
				converted || "No LRDI questions found. Please check your input format."
			);
		} catch (error) {
			setOutputText(
				"Error processing the content. Please check your input format."
			);
			console.error("Conversion error:", error);
		}
	};

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(outputText);
			setCopySuccess(true);
			setTimeout(() => setCopySuccess(false), 2000);
		} catch (err) {
			console.error("Failed to copy text: ", err);
		}
	};

	return (
		<div className="min-h-screen bg-gray-900 text-gray-100 p-6">
			<div className="max-w-6xl mx-auto">
				<div className="mb-8 text-center">
					<h1 className="text-3xl font-bold text-purple-400 mb-2 flex items-center justify-center gap-2">
						<BarChart3 className="w-8 h-8" />
						LRDI Formatter
					</h1>
					<p className="text-gray-400">
						Format Logical Reasoning & Data Interpretation questions with
						directions
					</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
					{/* Input Section */}
					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-300 mb-2">
								LRDI Questions Input
							</label>
							<textarea
								value={inputText}
								onChange={(e) => setInputText(e.target.value)}
								placeholder="Paste your LRDI questions with directions here..."
								className="w-full h-64 p-4 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none font-mono text-sm"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-300 mb-2">
								Solutions Input (Optional)
							</label>
							<textarea
								value={solutionText}
								onChange={(e) => setSolutionText(e.target.value)}
								placeholder="Format: 1. (a) Solution text 2. (b) Another solution..."
								className="w-full h-32 p-4 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none font-mono text-sm"
							/>
						</div>

						<button
							onClick={handleConvert}
							className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
						>
							<Wand2 className="w-5 h-5" />
							Convert to LRDI Format
						</button>
					</div>

					{/* Output Section */}
					<div>
						<div className="flex items-center justify-between mb-2">
							<label className="block text-sm font-medium text-gray-300">
								Formatted LRDI Output
							</label>
							{outputText && (
								<button
									onClick={handleCopy}
									className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
										copySuccess
											? "bg-purple-600 text-white"
											: "bg-gray-700 hover:bg-gray-600 text-gray-300"
									}`}
								>
									<Copy className="w-4 h-4" />
									{copySuccess ? "Copied!" : "Copy"}
								</button>
							)}
						</div>
						<textarea
							value={outputText}
							readOnly
							placeholder="Converted LRDI format will appear here..."
							className="w-full h-96 p-4 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none font-mono text-sm"
						/>
					</div>
				</div>

				{/* Instructions */}
				<div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
					<h3 className="text-lg font-semibold text-purple-400 mb-3">
						Instructions:
					</h3>
					<div className="space-y-2 text-gray-300 text-sm">
						<p>
							<strong>1. Input Format:</strong> Paste LRDI content with
							"Directions (1-5):" followed by questions and (a), (b), (c), (d)
							options.
						</p>
						<p>
							<strong>2. Directions Detection:</strong> Automatically groups
							questions under their respective directions.
						</p>
						<p>
							<strong>3. Solutions Input (Optional):</strong> Use format "1. (a)
							Solution text 2. (b) Another solution..."
						</p>
						<p>
							<strong>4. Output Format:</strong> Questions will be formatted as:
						</p>
						<div className="ml-4 bg-gray-700 p-3 rounded text-xs font-mono">
							[Directions(1-4)] Direction text here
							<br />
							<br />
							Q.1) Question text
							<br />
							&nbsp;&nbsp;&nbsp;&nbsp;*[a] correct option
							<br />
							&nbsp;&nbsp;&nbsp;&nbsp;[b] option b<br />
							<br />
							[S1]
							<br />
							(Answer)a
							<br />
							<br />
							Solution explanation here
						</div>
						<p>
							<strong>5. Features:</strong> Preserves original numbering, groups
							by directions, marks correct answers with *
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Lrdi;
