import React, { useState } from "react";
import { Copy, Check, FileText, Sparkles } from "lucide-react";

const TeXConverter = () => {
	const [input, setInput] = useState("");
	const [output, setOutput] = useState("");
	const [copied, setCopied] = useState(false);

	const handleGenerate = () => {
		const parsed = parseTeX(input);
		setOutput(parsed);
	};

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(output);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy text: ", err);
		}
	};

	const convertMathToText = (mathText) => {
		// Remove outer $ symbols
		let text = mathText.replace(/^\$+|\$+$/g, "");

		// Handle fractions - always wrap the entire fraction in brackets for clarity
		text = text.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, (match, num, den) => {
			// Simple numbers don't need parentheses around numerator/denominator
			const needsParensNum = /[+\-*/^_\\]/.test(num) || num.includes(" ");
			const needsParensDen = /[+\-*/^_\\]/.test(den) || den.includes(" ");

			const numerator = needsParensNum ? `(${num})` : num;
			const denominator = needsParensDen ? `(${den})` : den;

			// Always wrap the entire fraction in brackets
			return `(${numerator}/${denominator})`;
		});

		// Handle powers/superscripts - only add parentheses for complex expressions
		text = text.replace(/\^{([^}]+)}/g, (match, power) => {
			const needsParens = power.length > 1 && /[+\-*/]/.test(power);
			return needsParens ? `^(${power})` : `^${power}`;
		});
		text = text.replace(/\^(\d+)/g, "^$1");

		// Handle subscripts
		text = text.replace(/_{([^}]+)}/g, (match, sub) => {
			const needsParens = sub.length > 1 && /[+\-*/]/.test(sub);
			return needsParens ? `_(${sub})` : `_${sub}`;
		});
		text = text.replace(/_(\d+)/g, "_$1");

		// Handle square roots - only parentheses for complex expressions
		text = text.replace(/\\sqrt\{([^}]+)\}/g, (match, content) => {
			const needsParens = /[+\-*/^_\\]/.test(content) && content.length > 1;
			return needsParens ? `√(${content})` : `√${content}`;
		});
		text = text.replace(
			/\\sqrt\[(\d+)\]\{([^}]+)\}/g,
			(match, root, content) => {
				const needsParens = /[+\-*/^_\\]/.test(content) && content.length > 1;
				return needsParens ? `${root}√(${content})` : `${root}√${content}`;
			}
		);

		// Handle Greek letters
		const greekLetters = {
			"\\alpha": "α",
			"\\beta": "β",
			"\\gamma": "γ",
			"\\delta": "δ",
			"\\epsilon": "ε",
			"\\theta": "θ",
			"\\lambda": "λ",
			"\\mu": "μ",
			"\\pi": "π",
			"\\sigma": "σ",
			"\\phi": "φ",
			"\\omega": "ω",
			"\\Gamma": "Γ",
			"\\Delta": "Δ",
			"\\Theta": "Θ",
			"\\Lambda": "Λ",
			"\\Pi": "Π",
			"\\Sigma": "Σ",
			"\\Phi": "Φ",
			"\\Omega": "Ω",
		};

		Object.entries(greekLetters).forEach(([latex, unicode]) => {
			text = text.replace(
				new RegExp(latex.replace("\\", "\\\\"), "g"),
				unicode
			);
		});

		// Handle mathematical operators
		text = text.replace(/\\times/g, "×");
		text = text.replace(/\\div/g, "÷");
		text = text.replace(/\\pm/g, "±");
		text = text.replace(/\\mp/g, "∓");
		text = text.replace(/\\cdot/g, "·");
		text = text.replace(/\\neq/g, "≠");
		text = text.replace(/\\leq/g, "≤");
		text = text.replace(/\\geq/g, "≥");
		text = text.replace(/\\approx/g, "≈");
		text = text.replace(/\\infty/g, "∞");
		text = text.replace(/\\sum/g, "∑");
		text = text.replace(/\\prod/g, "∏");
		text = text.replace(/\\int/g, "∫");

		// Handle parentheses and brackets
		text = text.replace(/\\left\(/g, "(");
		text = text.replace(/\\right\)/g, ")");
		text = text.replace(/\\left\[/g, "[");
		text = text.replace(/\\right\]/g, "]");
		text = text.replace(/\\left\{/g, "{");
		text = text.replace(/\\right\}/g, "}");

		// Handle text commands
		text = text.replace(/\\text\{([^}]+)\}/g, "$1");
		text = text.replace(/\\mathrm\{([^}]+)\}/g, "$1");

		// Handle spacing
		text = text.replace(/\\,/g, " ");
		text = text.replace(/\\;/g, " ");
		text = text.replace(/\\quad/g, "  ");
		text = text.replace(/\\qquad/g, "    ");

		// Clean up extra spaces
		text = text.replace(/\s+/g, " ").trim();

		return text;
	};

	const parseTeX = (tex) => {
		const questionRegex = /\\item\s+(.*?)(?=\\item|\\end\{enumerate\}|$)/gs;

		const matches = [...tex.matchAll(questionRegex)];
		let result = "";

		matches.forEach((match, idx) => {
			let block = match[1].trim();

			// Extract correct answer first
			const correctMatch = block.match(/Correct option\s+([a-dA-D])/i);
			const correctOption = correctMatch ? correctMatch[1].toLowerCase() : null;

			// Remove the "Correct option" line from the block
			block = block.replace(/Correct option\s+[a-dA-D]/i, "").trim();

			// Split by options pattern more carefully
			const optionPattern = /^\s*\(([a-d])\)\s*(.+?)$/gm;
			const optionMatches = [...block.matchAll(optionPattern)];

			// Extract question (everything before first option)
			let question = block;
			if (optionMatches.length > 0) {
				const firstOptionIndex = block.indexOf(optionMatches[0][0]);
				question = block.substring(0, firstOptionIndex).trim();
			}

			// Clean up question text and convert math
			question = question
				.replace(/\\\\/g, " ") // Remove line breaks
				.replace(/\\&/g, "&") // Fix escaped ampersands
				.replace(/\\%/g, "%") // Fix escaped percentages
				.replace(/(\d+)\s*%/g, "$1%") // Remove space between number and %
				.replace(/Rs\.\s*/g, "Rs. ") // Fix currency formatting
				.replace(/\s+/g, " ") // Normalize spaces
				.trim();

			// Convert math expressions in question
			question = question.replace(/\$([^$]+)\$/g, (match, mathContent) => {
				return convertMathToText(mathContent);
			});

			// Extract options
			const options = ["", "", "", ""];
			optionMatches.forEach((optionMatch) => {
				const optionLabel = optionMatch[1];
				let optionText = optionMatch[2]
					.replace(/\\\\/g, "") // Remove line breaks
					.replace(/\\&/g, "&") // Fix escaped ampersands
					.replace(/\\%/g, "%") // Fix percentages
					.replace(/(\d+)\s*%/g, "$1%") // Remove space between number and %
					.replace(/Rs\.\s*/g, "Rs. ") // Fix currency
					.replace(/\s+/g, " ")
					.trim();

				// Convert math expressions in options
				optionText = optionText.replace(
					/\$([^$]+)\$/g,
					(match, mathContent) => {
						return convertMathToText(mathContent);
					}
				);

				const optionIndex = optionLabel.charCodeAt(0) - 97; // Convert 'a' to 0, 'b' to 1, etc.
				if (optionIndex >= 0 && optionIndex < 4) {
					options[optionIndex] = optionText;
				}
			});

			// Generate output
			result += `Q.${idx + 1}) ${question}\n`;
			["a", "b", "c", "d"].forEach((label, i) => {
				const prefix = correctOption === label ? "*" : "";
				result += `${prefix}[${label}] ${options[i] || ""}\n`;
			});
			result += `[S${idx + 1}] Solution\n\n`;
		});

		return result.trim();
	};

	return (
		<div className="min-h-screen bg-gray-50 p-6">
			<div className="max-w-7xl mx-auto space-y-6">
				{/* Header */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
					<div className="flex items-center gap-4">
						<div className="p-2 bg-blue-50 rounded-lg">
							<FileText className="w-6 h-6 text-blue-600" />
						</div>
						<div>
							<h1 className="text-2xl font-semibold text-gray-900">
								LaTeX to MCQ Converter
							</h1>
							<p className="text-gray-600 text-sm mt-1">
								Convert LaTeX mathematical expressions to readable text format
							</p>
						</div>
					</div>
				</div>

				{/* Main Content */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Input Section */}
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
						<div className="flex items-center justify-between mb-4">
							<label className="text-lg font-medium text-gray-900">
								LaTeX Input
							</label>
							<span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
								{input.length} characters
							</span>
						</div>
						<textarea
							rows={20}
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder="Paste your .tex content here..."
							className="w-full p-4 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm leading-relaxed"
						/>
						<div className="mt-4">
							<button
								onClick={handleGenerate}
								disabled={!input.trim()}
								className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
							>
								<Sparkles className="w-4 h-4" />
								Generate Output
							</button>
						</div>
					</div>

					{/* Output Section */}
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
						<div className="flex items-center justify-between mb-4">
							<label className="text-lg font-medium text-gray-900">
								Formatted Output
							</label>
							{output && (
								<div className="flex items-center gap-2">
									<span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
										{output.split("\n").length} lines
									</span>
									<button
										onClick={handleCopy}
										className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm"
									>
										{copied ? (
											<>
												<Check className="w-3 h-3 text-green-600" />
												<span className="text-green-600">Copied</span>
											</>
										) : (
											<>
												<Copy className="w-3 h-3" />
												<span>Copy</span>
											</>
										)}
									</button>
								</div>
							)}
						</div>

						{output ? (
							<textarea
								readOnly
								value={output}
								rows={20}
								className="w-full p-4 font-mono bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-sm resize-none focus:outline-none leading-relaxed"
							/>
						) : (
							<div className="h-80 flex items-center justify-center bg-gray-50 border border-gray-300 rounded-lg border-dashed">
								<div className="text-center text-gray-500">
									<FileText className="w-12 h-12 mx-auto mb-2 opacity-40" />
									<p className="text-sm">Generated output will appear here</p>
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Footer */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
					<div className="text-center text-gray-600 text-sm">
						<p>
							Supports fractions (with brackets), powers, roots, Greek letters,
							and mathematical operators
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default TeXConverter;
