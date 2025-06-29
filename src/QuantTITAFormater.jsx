import React, { useState } from "react";
import { Copy, FileText, Wand2 } from "lucide-react";

const QuantTITAFormater = () => {
	const [inputText, setInputText] = useState("");
	const [solutionText, setSolutionText] = useState("");
	const [outputText, setOutputText] = useState("");
	const [copySuccess, setCopySuccess] = useState(false);

	const parseTITAContent = (content) => {
		// Parse solutions from input if provided
		const parseSolutions = (solutionInput) => {
			const solutions = {};
			if (!solutionInput.trim()) return solutions;

			const solutionRegex = /S(\d+)\.\s*"([^"]*)"?\s*(.*?)(?=S\d+\.|$)/gs;
			let match;
			while ((match = solutionRegex.exec(solutionInput)) !== null) {
				const [, questionNum, answer, solution] = match;
				solutions[questionNum] = {
					answer: answer.trim(),
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

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim();

			// Stop processing when we reach the answer section
			if (line.match(/^\d+\.\s*\d+$/) || line.match(/^\d+\.\s*[A-Za-z]+$/)) {
				break;
			}

			// Skip empty lines
			if (!line) continue;

			// Check if this is a question line
			const questionMatch = line.match(/^(\d+)\.\s*(.*)/);
			if (questionMatch) {
				// Save previous question if exists
				if (currentQuestion) {
					const isTITA =
						currentQuestion.text.includes("_") ||
						currentQuestion.text.includes("(in") ||
						currentQuestion.text.match(/\s+\.$/) ||
						!currentQuestion.hasOptions;

					if (isTITA) {
						questions.push(formatTITAQuestion(currentQuestion, solutions));
					}
				}

				currentQuestion = {
					number: questionMatch[1],
					text: questionMatch[2].replace(/\\_/g, "_").replace(/\\%/g, "%"),
					hasOptions: false,
				};
				continue;
			}

			// Check if this line contains options (which would make it NOT a TITA question)
			if (line.match(/^\([A-Da-d]\)/)) {
				if (currentQuestion) {
					currentQuestion.hasOptions = true;
				}
				continue;
			}

			// Continue question text if it's a multi-line question
			if (currentQuestion && !currentQuestion.hasOptions) {
				currentQuestion.text +=
					" " + line.replace(/\\_/g, "_").replace(/\\%/g, "%");
			}
		}

		// Process the last question
		if (currentQuestion) {
			const isTITA =
				currentQuestion.text.includes("_") ||
				currentQuestion.text.includes("(in") ||
				currentQuestion.text.match(/\s+\.$/) ||
				!currentQuestion.hasOptions;

			if (isTITA) {
				questions.push(formatTITAQuestion(currentQuestion, solutions));
			}
		}

		return questions.join("\n\n");
	};

	const formatTITAQuestion = (question, solutions) => {
		let formattedQuestion = `Q.${question.number}) ${question.text.trim()}`;

		// Ensure question ends with proper spacing for answer
		if (!formattedQuestion.includes("_")) {
			formattedQuestion += " ______";
		}
		formattedQuestion += "\n";

		// Add answer field
		const questionSolution = solutions[question.number];
		if (questionSolution && questionSolution.answer) {
			formattedQuestion += `[Answer]${questionSolution.answer}\n`;
		} else {
			formattedQuestion += `[Answer]\n`;
		}

		// Add solution if available
		if (questionSolution && questionSolution.solution) {
			formattedQuestion += `[S${question.number}] ${questionSolution.solution}`;
		}

		return formattedQuestion;
	};

	const handleConvert = () => {
		if (!inputText.trim()) {
			setOutputText("Please paste your content in the input area.");
			return;
		}

		try {
			const converted = parseTITAContent(inputText);
			setOutputText(
				converted || "No TITA questions found. Please check your input format."
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
					<h1 className="text-3xl font-bold text-green-400 mb-2 flex items-center justify-center gap-2">
						<FileText className="w-8 h-8" />
						Quant TITA Formatter
					</h1>
					<p className="text-gray-400">
						Extract and format TITA (Type In The Answer) questions
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
								className="w-full h-64 p-4 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 resize-none font-mono text-sm"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-300 mb-2">
								Solutions Input (Optional)
							</label>
							<textarea
								value={solutionText}
								onChange={(e) => setSolutionText(e.target.value)}
								placeholder="Format: S1. Solution text here S2. Another solution..."
								className="w-full h-32 p-4 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 resize-none font-mono text-sm"
							/>
						</div>

						<button
							onClick={handleConvert}
							className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
						>
							<Wand2 className="w-5 h-5" />
							Convert to TITA Format
						</button>
					</div>

					{/* Output Section */}
					<div>
						<div className="flex items-center justify-between mb-2">
							<label className="block text-sm font-medium text-gray-300">
								Formatted TITA Output
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
							placeholder="Converted TITA format will appear here..."
							className="w-full h-96 p-4 bg-gray-800 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 resize-none font-mono text-sm"
						/>
					</div>
				</div>

				{/* Instructions */}
				<div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
					<h3 className="text-lg font-semibold text-green-400 mb-3">
						Instructions:
					</h3>
					<div className="space-y-2 text-gray-300 text-sm">
						<p>
							<strong>1. Text Input:</strong> Paste your questions text with
							numbered questions.
						</p>
						<p>
							<strong>2. TITA Detection:</strong> Questions with underscores
							(_), "(in ...)" patterns, or no options are considered TITA.
						</p>
						<p>
							<strong>3. Answer Field:</strong> Empty [Answer] field is provided
							for you to fill in manually.
						</p>
						<p>
							<strong>4. Solutions Input (Optional):</strong> Use format 'S1.
							"answer" Solution text S2. "answer" Another solution...'
						</p>
						<p>
							<strong>5. Output Format:</strong> Questions will be formatted as:
						</p>
						<div className="ml-4 bg-gray-700 p-2 rounded text-xs font-mono">
							Q.1) Question text ______
							<br />
							[Answer]answer here
							<br />
							[S1] Solution here
						</div>
						<p>
							<strong>6. Numbering:</strong> Original question numbering is
							preserved.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default QuantTITAFormater;
