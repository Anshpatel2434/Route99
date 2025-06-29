import React, { useState } from "react";
import { Copy, FileText, Wand2 } from "lucide-react";

const QuantMCQFormaterOne = () => {
	const [inputText, setInputText] = useState("");
	const [solutionText, setSolutionText] = useState("");
	const [outputText, setOutputText] = useState("");
	const [copySuccess, setCopySuccess] = useState(false);

	const parseTextContent = (content) => {
		// Parse solutions from input if provided
		const parseSolutions = (solutionInput) => {
			const solutions = {};
			if (!solutionInput.trim()) return solutions;

			const solutionRegex = /S(\d+)\.\s*\(([a-d])\)\s*(.*?)(?=S\d+\.|$)/gs;
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

		// Split content into lines and process
		const lines = content.split("\n");
		const questions = [];
		let currentQuestion = null;
		let collectingSolution = false;
		let solutionContent = "";

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim();

			// Skip empty lines
			if (!line) continue;

			// Check if this is a question line (starts with number followed by period)
			const questionMatch = line.match(/^(\d+)\.\s*(.*)/);
			if (questionMatch) {
				// Save previous question if exists
				if (currentQuestion) {
					// Check if it's a TITA question (contains underscores or specific patterns)
					const isTITA =
						currentQuestion.text.includes("_") ||
						currentQuestion.text.includes("(in") ||
						!currentQuestion.options.some((opt) => opt.text.trim());

					if (!isTITA && currentQuestion.options.length > 0) {
						questions.push(
							formatMCQQuestion(currentQuestion, solutions, solutionContent)
						);
					}
				}

				currentQuestion = {
					number: questionMatch[1],
					text: questionMatch[2].replace(/\\_/g, "_").replace(/\\%/g, "%"),
					options: [],
					correctAnswer: null,
				};
				collectingSolution = false;
				solutionContent = "";
				continue;
			}

			// Check if this is an option line
			const optionMatch = line.match(/^\(([A-Da-d])\)\s*(.*)/);
			if (optionMatch && currentQuestion) {
				const optionLetter = optionMatch[1].toLowerCase();
				const optionText = optionMatch[2]
					.replace(/\\_/g, "_")
					.replace(/\\%/g, "%");
				currentQuestion.options.push({
					letter: optionLetter,
					text: optionText,
				});
				continue;
			}

			// If we're past the questions section and in solutions
			if (line.match(/^\d+\.\s/)) {
				collectingSolution = true;
			}

			if (collectingSolution) {
				solutionContent += line + " ";
			} else if (currentQuestion) {
				// Continue question text if it's a multi-line question
				currentQuestion.text +=
					" " + line.replace(/\\_/g, "_").replace(/\\%/g, "%");
			}
		}

		// Process the last question
		if (currentQuestion) {
			const isTITA =
				currentQuestion.text.includes("_") ||
				currentQuestion.text.includes("(in") ||
				!currentQuestion.options.some((opt) => opt.text.trim());

			if (!isTITA && currentQuestion.options.length > 0) {
				questions.push(
					formatMCQQuestion(currentQuestion, solutions, solutionContent)
				);
			}
		}

		return questions.join("\n\n");
	};

	const formatMCQQuestion = (question, solutions, solutionContent) => {
		let formattedQuestion = `Q.${question.number}) ${question.text}\n`;

		// Extract correct answer from solutions or answer key
		let correctAnswer = solutions[question.number]?.correctOption;

		// Look for correct answer in the solution content or answer key
		if (!correctAnswer) {
			const answerPattern = new RegExp(
				`${question.number}\\s*\\.?\\s*\\(([A-Da-d])\\)`,
				"i"
			);
			const answerMatch = solutionContent.match(answerPattern);
			if (answerMatch) {
				correctAnswer = answerMatch[1].toLowerCase();
			}
		}

		// Format options
		question.options.forEach((option) => {
			const isCorrect = correctAnswer === option.letter;
			const prefix = isCorrect ? "*" : "";
			formattedQuestion += `${prefix}[${option.letter}] ${option.text}\n`;
		});

		// Add solution if available
		if (solutions[question.number]?.solution) {
			formattedQuestion += `[S${question.number}] ${
				solutions[question.number].solution
			}`;
		} else {
			// Try to extract solution from the content
			const solutionPattern = new RegExp(
				`${question.number}\\.(.*?)(?=\\d+\\.|$)`,
				"s"
			);
			const solutionMatch = solutionContent.match(solutionPattern);
			if (solutionMatch && solutionMatch[1].trim()) {
				const cleanSolution = solutionMatch[1]
					.replace(/\([A-Da-d]\)/g, "")
					.replace(/^\s*\([A-Da-d]\)\s*/, "")
					.trim()
					.replace(/\\_/g, "_")
					.replace(/\\%/g, "%");
				if (cleanSolution) {
					formattedQuestion += `[S${question.number}] ${cleanSolution}`;
				}
			}
		}

		return formattedQuestion;
	};

	const handleConvert = () => {
		if (!inputText.trim()) {
			setOutputText("Please paste your content in the input area.");
			return;
		}

		try {
			const converted = parseTextContent(inputText);
			setOutputText(
				converted || "No MCQ questions found. Please check your input format."
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
					<h1 className="text-3xl font-bold text-blue-400 mb-2 flex items-center justify-center gap-2">
						<FileText className="w-8 h-8" />
						Quant MCQ Formatter
					</h1>
					<p className="text-gray-400">
						Convert text questions to formatted MCQ format (TITA questions will
						be ignored)
					</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
					{/* Input Section */}
					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-gray-300 mb-2">
								Questions Text Input
							</label>
							<textarea
								value={inputText}
								onChange={(e) => setInputText(e.target.value)}
								placeholder="Paste your questions text here..."
								className="w-full h-64 p-4 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none font-mono text-sm"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-300 mb-2">
								Solutions Input (Optional)
							</label>
							<textarea
								value={solutionText}
								onChange={(e) => setSolutionText(e.target.value)}
								placeholder="Format: S1. (a) Solution text here S2. (b) Another solution..."
								className="w-full h-32 p-4 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none font-mono text-sm"
							/>
						</div>

						<button
							onClick={handleConvert}
							className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
						>
							<Wand2 className="w-5 h-5" />
							Convert to MCQ Format
						</button>
					</div>

					{/* Output Section */}
					<div>
						<div className="flex items-center justify-between mb-2">
							<label className="block text-sm font-medium text-gray-300">
								Formatted MCQ Output
							</label>
							{outputText && (
								<button
									onClick={handleCopy}
									className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
										copySuccess
											? "bg-green-600 text-white"
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
							placeholder="Converted MCQ format will appear here..."
							className="w-full h-96 p-4 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none font-mono text-sm"
						/>
					</div>
				</div>

				{/* Instructions */}
				<div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
					<h3 className="text-lg font-semibold text-blue-400 mb-3">
						Instructions:
					</h3>
					<div className="space-y-2 text-gray-300 text-sm">
						<p>
							<strong>1. Text Input:</strong> Paste your questions text with
							numbered questions and (A), (B), (C), (D) options.
						</p>
						<p>
							<strong>2. Solutions Input (Optional):</strong> Use format "S1.
							(a) Solution text S2. (b) Another solution..."
						</p>
						<p>
							<strong>3. MCQ Detection:</strong> Only questions with proper (A),
							(B), (C), (D) options will be processed.
						</p>
						<p>
							<strong>4. TITA Questions:</strong> Questions with underscores (_)
							or "fill in the blank" style will be ignored.
						</p>
						<p>
							<strong>5. Output Format:</strong> Questions will be converted to
							Q.1) format with [a], [b], [c], [d] options and [S1] solutions.
						</p>
						<p>
							<strong>6. Answer Detection:</strong> Correct answers will be
							detected from answer keys or solution input and marked with *.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default QuantMCQFormaterOne;
